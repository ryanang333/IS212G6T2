import { getOwnSchedule } from "../../../../api/controllers/arrangementRequestsController.js";
import ArrangementRequest from "../../../../api/models/arrangementRequestsModel.js"; 
import httpMocks from "node-mocks-http";
import { mockApprovedRegularArrangementRequest, mockApprovedTemporaryArrangementRequest } from "../../../mock/testHelper.js";
jest.mock("../../../../api/models/arrangementRequestsModel.js");

describe("getOwnSchedule", () => {
  let req, res;
  beforeEach(() => {
    req = httpMocks.createRequest({
      method: "GET",
      url: "/arrangementRequests/myschedule",
      query: {
        startDate: "2024-10-01T16:00:00.000Z",
        endDate: "2024-10-10T16:00:00.000Z",
        staff_id: 140881,
      },
    });
    res = httpMocks.createResponse();
  });

  test("should return a 400 if start date not populated", async () => {
    req.query.startDate = null;
    await getOwnSchedule(req, res);
    expect(res.statusCode).toBe(400);
  });

  test("should return a 400 if end date not populated", async () => {
    req.query.endDate = null; 
    await getOwnSchedule(req, res);
    expect(res.statusCode).toBe(400);
  });

  test("should return a 400 if staff_id is not provided", async () => {
    req.query.staff_id = null; 
    await getOwnSchedule(req, res);
    expect(res.statusCode).toBe(400);
  });

  test("should return a 200 and fetched requests on success", async () => {
    const mockRequests = [
      mockApprovedRegularArrangementRequest, mockApprovedTemporaryArrangementRequest
    ];
    ArrangementRequest.find.mockResolvedValue(mockRequests); 
    await getOwnSchedule(req, res);
    expect(ArrangementRequest.find).toHaveBeenCalledWith({
      staff_id: req.query.staff_id,
      request_date: {
        $gte: req.query.startDate,
        $lte: req.query.endDate,
      },
      status: "Approved",
    });
    expect(res.statusCode).toBe(200);
  });

  test("should return a 500 if an error occurs", async () => {
    ArrangementRequest.find.mockRejectedValue(new Error("Database error"));
    await getOwnSchedule(req, res);
    expect(res.statusCode).toBe(500);
  });
});
