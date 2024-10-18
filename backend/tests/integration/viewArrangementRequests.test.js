import { getArrangementRequests } from "../../api/controllers/arrangementRequestsController.js";
import mongoose from "mongoose";
import httpMocks from "node-mocks-http";
import ArrangementRequest from "../../api/models/arrangementRequestsModel.js";
import { MongoMemoryServer } from 'mongodb-memory-server-core';

let mongoServer;

jest.setTimeout(120000);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoURI = mongoServer.getUri();
  await mongoose.connect(mongoURI);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

afterEach(async () => {
  await ArrangementRequest.deleteMany({});
});

describe("viewArrangementRequests - Integration Test with MongoDB", () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest({
      method: "GET",
      url: "/arrangementRequests/",
      query: {
        manager_id: 140008,
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

    await getArrangementRequests(req, res);

    const response = res._getJSONData();
    expect(res.statusCode).toBe(200);
    expect(response.length).toBe(2);
    expect(response).toEqual([
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
    await getArrangementRequests(req, res);
    expect(res.statusCode).toBe(500);
  });
});
