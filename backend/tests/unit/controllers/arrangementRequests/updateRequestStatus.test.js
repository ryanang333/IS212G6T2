import { updateRequestStatus } from "../../../../api/controllers/arrangementRequestsController";
import httpMocks from "node-mocks-http";
import ArrangementRequest from "../../../../api/models/arrangementRequestsModel";

// Mocking the database model
jest.mock('../../../../api/models/arrangementRequestsModel');

describe("updateRequestStatus - Unit Tests", () => {
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

  test("should return 200 and update requests successfully (happy case)", async () => {
    // Mock the database updateMany method to resolve successfully
    ArrangementRequest.updateMany.mockResolvedValue({ modifiedCount: 2 });

    req.body.requestIds = ["requestId1", "requestId2"]; // Mocked request IDs

    await updateRequestStatus(req, res);

    expect(ArrangementRequest.updateMany).toHaveBeenCalledWith(
      { _id: { $in: req.body.requestIds } }, // Query to update the requests
      { status: req.body.status, withdraw_reason: req.body.withdraw_reason } // New data
    );
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({ message: "Requests updated successfully" });
  });

  test("should return 400 if no request IDs are provided", async () => {
    req.body.requestIds = []; // Empty request IDs array

    await updateRequestStatus(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ message: "No request IDs provided" });
  });


  test("should return 400 if no withdrawal reason is provided", async () => {
    req.body.requestIds = ["requestId1"];
    req.body.withdraw_reason = ""; // No withdrawal reason provided

    await updateRequestStatus(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ message: "Withdrawal reason is required" });
  });

  test("should return 500 if database error occurs", async () => {
    // Mock the database updateMany method to throw an error
    ArrangementRequest.updateMany.mockRejectedValue(new Error("Database error"));

    req.body.requestIds = ["requestId1", "requestId2"];

    await updateRequestStatus(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({ message: "Internal server error" });
  });
});
