import { getOwnSchedule } from "../../api/controllers/arrangementRequestsController.js";
import mongoose from "mongoose";
import httpMocks from "node-mocks-http";
import ArrangementRequest from "../../api/models/arrangementRequestsModel.js";
import dotenv from "dotenv";

dotenv.config();

const mongoURI = process.env.MONGODB_URI_TEST;

beforeAll(async () => {
  await mongoose.connect(mongoURI);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await delay(2000);
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
afterEach(async () => {
  await ArrangementRequest.deleteMany({});
  await delay(100);
});

describe("getOwnSchedule - Integration Test with MongoDB", () => {
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

  test("should return a 200 and fetched requests on success", async () => {
    const testRequest1 = new ArrangementRequest({
      staff_id: 140881,
      request_date: new Date("2024-10-03T16:00:00.000Z"),
      status: "Approved",
      manager_id: 140008,
      group_id: null,
      request_time: "PM",
      reason: "Child carer",
    });
    const testRequest2 = new ArrangementRequest({
      staff_id: 140881,
      request_date: new Date("2024-10-08T16:00:00.000Z"),
      status: "Approved",
      manager_id: 140008,
      group_id: null,
      request_time: "PM",
      reason: "Child carer",
    });
    await testRequest1.save();
    await testRequest2.save();

    await getOwnSchedule(req, res);

    const response = res._getJSONData();
    expect(res.statusCode).toBe(200);
    expect(response.data.length).toBe(2);
    expect(response.data).toEqual([
      expect.objectContaining({
        staff_id: 140881,
        request_date: new Date("2024-10-03T16:00:00.000Z").toISOString(),
        status: "Approved",
        manager_id: 140008,
        group_id: null,
        request_time: "PM",
        reason: "Child carer",
      }),
      expect.objectContaining({
        staff_id: 140881,
        request_date: new Date("2024-10-08T16:00:00.000Z").toISOString(),
        status: "Approved",
        manager_id: 140008,
        group_id: null,
        request_time: "PM",
        reason: "Child carer",
      }),
    ]);
  });

  test("should return a 500 if database error occurs", async () => {
    jest.spyOn(ArrangementRequest, "find").mockImplementation(() => {
      throw new Error("Database error");
    });
    await getOwnSchedule(req, res);
    expect(res.statusCode).toBe(500);
  });
});
