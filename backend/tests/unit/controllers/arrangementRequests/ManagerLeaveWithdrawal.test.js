import { updateRequestStatus } from "../../../../api/controllers/arrangementRequestsController";
import mongoose from "mongoose";
import httpMocks from "node-mocks-http";
import ArrangementRequest from '../../../../api/models/arrangementRequestsModel';
import { MongoMemoryServer } from 'mongodb-memory-server-core';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoURI = mongoServer.getUri();
  await mongoose.connect(mongoURI);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

afterEach(async () => {
  await ArrangementRequest.deleteMany({});
});

describe("updateRequestStatus - Integration Test with MongoDB", () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest({
      method: "POST",
      url: "/arrangementRequests/update-status",
      body: {
        requestIds: [],
        status: "Pending Withdrawal",
        withdraw_reason: "Project deadline",
      },
      user: {
        manager_id: 140008, // The manager doing the withdrawal
      },
    });
    res = httpMocks.createResponse();
  });

  test("should allow the manager to withdraw leave for direct subordinates", async () => {
    // Insert mock data into in-memory MongoDB
    const testRequest1 = new ArrangementRequest({
      staff_id: 140881,
      request_date: new Date("2024-10-03T16:00:00.000Z"),
      status: "Approved",
      manager_id: 140008, // Matching manager ID (direct subordinate)
      group_id: null,
      request_time: "PM",
      reason: "Child care",
    });
    const testRequest2 = new ArrangementRequest({
      staff_id: 140882,
      request_date: new Date("2024-10-08T16:00:00.000Z"),
      status: "Approved",
      manager_id: 140008, // Matching manager ID (direct subordinate)
      group_id: null,
      request_time: "PM",
      reason: "Vacation",
    });

    await testRequest1.save();
    await testRequest2.save();

    req.body.requestIds = [testRequest1._id, testRequest2._id]; // Set request IDs to withdraw

    await updateRequestStatus(req, res);

    const response = res._getJSONData();
    expect(res.statusCode).toBe(200);
    expect(response.message).toBe('Requests updated successfully');

    // Verify database update
    const updatedRequest1 = await ArrangementRequest.findById(testRequest1._id);
    const updatedRequest2 = await ArrangementRequest.findById(testRequest2._id);

    expect(updatedRequest1.status).toBe("Pending Withdrawal");
    expect(updatedRequest1.withdraw_reason).toBe("Project deadline");
    expect(updatedRequest2.status).toBe("Pending Withdrawal");
    expect(updatedRequest2.withdraw_reason).toBe("Project deadline");
  });

  test("should return a 400 if no withdrawal reason is provided", async () => {
    const testRequest = new ArrangementRequest({
      staff_id: 140881,
      request_date: new Date("2024-10-03T16:00:00.000Z"),
      status: "Approved",
      manager_id: 140008,
      group_id: null,
      request_time: "PM",
      reason: "Personal",
    });

    await testRequest.save();

    req.body.requestIds = [testRequest._id]; // Set request ID to withdraw
    req.body.withdraw_reason = ""; // No reason provided

    await updateRequestStatus(req, res);

    const response = res._getJSONData();
    expect(res.statusCode).toBe(400);
    expect(response.message).toBe("Withdrawal reason is required");
  });

  test("should return a 403 if the manager is not authorized to withdraw", async () => {
    const unauthorizedRequest = new ArrangementRequest({
      staff_id: 140883,
      request_date: new Date("2024-10-10T16:00:00.000Z"),
      status: "Approved",
      manager_id: 54321, // Different manager ID
      group_id: null,
      request_time: "PM",
      reason: "Vacation",
    });

    await unauthorizedRequest.save();

    req.body.requestIds = [unauthorizedRequest._id];
    req.user.manager_id = 140008; // The current user is not the correct manager

    await updateRequestStatus(req, res);

    expect(res.statusCode).toBe(403);
    expect(res._getJSONData()).toEqual({ message: 'Unauthorized' });
  });

  test("should return a 500 if a database error occurs", async () => {
    jest.spyOn(ArrangementRequest, "updateMany").mockImplementation(() => {
      throw new Error("Database error");
    });

    req.body.requestIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()]; // Valid ObjectIds

    await updateRequestStatus(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getData()).toBe(JSON.stringify({ message: "Internal server error" }));
  });
});
