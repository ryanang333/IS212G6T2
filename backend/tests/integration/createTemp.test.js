import mongoose from "mongoose";
import httpMocks from "node-mocks-http";
import { createTempArrangementRequests } from "../../api/controllers/arrangementRequestsController.js";
import ArrangementRequest from "../../api/models/arrangementRequestsModel.js";
import Staff from "../../api/models/staffModel.js";
import { MongoMemoryServer } from "mongodb-memory-server-core";
import * as creationUtils from "../../api/utils/creationUtils.js";
import * as dateChecker from "../../api/utils/dateChecker.js";

let mongoServer;

// Setup in-memory MongoDB
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoURI = mongoServer.getUri();
  await mongoose.connect(mongoURI);
});

// Cleanup the MongoDB instance after all tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

// Clean up data after each test
afterEach(async () => {
  await ArrangementRequest.deleteMany({});
  await Staff.deleteMany({});
  jest.clearAllMocks(); // Ensure mocks are cleared after each test
});

describe("createTempArrangementRequests - Integration Test with MongoDB", () => {
  let req, res;

  // Set up the common request properties in beforeEach
  beforeEach(() => {
    req = httpMocks.createRequest({
      method: "POST",
      url: "/arrangementRequests/temp",
    });
    res = httpMocks.createResponse();
  });

  test("should create a new request for non-CEO staff", async () => {
    // Set up request body for this specific test
    req.body = {
      staffId: "12345",
      arrangementRequests: [
        { id: 1, date: "2024-10-25", time: "Full Day", reason: "Meeting" },
      ],
    };

    const staff = new Staff({
      staff_id: 12345,
      staff_fname: "John",
      staff_lname: "Doe",
      dept: "Sales",
      position: "Manager",
      country: "Singapore",
      email: "johndoe@example.com",
      reporting_manager: 67890,
      role: 1,
    });
    await staff.save();

    jest.spyOn(dateChecker, "checkDatesValidity").mockReturnValue({ isValid: true });

    await createTempArrangementRequests(req, res);

    expect(res.statusCode).toBe(201);
    const response = res._getJSONData();
    expect(response.message).toBe("Request created successfully!");

    const createdRequests = await ArrangementRequest.find({ staff_id: "12345" });
    expect(createdRequests).toHaveLength(1);
    expect(createdRequests[0].status).toBe("Pending");
  });

  test("should handle multiple arrangement requests for non-CEO staff", async () => {
    // Set up request body for this specific test
    req.body = {
      staffId: "12345",
      arrangementRequests: [
        { id: 1, date: "2024-10-25", time: "Full Day", reason: "Meeting" },
        { id: 2, date: "2024-10-29", time: "Full Day", reason: "Conference" },
      ],
    };

    const staff = new Staff({
      staff_id: 12345,
      staff_fname: "John",
      staff_lname: "Doe",
      dept: "Sales",
      position: "Manager",  // Non-CEO staff
      country: "Singapore",
      email: "johndoe@example.com",
      reporting_manager: 67890,
      role: 1,
    });
    await staff.save();

    jest.spyOn(dateChecker, "checkDatesValidity").mockReturnValue({ isValid: true });
    jest.spyOn(creationUtils, "checkWFHRequestsPerWeek").mockResolvedValue(new Set());

    await createTempArrangementRequests(req, res);

    expect(res.statusCode).toBe(201);
    const response = res._getJSONData();
    expect(response.message).toBe("Request created successfully!");

    const createdRequests = await ArrangementRequest.find({ staff_id: "12345" });
    expect(createdRequests).toHaveLength(2);
    expect(createdRequests[0].status).toBe("Pending");
    expect(createdRequests[1].status).toBe("Pending");
  });

  test("should return 400 if arrangement request dates are invalid", async () => {
    // Set up request body for this specific test
    req.body = {
      staffId: "12345",
      arrangementRequests: [
        { id: 1, date: "2024-10-25", time: "Full Day", reason: "Meeting" },
      ],
    };

    const staff = new Staff({
      staff_id: 12345,
      staff_fname: "John",
      staff_lname: "Doe",
      dept: "Sales",
      position: "Manager",
      country: "Singapore",
      email: "johndoe@example.com",
      reporting_manager: 67890,
      role: 1,
    });
    await staff.save();

    // Mocking the invalid date response
    jest.spyOn(dateChecker, "checkDatesValidity").mockReturnValue({ isValid: false });

    await createTempArrangementRequests(req, res);

    expect(res.statusCode).toBe(400);
    const response = res._getJSONData();
    expect(response.message).toBe("Arrangement request dates are invalid!");
  });

  test("should return a warning for more than 2 WFH requests", async () => {
    // Set up request body for this specific test
    req.body = {
      staffId: "12345",
      arrangementRequests: [
        { id: 1, date: "2024-10-25", time: "Full Day", reason: "Meeting" },
      ],
    };

    const staff = new Staff({
      staff_id: 12345,
      staff_fname: "John",
      staff_lname: "Doe",
      dept: "Sales",
      position: "Manager",
      country: "Singapore",
      email: "johndoe@example.com",
      reporting_manager: 67890,
      role: 1,
    });
    await staff.save();

    jest.spyOn(dateChecker, "checkDatesValidity").mockReturnValue({ isValid: true });
    jest.spyOn(creationUtils, "checkWFHRequestsPerWeek").mockResolvedValue(new Set(['2024-10-24']));

    await createTempArrangementRequests(req, res);

    const response = res._getJSONData();
    expect(res.statusCode).toBe(201);
    expect(response.message).toContain("Notice! You have more than 2 requests in the week(s) of [2024-10-24].");
  });

  test("should return 500 if an internal server error occurs", async () => {
    // Set up request body for this specific test
    req.body = {
      staffId: "12345",
      arrangementRequests: [
        { id: 1, date: "2024-10-25", time: "Full Day", reason: "Meeting" },
      ],
    };

    jest.spyOn(Staff, "findOne").mockImplementation(() => {
      throw new Error("Database error");
    });

    await createTempArrangementRequests(req, res);

    expect(res.statusCode).toBe(500);
    const response = res._getJSONData();
    expect(response.message).toBe("Database error");
  });
});
