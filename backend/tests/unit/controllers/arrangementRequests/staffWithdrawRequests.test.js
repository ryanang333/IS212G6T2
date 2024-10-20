import {
  withdrawStaffRequests,
  extractIdsWithStatus,
} from "../../../../api/controllers/arrangementRequestsController";
import httpMocks from "node-mocks-http";
import ArrangementRequest from "../../../../api/models/arrangementRequestsModel";

// Mocking the database model
jest.mock("../../../../api/models/arrangementRequestsModel");

describe("withdrawStaffRequests - Unit Tests", () => {
  let req, res;
  const reason = "Test withdrawal reason";

  beforeEach(() => {
    req = httpMocks.createRequest({
      method: "PATCH",
      url: "/arrangementRequests/staffwithdrawal",
      body: {
        requests: [],
        reason: reason,
      },
    });
    res = httpMocks.createResponse();
  });

  test("should return 200 and withdraw requests successfully for an ad-hoc request(happy case)", async () => {
    ArrangementRequest.updateMany.mockResolvedValue({ modifiedCount: 1 });
    const uncleanReq = [
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
    req.body.requests = uncleanReq;

    const cleanedRequestsId = extractIdsWithStatus(uncleanReq, "Approved");
    await withdrawStaffRequests(req, res);

    expect(ArrangementRequest.updateMany).toHaveBeenCalledWith(
      { _id: { $in: cleanedRequestsId } },
      {
        status: "Pending Withdrawal",
        withdraw_reason: reason,
      }
    );
    expect(res.statusCode).toBe(200);
  });

  test("should return 200 and withdraw requests successfully for a recurring regular request(happy case)", async () => {
    ArrangementRequest.updateMany.mockResolvedValue({ modifiedCount: 2 });
    const uncleanReq = [
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

    const cleanedRequestsId = extractIdsWithStatus(uncleanReq, "Approved");
    await withdrawStaffRequests(req, res);

    expect(ArrangementRequest.updateMany).toHaveBeenCalledWith(
      { _id: { $in: cleanedRequestsId } },
      {
        status: "Pending Withdrawal",
        withdraw_reason: reason,
      }
    );
    expect(res.statusCode).toBe(200);
  });

  test("should return 400 if no requests are provided", async () => {
    await withdrawStaffRequests(req, res);
    expect(res.statusCode).toBe(400);
    expect(res._getJSONData().message).toEqual(
      "Please provide valid requests to withdraw"
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
    await withdrawStaffRequests(req, res);
    expect(res.statusCode).toBe(400);
    expect(res._getJSONData().message).toEqual(
      "Please provide a valid reason to withdraw"
    );
  });

  test("should return a 400 if none of the requests are Approved", async () => {
    req.body.requests = req.body.requests = [
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
      {
        _id: "6707b4045f19a670ff83aab9",
        staff_id: 140881,
        request_date: "December 30, 2024",
        status: "Pending",
        manager_id: 140008,
        group_id: "testing",
        request_time: "PM",
        reason: "Test request 1",
        __v: 0,
      },
    ];

    await withdrawStaffRequests(req, res);
    expect(res.statusCode).toBe(400);
  });

  test("should return 500 if database error occurs", async () => {
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
    ArrangementRequest.updateMany.mockRejectedValue(
      new Error("Database error")
    );
    await withdrawStaffRequests(req, res);
    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({ message: "Internal server error" });
  });
});

describe("extractIdsWithStatus - Unit Tests", () => {
  test("should return an empty array if all requests do not match the status", async () => {
    const status = "Pending";
    const uncleanReq = [
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
      {
        _id: "6707b42d5f19a670ff83aabb",
        staff_id: 140881,
        request_date: "December 30, 2024",
        status: "Cancelled",
        manager_id: 140008,
        group_id: null,
        request_time: "PM",
        reason: "Test request 1",
        __v: 0,
        withdraw_reason: "cancel lagh",
      },
    ];

    const cleanedReq = extractIdsWithStatus(uncleanReq, status);
    expect(cleanedReq.length).toBe(0);
    expect(cleanedReq).toEqual([]);
  });

  test("should return an array of ids of length 2, if the reqArray contains 2 request which satisfy the status requirement", async () => {
    const status = "Pending";
    const uncleanReq = [
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
        withdraw_reason: "cancel lagh",
      },
      {
        _id: "6737g42d5f12a670f283aabb",
        staff_id: 140881,
        request_date: "December 30, 2024",
        status: "Pending",
        manager_id: 140008,
        group_id: null,
        request_time: "PM",
        reason: "Test request 1",
        __v: 0,
        withdraw_reason: "cancel lagh",
      },
    ];

    const cleanedReq = extractIdsWithStatus(uncleanReq, status);
    expect(cleanedReq.length).toBe(2);
    expect(cleanedReq).toEqual([
      "6707b42d5f19a670ff83aabb",
      "6737g42d5f12a670f283aabb",
    ]);
  });

  test("should return an array of ids of length 2, if the reqArray contains 2 request which satisfy the status requirement", async () => {
    const status = "Cancelled";
    const uncleanReq = [
      {
        _id: "6707b02d5f12a670ff83aabb",
        staff_id: 140881,
        request_date: "December 30, 2024",
        status: "Cancelled",
        manager_id: 140008,
        group_id: null,
        request_time: "PM",
        reason: "Test request 1",
        __v: 0,
        withdraw_reason: "cancel lagh",
      },
      {
        _id: "6707b42d5f19a670ff83aabb",
        staff_id: 140881,
        request_date: "December 30, 2024",
        status: "Cancelled",
        manager_id: 140008,
        group_id: null,
        request_time: "PM",
        reason: "Test request 1",
        __v: 0,
        withdraw_reason: "cancel lagh",
      },
      {
        _id: "6737g42d5f12a670f283aabb",
        staff_id: 140881,
        request_date: "December 30, 2024",
        status: "Cancelled",
        manager_id: 140008,
        group_id: null,
        request_time: "PM",
        reason: "Test request 1",
        __v: 0,
        withdraw_reason: "cancel lagh",
      },
    ];

    const cleanedReq = extractIdsWithStatus(uncleanReq, status);
    expect(cleanedReq.length).toBe(3);
    expect(cleanedReq).toEqual([
      "6707b02d5f12a670ff83aabb",
      "6707b42d5f19a670ff83aabb",
      "6737g42d5f12a670f283aabb",
    ]);
  });
});
