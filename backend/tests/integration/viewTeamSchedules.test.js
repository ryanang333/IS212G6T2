import { getTeamSchedule } from "../../api/controllers/arrangementRequestsController.js";
import mongoose from "mongoose";
import httpMocks from "node-mocks-http";
import ArrangementRequest from "../../api/models/arrangementRequestsModel.js";
import Staff from "../../api/models/staffModel.js";
import { MongoMemoryServer } from 'mongodb-memory-server-core';

let mongoServer;

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
  await Staff.deleteMany({});
});

describe("getTeamSchedule - Integration Test with MongoDB", () => {
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

  test("should return a 200 but return an empty array if no one in department", async () => {
    await getTeamSchedule(req, res);
    const response = res._getJSONData();
    expect(res.statusCode).toBe(200);
    expect(response.data.length).toBe(0);
  });

  test("should return a 200 but return an empty array if no requests for the department", async () => {
    const staffArray = [
      {
        staff_id: 140001,
        staff_fname: "Derek",
        staff_lname: "Tan",
        dept: "Sales",
        position: "Director",
        country: "Singapore",
        email: "Derek.Tan@allinone.com.sg",
        reporting_manager: 130002,
        role: 1,
      },
      {
        staff_id: 140894,
        staff_fname: "Rahim",
        staff_lname: "Khalid",
        dept: "Sales",
        position: "Sales Manager",
        country: "Singapore",
        email: "Rahim.Khalid@allinone.com.sg",
        reporting_manager: 140001,
        role: 3,
      },
      {
        staff_id: 140002,
        staff_fname: "Susan",
        staff_lname: "Goh",
        dept: "Sales",
        position: "Account Manager",
        country: "Singapore",
        email: "Susan.Goh@allinone.com.sg",
        reporting_manager: 140894,
        role: 2,
      },
    ];
    await Staff.insertMany(staffArray);
    await getTeamSchedule(req, res);
    const response = res._getJSONData();
    expect(res.statusCode).toBe(200);
    expect(response.data.length).toBe(0);
  });
  test("should return a 200 and fetch request on success", async () => {
    const reqArray = [
      {
        staff_id: 140001,
        request_date: new Date("2024-10-03T16:00:00.000Z"),
        status: "Approved",
        manager_id: 130002,
        group_id: null,
        request_time: "PM",
        reason: "Child carer",
      },
      {
        staff_id: 140894,
        request_date: new Date("2024-10-08T16:00:00.000Z"),
        status: "Approved",
        manager_id: 140001,
        group_id: null,
        request_time: "PM",
        reason: "Child carer",
      },
      {
        staff_id: 140002,
        request_date: new Date("2024-10-08T16:00:00.000Z"),
        status: "Approved",
        manager_id: 140894,
        group_id: null,
        request_time: "PM",
        reason: "Child carer",
      },
    ];
    const staffArray = [
      {
        staff_id: 140001,
        staff_fname: "Derek",
        staff_lname: "Tan",
        dept: "Sales",
        position: "Director",
        country: "Singapore",
        email: "Derek.Tan@allinone.com.sg",
        reporting_manager: 130002,
        role: 1,
      },
      {
        staff_id: 140894,
        staff_fname: "Rahim",
        staff_lname: "Khalid",
        dept: "Sales",
        position: "Sales Manager",
        country: "Singapore",
        email: "Rahim.Khalid@allinone.com.sg",
        reporting_manager: 140001,
        role: 3,
      },
      {
        staff_id: 140002,
        staff_fname: "Susan",
        staff_lname: "Goh",
        dept: "Sales",
        position: "Account Manager",
        country: "Singapore",
        email: "Susan.Goh@allinone.com.sg",
        reporting_manager: 140894,
        role: 2,
      },
    ];

    await ArrangementRequest.insertMany(reqArray);
    await Staff.insertMany(staffArray);
    await getTeamSchedule(req, res);
    const response = res._getJSONData();
    expect(res.statusCode).toBe(200);
    expect(response.data.length).toBe(3);
    expect(response.data).toEqual([
      expect.objectContaining({
        request_time: "PM",
        request_date: new Date("2024-10-03T16:00:00.000Z").toISOString(),
        name: "Derek Tan",
      }),
      expect.objectContaining({
        request_time: "PM",
        request_date: new Date("2024-10-08T16:00:00.000Z").toISOString(),
        name: "Rahim Khalid",
      }),
      expect.objectContaining({
        request_time: "PM",
        request_date: new Date("2024-10-08T16:00:00.000Z").toISOString(),
        name: "Susan Goh",
      }),
    ]);
  });
});
