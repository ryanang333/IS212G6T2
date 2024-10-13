import { updateRequestStatus } from "../../api/controllers/arrangementRequestsController.js";
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

describe("updateRequestStatus - Integration Test with MongoDB", () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest({
      method: "POST",
      url: "/arrangementRequests/update-status",
      body: {
        requestIds: [],
        status: "Pending Withdrawal",
        withdraw_reason: "Need to cancel",
      },
    });
    res = httpMocks.createResponse();
  });

  test("should update the status of multiple requests successfully", async () => {
    // Insert mock data into in-memory database
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

    req.body.requestIds = [request1._id, request2._id]; // Set request IDs to be updated
    req.body.status = "Pending Withdrawal";
    req.body.withdraw_reason = "Need to cancel";

    await updateRequestStatus(req, res);

    // Assert the response
    const response = res._getJSONData();
    expect(res.statusCode).toBe(200);
    expect(response.message).toBe("Requests updated successfully");

    // Verify that the database was updated
    const updatedRequest1 = await ArrangementRequest.findById(request1._id);
    const updatedRequest2 = await ArrangementRequest.findById(request2._id);

    expect(updatedRequest1.status).toBe("Pending Withdrawal");
    expect(updatedRequest1.withdraw_reason).toBe("Need to cancel");
    expect(updatedRequest2.status).toBe("Pending Withdrawal");
    expect(updatedRequest2.withdraw_reason).toBe("Need to cancel");
  });

  test("should return a 400 if no request IDs are provided", async () => {
    req.body.requestIds = []; // Empty requestIds array

    await updateRequestStatus(req, res);

    // Assert the response
    const response = res._getJSONData();
    expect(res.statusCode).toBe(400);
    expect(response.message).toBe("No request IDs provided");
  });

  test("should return a 500 if a database error occurs", async () => {
    // Mock the updateMany function to throw an error
    jest.spyOn(ArrangementRequest, "updateMany").mockImplementation(() => {
      throw new Error("Database error");
    });

    req.body.requestIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()]; // Valid ObjectId format but database will throw an error

    await updateRequestStatus(req, res);

    // Assert the response
    expect(res.statusCode).toBe(500);
    expect(res._getData()).toBe(JSON.stringify({ message: "Internal server error" }));
  });
});
