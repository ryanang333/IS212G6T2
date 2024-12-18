import {
  rejectStaffRequests,
  extractIdsWithStatus,
} from "../../../../api/controllers/arrangementRequestsController";
import httpMocks from "node-mocks-http";
import ArrangementRequest from "../../../../api/models/arrangementRequestsModel";

// Mocking the database model
jest.mock("../../../../api/models/arrangementRequestsModel");

jest.setTimeout(100000);

describe("rejectStaffRequests - Unit Tests", () => {
  let req, res;
  const reason = "Test rejection reason";

  beforeEach(() => {
    req = httpMocks.createRequest({
      method: "PATCH",
      url: "/arrangementRequests/staffrejection",
      body: {
        requests: [],
        reason: reason,
      },
    });
    res = httpMocks.createResponse();
  });

  test("should return 200 and reject request successfully for an ad-hoc request(happy case)", async () => {
    ArrangementRequest.updateMany.mockResolvedValue({ modifiedCount: 1 });
    const uncleanReq = [
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
    req.body.requests = uncleanReq;

    const cleanedRequestsId = extractIdsWithStatus(uncleanReq, "Pending");
    await rejectStaffRequests(req, res);

    expect(ArrangementRequest.updateMany).toHaveBeenCalledWith(
      { _id: { $in: cleanedRequestsId } },
      {
        status: "Rejected",
        manager_reason: reason,
      }
    );
    expect(res.statusCode).toBe(200);
  });

  test("should return 200 and reject requests successfully for a recurring regular request(happy case)", async () => {
    ArrangementRequest.updateMany.mockResolvedValue({ modifiedCount: 2 });
    const uncleanReq = [
      {
        _id: "6707b36f5f19a670ff83aab8",
        staff_id: 140881,
        request_date: "December 30, 2024",
        status: "Pending",
        manager_id: 140008,
        group_id: "Pending",
        request_time: "AM",
        reason: "Test request 1",
        __v: 0,
      },
      {
        _id: "6707b4045f19a670ff83aab9",
        staff_id: 140881,
        request_date: "December 30, 2024",
        status: "Approved",
        manager_id: 140008,
        group_id: "testing",
        request_time: "PM",
        reason: "Test request 1",
        __v: 0,
      },
    ];

    req.body.requests = uncleanReq;

    const cleanedRequestsId = extractIdsWithStatus(uncleanReq, "Pending");
    await rejectStaffRequests(req, res);

    expect(ArrangementRequest.updateMany).toHaveBeenCalledWith(
      { _id: { $in: cleanedRequestsId } },
      {
        status: "Rejected",
        manager_reason: reason,
      }
    );
    expect(res.statusCode).toBe(200);
  });

  test("should return 400 if no requests are provided", async () => {
    await rejectStaffRequests(req, res);
    expect(res.statusCode).toBe(400);
    expect(res._getJSONData().message).toEqual(
      "Please provide valid requests to reject"
    );
  });

  test("should return a 400 if no reason is provided", async () => {
    req.body.requests = [
      {
        _id: "6707b36f5f19a670ff83aab8",
        staff_id: 140881,
        request_date: "December 30, 2024",
        status: "Approved",
        manager_id: 140008,
        group_id: "testing",
        request_time: "AM",
        reason: "Test request 1",
        __v: 0,
      },
    ];
    req.body.reason = null;
    await rejectStaffRequests(req, res);
    expect(res.statusCode).toBe(400);
    expect(res._getJSONData().message).toEqual(
      "Please provide a reason for rejection"
    );
  });

  test("should return a 400 if none of the requests are Pending", async () => {
    req.body.requests = req.body.requests = [
      {
        _id: "6707b36f5f19a670ff83aab8",
        staff_id: 140881,
        request_date: "December 30, 2024",
        status: "Withdrawn",
        manager_id: 140008,
        group_id: "testing",
        request_time: "AM",
        reason: "Test request 1",
        __v: 0,
      },
      {
        _id: "6707b4045f19a670ff83aab9",
        staff_id: 140881,
        request_date: "December 30, 2024",
        status: "Approved",
        manager_id: 140008,
        group_id: "testing",
        request_time: "PM",
        reason: "Test request 1",
        __v: 0,
      },
    ];

    await rejectStaffRequests(req, res);
    expect(res.statusCode).toBe(400);
  });

  test("should return 500 if database error occurs", async () => {
    req.body.requests = [
      {
        _id: "6707b36f5f19a670ff83aab8",
        staff_id: 140881,
        request_date: "December 30, 2024",
        status: "Pending",
        manager_id: 140008,
        group_id: "testing",
        request_time: "AM",
        reason: "Test request 1",
        __v: 0,
      },
    ];
    ArrangementRequest.updateMany.mockRejectedValue(
      new Error("Database error")
    );
    await rejectStaffRequests(req, res);
    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({ message: "Internal server error" });
  });
});
