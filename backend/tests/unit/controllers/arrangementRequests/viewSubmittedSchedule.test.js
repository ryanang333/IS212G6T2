import { getStaffArrangementRequests } from "../../../../api/controllers/arrangementRequestsController.js";
import ArrangementRequest from "../../../../api/models/arrangementRequestsModel.js";
import httpMocks from "node-mocks-http";
import {
  mockApprovedRegularArrangementRequest,
  mockApprovedTemporaryArrangementRequest,
} from "../../../mock/testHelper.js";
jest.mock("../../../../api/models/arrangementRequestsModel.js");

describe("getStaffArrangementRequests", () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest({
      method: "GET",
      url: "/arrangementRequests/getStaffArrangementRequests",
      query: {
        staff_id: 140881,
      },
    });
    res = httpMocks.createResponse();
  });

  test("should return a 400 if staff_id is not provided", async () => {
    req.query.staff_id = null;
    await getStaffArrangementRequests(req, res);
    expect(res.statusCode).toBe(400);
  });

  test("should return a 200 and fetched requests on success", async () => {
    ArrangementRequest.find.mockResolvedValue([
      mockApprovedRegularArrangementRequest,
      mockApprovedTemporaryArrangementRequest,
    ]);

    await getStaffArrangementRequests(req, res);

    expect(ArrangementRequest.find).toHaveBeenCalledWith({
      staff_id: Number(req.query.staff_id),
    });

    expect(res.statusCode).toBe(200);
    const response = res._getJSONData();
    expect(response.data.length).toBe(2);
  });

  test("should return a 404 if no requests found", async () => {
    ArrangementRequest.find.mockResolvedValue([]);

    await getStaffArrangementRequests(req, res);

    expect(res.statusCode).toBe(404);
    expect(JSON.parse(res._getData())).toEqual({
      message: "No arrangement requests found for this staff",
    });
  });

  test("should return a 500 if an error occurs", async () => {
    const errorMessage = "Database error";
    ArrangementRequest.find.mockRejectedValue(new Error(errorMessage));

    await getStaffArrangementRequests(req, res);
    expect(res.statusCode).toBe(500);
  });
});