import { cancelStaffRequests } from "../../api/controllers/arrangementRequestsController.js";
import mongoose from "mongoose";
import httpMocks from "node-mocks-http";
import ArrangementRequest from "../../api/models/arrangementRequestsModel.js";
import { MongoMemoryServer } from "mongodb-memory-server-core";

let mongoServer;

// Setup in-memory MongoDB
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoURI = mongoServer.getUri();
  await mongoose.connect(mongoURI);
});

// Cleanup the MongoDB instance after all tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

// Clean up data after each test
afterEach(async () => {
  await ArrangementRequest.deleteMany({});
});

describe("cancelStaffRequests - Integration Test with MongoDB", () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest({
      method: "PATCH",
      url: "/arrangementRequests/staffcancellation",
      body: {
        requests: [],
      },
    });
    res = httpMocks.createResponse();
  });

  test("should update the status of an ad-hoc request successfully", async () => {
    const request1 = new ArrangementRequest({
      staff_id: 140881,
      request_date: new Date("2024-10-03T16:00:00.000Z"),
      status: "Pending",
      manager_id: 140008,
      group_id: null,
      request_time: "PM",
      reason: "Child carer",
    });
    await request1.save();

    req.body.requests = [request1];

    await cancelStaffRequests(req, res);

    const response = res._getJSONData();
    expect(res.statusCode).toBe(200);
    expect(response.message).toBe(
      "Requests have been cancelled successfully!"
    );

    const updatedRequest1 = await ArrangementRequest.findById(request1._id);
    expect(updatedRequest1.status).toBe("Cancelled");
  });

  test("should update the status of a regular request successfully", async () => {
    const request1 = new ArrangementRequest({
      staff_id: 140881,
      request_date: new Date("2024-10-03T16:00:00.000Z"),
      status: "Pending",
      manager_id: 140008,
      group_id: null,
      request_time: "PM",
      reason: "Child carer",
    });
    const request2 = new ArrangementRequest({
      staff_id: 140881,
      request_date: new Date("2024-10-08T16:00:00.000Z"),
      status: "Pending",
      manager_id: 140008,
      group_id: null,
      request_time: "PM",
      reason: "Personal reasons",
    });

    await request1.save();
    await request2.save();

    req.body.requests = [request1, request2];

    await cancelStaffRequests(req, res);

    const response = res._getJSONData();
    expect(res.statusCode).toBe(200);
    expect(response.message).toBe(
      "Requests have been cancelled successfully!"
    );

    const updatedRequest1 = await ArrangementRequest.findById(request1._id);
    const updatedRequest2 = await ArrangementRequest.findById(request2._id);

    expect(updatedRequest1.status).toBe("Cancelled");
    expect(updatedRequest2.status).toBe("Cancelled");
  });

  test("should return a 500 if database error occurs", async () => {
    req.body.requests = [
      {
        _id: "6707b42d5f19a670ff83aabb",
        staff_id: 140881,
        request_date: "December 30, 2024",
        status: "Pending",
        manager_id: 140008,
        group_id: null,
        request_time: "PM",
        reason: "Test request 1",
        __v: 0,
      },
    ];
    jest.spyOn(ArrangementRequest, "updateMany").mockImplementation(() => {
      throw new Error("Database error");
    });
    await cancelStaffRequests(req, res);
    expect(res.statusCode).toBe(500);
  });

  test("should return a 400 if request does not contain pending request", async () => {
    req.body.requests = [
      {
        _id: "6707b42d5f19a670ff83aabb",
        staff_id: 140881,
        request_date: "December 30, 2024",
        status: "Approved",
        manager_id: 140008,
        group_id: null,
        request_time: "PM",
        reason: "Test request 1",
        __v: 0,
        withdraw_reason: "cancel lagh",
      },
    ];
    await cancelStaffRequests(req, res);
    expect(res.statusCode).toBe(400);
  });
});
