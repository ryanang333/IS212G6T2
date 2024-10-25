import mongoose from "mongoose";
import httpMocks from "node-mocks-http";
import { createRegArrangementRequests } from "../../api/controllers/arrangementRequestsController.js";
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

describe("createRegArrangementRequests - Integration Test with MongoDB", () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest({
      method: "POST",
      url: "/arrangementRequests/reg",
      body: {
        staffId: "12345",
        arrangementRequests: [
          {
            id: 1,
            startDate: "2024-11-01",
            recurringInterval: "1week",
            time: "Full Day",
            numEvents: 3,
            reason: "Work from home",
          },
        ],
      },
    });
    res = httpMocks.createResponse();
  });

  test("should create a new recurring request for non-CEO staff", async () => {
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
    jest.spyOn(creationUtils, "checkWFHRequestsPerWeek").mockResolvedValue(new Set());

    await createRegArrangementRequests(req, res);

    expect(res.statusCode).toBe(201);
    const response = res._getJSONData();
    expect(response.message).toBe("Request created successfully!");

    const createdRequests = await ArrangementRequest.find({ staff_id: "12345" });
    expect(createdRequests).toHaveLength(3);
    expect(createdRequests[0].status).toBe("Pending");
    expect(createdRequests[1].status).toBe("Pending");
    expect(createdRequests[2].status).toBe("Pending");
  });

  test("should create and approve CEO request instantly", async () => {
    
    const staff = new Staff({
      staff_id: 12345,
      staff_fname: "John",
      staff_lname: "Doe",
      dept: "Executive",
      position: "MD", // CEO equivalent
      country: "Singapore",
      email: "ceojohn@example.com",
      reporting_manager: 67890,
      role: 1,
    });
    await staff.save();

    jest.spyOn(dateChecker, "checkDatesValidity").mockReturnValue({ isValid: true });
    

    await createRegArrangementRequests(req, res);

    expect(res.statusCode).toBe(201);
    const response = res._getJSONData();
    expect(response.message).toBe("Request(s) have been instantly approved for CEO!");

    const createdRequests = await ArrangementRequest.find({ staff_id: "12345" });
    expect(createdRequests).toHaveLength(3);
    expect(createdRequests[0].status).toBe("Approved");
    expect(createdRequests[1].status).toBe("Approved");
    expect(createdRequests[2].status).toBe("Approved");
  });

  test("should return 400 if arrangement request dates are invalid", async () => {
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

    jest.spyOn(dateChecker, "checkDatesValidity").mockReturnValue({ isValid: false });

    await createRegArrangementRequests(req, res);

    expect(res.statusCode).toBe(400);
    const response = res._getJSONData();
    expect(response.message).toBe("Arrangement request dates are invalid!");
  });

  test("should return a warning if more than 2 WFH requests exist in a week", async () => {
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
    jest.spyOn(creationUtils, "checkWFHRequestsPerWeek").mockResolvedValue(new Set(["2024-10-24"]));

    await createRegArrangementRequests(req, res);

    const response = res._getJSONData();
    expect(res.statusCode).toBe(201);
    expect(response.message).toContain("Notice! You have more than 2 requests in the week(s) of [2024-10-24].");
  });

  test("should return 404 if staff not found", async () => {
    await createRegArrangementRequests(req, res);

    expect(res.statusCode).toBe(404);
    const response = res._getJSONData();
    expect(response.message).toBe("Staff does not exist!");
  });

  test("should return 500 if an internal server error occurs", async () => {
    jest.spyOn(Staff, "findOne").mockImplementation(() => {
      throw new Error("Database error");
    });

    await createRegArrangementRequests(req, res);

    expect(res.statusCode).toBe(500);
    const response = res._getJSONData();
    expect(response.message).toBe("Database error");
  });
});
