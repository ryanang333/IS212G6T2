import { getArrangementRequests } from "../../../../api/controllers/arrangementRequestsController.js";
import ArrangementRequest from "../../../../api/models/arrangementRequestsModel.js";
import httpMocks from "node-mocks-http";
import {
  mockApprovedRegularArrangementRequest,
  mockApprovedTemporaryArrangementRequest,
} from "../../../mock/testHelper.js";
jest.mock("../../../../api/models/arrangementRequestsModel.js");

describe("getArrangementRequests", () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest({
      method: "GET",
      url: "/arrangementRequests/getArrangementRequests",
      query: {
        manager_id: 123,
      },
    });
    res = httpMocks.createResponse();
  });

  test("should return a 400 if manager_id is not provided", async () => {
    req.query.manager_id = null;
    await getArrangementRequests(req, res);
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: "manager_id is required",
    });
  });

  test("should return a 200 and fetched arrangement requests on success", async () => {
    ArrangementRequest.find.mockReturnValue({
      populate: jest
        .fn()
        .mockResolvedValue([
          mockApprovedRegularArrangementRequest,
          mockApprovedTemporaryArrangementRequest,
        ]),
    });

    await getArrangementRequests(req, res);

    expect(ArrangementRequest.find).toHaveBeenCalledWith({
      manager_id: 123,
      status: { $in: ["Pending", "Approved"] },
    });
    expect(res.statusCode).toBe(200);
    const response = res._getJSONData();
    expect(response.length).toBe(2);
  });

  test("should return a 404 if no arrangement requests are found", async () => {
    ArrangementRequest.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue([]),
    });

    await getArrangementRequests(req, res);

    expect(res.statusCode).toBe(404);
    expect(JSON.parse(res._getData())).toEqual({
      message: "No arrangement requests found for this manager",
    });
  });

  test("should return a 500 if an error occurs", async () => {
    const errorMessage = "Database error";
    ArrangementRequest.find.mockReturnValue({
      populate: jest.fn().mockRejectedValue(new Error(errorMessage)),
    });

    await getArrangementRequests(req, res);

    expect(res.statusCode).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({ error: errorMessage });
  });
});
