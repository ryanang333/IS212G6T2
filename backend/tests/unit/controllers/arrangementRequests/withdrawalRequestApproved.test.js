import {
    ApproveWithdrawalRequest,
    extractIdsWithStatus,
  } from "../../../../api/controllers/arrangementRequestsController";
  import httpMocks from "node-mocks-http";
  import ArrangementRequest from "../../../../api/models/arrangementRequestsModel";
  
  // Mocking the database model
  jest.mock("../../../../api/models/arrangementRequestsModel");
  
  describe("ApproveWithdrawalRequest - Unit Tests", () => {
    let req, res;
  
    beforeEach(() => {
      req = httpMocks.createRequest({
        method: "PATCH",
        url: "/arrangementRequests/approveWithdrawal",
        body: {
          requests: [],
        },
      });
      res = httpMocks.createResponse();
    });
  
    test("should return 200 and approve request successfully for an ad-hoc request (happy case)", async () => {
      ArrangementRequest.updateMany.mockResolvedValue({ modifiedCount: 1 });
      const uncleanReq = [
        {
          _id: "6707b42d5f19a670ff83aabb",
          staff_id: 140881,
          request_date: "December 30, 2024",
          status: "Pending Withdrawal",
          manager_id: 140008,
          group_id: null,
          request_time: "PM",
          reason: "Test request 1",
          __v: 0,
        },
      ];
  
      req.body.requests = uncleanReq;
      const cleanedRequestsId = extractIdsWithStatus(uncleanReq, "Pending Withdrawal");
      await ApproveWithdrawalRequest(req, res);
      expect(ArrangementRequest.updateMany).toHaveBeenCalledWith(
        { _id: { $in: cleanedRequestsId } },
        {
          status: "Withdrawn",
        }
      );
      expect(res.statusCode).toBe(200);
    });
  
    test("should return 200 and approve requests successfully for a recurring regular request (happy case)", async () => {
      ArrangementRequest.updateMany.mockResolvedValue({ modifiedCount: 1 });
      const uncleanReq = [
        {
          _id: "6707b36f5f19a670ff83aab8",
          staff_id: 140881,
          request_date: "December 30, 2024",
          status: "Pending Withdrawal",
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
          status: "Pending Withdrawal",
          manager_id: 140008,
          group_id: "testing",
          request_time: "PM",
          reason: "Test request 2",
          __v: 0,
        },
      ];
  
      req.body.requests = uncleanReq;
  
      const cleanedRequestsId = extractIdsWithStatus(uncleanReq, "Pending Withdrawal");
      await ApproveWithdrawalRequest(req, res);
  
      expect(ArrangementRequest.updateMany).toHaveBeenCalledWith(
        { _id: { $in: cleanedRequestsId } },
        {
          status: "Withdrawn",
        }
      );
      expect(res.statusCode).toBe(200);
    });
  
    test("should return 400 if no requests are provided", async () => {
      await ApproveWithdrawalRequest(req, res);
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData().message).toEqual(
        "Please provide valid requests to approve"
      );
    });
  
    test("should return a 400 if none of the requests are Pending Withdrawal", async () => {
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
        {
          _id: "6707b4045f19a670ff83aab9",
          staff_id: 140881,
          request_date: "December 30, 2024",
          status: "Cancelled",
          manager_id: 140008,
          group_id: "testing",
          request_time: "PM",
          reason: "Test request 2",
          __v: 0,
        },
      ];
  
      await ApproveWithdrawalRequest(req, res);
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData().message).toEqual(
        "Please provide at least one pending withdrawal request to approve"
      );
    });
  
    test("should return 500 if database error occurs", async () => {
      req.body.requests = [
        {
          _id: "6707b36f5f19a670ff83aab8",
          staff_id: 140881,
          request_date: "December 30, 2024",
          status: "Pending Withdrawal",
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
      await ApproveWithdrawalRequest(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: "Internal server error" });
    });
  });
  