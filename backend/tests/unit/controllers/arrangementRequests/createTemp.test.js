import { createTempArrangementRequests } from "../../../../api/controllers/arrangementRequestsController.js";
import { getStaffDetails } from "../../../../api/controllers/staffController.js";
import * as creationUtils from "../../../../api/utils/creationUtils.js";
import * as dateChecker from "../../../../api/utils/dateChecker.js";

// Mock the imported functions
jest.mock("../../../../api/controllers/staffController.js");
jest.mock("../../../../api/utils/creationUtils.js");
jest.mock("../../../../api/utils/dateChecker.js");

describe("createTempArrangementRequests", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        staffId: "12345",
        arrangementRequests: [
          { id: 1, date: "2024-10-25", time: "Full Day", reason: "hehe" },
        ],
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks(); 
  });

  // Test 1 - checkDatesValidity
  test("should return 400 if dates are invalid", async () => {
    // Helper Calls
    dateChecker.checkDatesValidity.mockReturnValue({ isValid: false });

    // Main Function
    await createTempArrangementRequests(req, res);
    
    // Expectations
    expect(res.status).toHaveBeenCalledWith(400);
  });

  // Test 2 - getStaffDetails
  test("should return 404 if staff not found", async () => {
    // Helper Calls
    dateChecker.checkDatesValidity.mockReturnValue({ isValid: true });
    getStaffDetails.mockResolvedValue(null);

    // Main Function    
    await createTempArrangementRequests(req, res);

    // Expectations
    expect(getStaffDetails).toHaveBeenCalledWith("12345");
    expect(res.status).toHaveBeenCalledWith(404);
  });

  // Test 3 - Create CEO Request
  test("should create an approved CEO request", async () => {
    // Helper Calls
    dateChecker.checkDatesValidity.mockReturnValue({ isValid: true });
    getStaffDetails.mockResolvedValue({
      staff_id: "12345",
      position: "MD", // CEO equivalent
      reporting_manager: "67890",
    });
    creationUtils.createNewCEORequests.mockResolvedValue(true);

    // Main Function 
    await createTempArrangementRequests(req, res);

    // Expectations
    expect(getStaffDetails).toHaveBeenCalledWith("12345");
    expect(creationUtils.createNewCEORequests).toHaveBeenCalledWith(
      req.body.arrangementRequests,
      "12345",      
      "67890"         
    );
    expect(res.status).toHaveBeenCalledWith(201);

  });

  // Test 4 - Create Non-CEO Request
  test("should create a new request for non-CEO staff", async () => {
    // Helper Calls
    dateChecker.checkDatesValidity.mockReturnValue({ isValid: true });
    getStaffDetails.mockResolvedValue({
      staff_id: "12345",
      position: "Manager",
      reporting_manager: "67890",
    });
    creationUtils.createNewRequests.mockResolvedValue([
      { id: 1, date: "2024-10-25", time: "Full Day", reason: "hehe" }
    ]);
    creationUtils.checkWFHRequestsPerWeek.mockResolvedValue(new Set()); // Less than 2 WFH days that week

    // Main Function
    await createTempArrangementRequests(req, res);

    // Expectations
    expect(getStaffDetails).toHaveBeenCalledWith("12345");
    expect(creationUtils.createNewRequests).toHaveBeenCalledWith(
      req.body.arrangementRequests,
      "12345",         // staff_id of the non-CEO staff
      "67890"          // Reporting manager
    );
    expect(creationUtils.checkWFHRequestsPerWeek).toHaveBeenCalledWith(
      req.body.arrangementRequests,
      "12345"         
    );
    expect(res.status).toHaveBeenCalledWith(201);
    
  });

  // Test 5 - Create Non-CEO Request with More than 2 WFH Days in a Week
  test("should create a new request for non-CEO staff with a warning for more than 2 WFH days", async () => {
    // Helper Calls
    dateChecker.checkDatesValidity.mockReturnValue({ isValid: true });
    getStaffDetails.mockResolvedValue({
      staff_id: "12345",
      position: "Manager",
      reporting_manager: "67890",
    });
    creationUtils.createNewRequests.mockResolvedValue([
      { id: 1, date: "2024-10-25", time: "Full Day", reason: "hehe" }
    ]);
    creationUtils.checkWFHRequestsPerWeek.mockResolvedValue(new Set(['2024-10-24']));

    // Main Function
    await createTempArrangementRequests(req, res);

    // Expectations
    expect(getStaffDetails).toHaveBeenCalledWith("12345");
    expect(creationUtils.createNewRequests).toHaveBeenCalledWith(
      req.body.arrangementRequests,
      "12345",         // staff_id of the non-CEO staff
      "67890"          // Reporting manager
    );
    expect(creationUtils.checkWFHRequestsPerWeek).toHaveBeenCalledWith(
      req.body.arrangementRequests,
      "12345"         
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Notice! You have more than 2 requests in the week(s) of [2024-10-24]. Request will be processed and manager will be notified."
      })
    );

  });

  // Test 6 - Internal Server Error
  test("should return 500 if an internal server error occurs", async () => {
    // Helper Calls
    dateChecker.checkDatesValidity.mockReturnValue({ isValid: true });
    getStaffDetails.mockRejectedValue(new Error("Internal Server Error"));

    // Main Function
    await createTempArrangementRequests(req, res);

    // Expectations
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Internal Server Error"
      })
    );
  });
 
});
