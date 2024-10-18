import { getTeamSchedule } from "../../../../api/controllers/arrangementRequestsController.js";
import ArrangementRequest from "../../../../api/models/arrangementRequestsModel.js";
import httpMocks from "node-mocks-http";
import {
  mockApprovedTempArrangementRequestDept,
  mockStaffIdMap,
} from "../../../mock/testHelper.js";
import { getStaffIdsByDept } from "../../../../api/controllers/staffController.js";
jest.mock("../../../../api/models/arrangementRequestsModel.js");
jest.mock("../../../../api/controllers/staffController.js");
describe("getTeamSchedule", () => {
  let req, res;
  beforeEach(() => {
    req = httpMocks.createRequest({
      method: "GET",
      url: "/arrangementRequests/teamschedule",
      query: {
        startDate: "2024-10-01T16:00:00.000Z",
        endDate: "2024-10-10T16:00:00.000Z",
        dept: "Sales",
      },
    });
    res = httpMocks.createResponse();
  });

  test("should return a 400 if start date not populated", async () => {
    req.query.startDate = null;
    await getTeamSchedule(req, res);
    expect(res.statusCode).toBe(400);
  });

  test("should return a 400 if end date not populated", async () => {
    req.query.endDate = null;
    await getTeamSchedule(req, res);
    expect(res.statusCode).toBe(400);
  });

  test("should return a 400 if dept is not provided", async () => {
    req.query.dept = null;
    await getTeamSchedule(req, res);
    expect(res.statusCode).toBe(400);
  });

  test("should return a 200 and fetched requests on success", async () => {
    getStaffIdsByDept.mockResolvedValue(mockStaffIdMap);
    ArrangementRequest.find.mockResolvedValue(
      mockApprovedTempArrangementRequestDept
    );
    await getTeamSchedule(req, res);
    expect(getStaffIdsByDept).toHaveBeenCalledWith(req.query.dept);
    expect(ArrangementRequest.find).toHaveBeenCalledWith({
      staff_id: {
        $in: Array.from(mockStaffIdMap.keys()),
      },
      request_date: {
        $gte: req.query.startDate,
        $lte: req.query.endDate,
      },
      status: "Approved",
    });
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData().data).toEqual(      
      [
      { AM: 1, PM: 1, name: 'George Floyd' },
      { AM: 0, PM: 1, name: 'Mari Kita' },
      { AM: 1, PM: 0, name: 'Dick Lee' }
    ]);
  });

  test("should return a 500 if an error fetching staff occurs", async () => {
    getStaffIdsByDept.mockRejectedValue(new Error("Database error"));
    await getTeamSchedule(req, res);
    expect(res.statusCode).toBe(500);
  });

  test("should return a 500 if an error fetching requests occurs", async () => {
    ArrangementRequest.mockRejectedValue(new Error("Database error"));
    await getTeamSchedule(req, res);
    expect(res.statusCode).toBe(500);
  });
});
