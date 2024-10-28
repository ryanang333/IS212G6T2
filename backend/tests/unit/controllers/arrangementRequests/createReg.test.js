import { createRegArrangementRequests } from "../../../../api/controllers/arrangementRequestsController.js";
import { getStaffDetails } from "../../../../api/controllers/staffController.js";
import * as creationUtils from "../../../../api/utils/creationUtils.js";
import * as dateChecker from "../../../../api/utils/dateChecker.js";

// Mock the imported functions
jest.mock("../../../../api/controllers/staffController.js");
jest.mock("../../../../api/utils/creationUtils.js");
jest.mock("../../../../api/utils/dateChecker.js");

describe("createRegArrangementRequests", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        staffId: "12345",
        arrangementRequests: [
          {
            id: 1,
            date: "2024-10-25",
            recurringInterval: "1 week",
            numEvents: 3, // numEvents must be greater than 1
            reason: "Work from home",
          },
        ],
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks(); // Reset all mocks between tests
  });

  // Test - Invalid Dates
  test("should return 400 if arrangement request dates are invalid", async () => {
    // Helper calls
    dateChecker.checkDatesValidity.mockReturnValue({ isValid: false });

    // Main function
    await createRegArrangementRequests(req, res);

    // Expectations
    expect(dateChecker.checkDatesValidity).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Arrangement request dates are invalid!",
      })
    );
  });

  // Test - Staff Not Found
  test("should return 404 if staff is not found", async () => {
    // Helper calls
    dateChecker.checkDatesValidity.mockReturnValue({ isValid: true });
    getStaffDetails.mockResolvedValue(null);

    // Main function
    await createRegArrangementRequests(req, res);

    // Expectations
    expect(getStaffDetails).toHaveBeenCalledWith("12345");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Staff does not exist!",
      })
    );
  });

  // Test - Create Approved CEO Request
  test("should create and approve CEO request instantly", async () => {
    // Helper calls
    dateChecker.checkDatesValidity.mockReturnValue({ isValid: true });
    getStaffDetails.mockResolvedValue({
      staff_id: "12345",
      position: "MD", // CEO equivalent
      reporting_manager: "67890",
    });
    creationUtils.createNewCEORequests.mockResolvedValue(true);

    // Main function
    await createRegArrangementRequests(req, res);

    // Expectations
    expect(getStaffDetails).toHaveBeenCalledWith("12345");
    expect(creationUtils.createNewCEORequests).toHaveBeenCalledWith(
      expect.any(Array), // Cleaned arrangement requests array
      "12345",
      "67890"
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Request(s) have been instantly approved for CEO!",
      })
    );
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
  
    // Mock the response from createNewRequests
    const cleanedRequests = [
      {
        id: 1,
        date: "2024-10-25",
        recurringInterval: "1 week",
        numEvents: 3,
        reason: "Work from home",
        date: new Date("2024-10-25T00:00:00.000Z"),
        group_id: expect.any(String), // UUID
      },
      {
        id: 1,
        date: "2024-10-25",
        recurringInterval: "1 week",
        numEvents: 3,
        reason: "Work from home",
        date: new Date("2024-11-01T00:00:00.000Z"),
        group_id: expect.any(String), // UUID
      },
      {
        id: 1,
        date: "2024-10-25",
        recurringInterval: "1 week",
        numEvents: 3,
        reason: "Work from home",
        date: new Date("2024-11-08T00:00:00.000Z"),
        group_id: expect.any(String), // UUID
      },
    ];
  
    creationUtils.createNewRequests.mockResolvedValue(cleanedRequests);
    creationUtils.checkWFHRequestsPerWeek.mockResolvedValue(new Set()); // Less than 2 WFH days that week
  
    // Main Function
    await createRegArrangementRequests(req, res);
  
    // Expectations
    expect(getStaffDetails).toHaveBeenCalledWith("12345");
    expect(creationUtils.createNewRequests).toHaveBeenCalledWith(
      cleanedRequests, // Expect the cleaned-up requests
      "12345",         // staff_id of the non-CEO staff
      "67890"          // Reporting manager
    );
    expect(creationUtils.checkWFHRequestsPerWeek).toHaveBeenCalledWith(
      cleanedRequests,
      "12345"
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });
  

  
  // Test - Create Request with More than 2 WFH Days
  test("should return a warning if more than 2 WFH requests exist in a week", async () => {
    req.body.arrangementRequests[0].numEvents = 3;  // 3 recurring events
    req.body.arrangementRequests[0].recurringInterval = "1 week";

    // Mock valid date and staff details
    dateChecker.checkDatesValidity.mockReturnValue({ isValid: true });
    getStaffDetails.mockResolvedValue({
      staff_id: "12345",
      position: "Manager",
      reporting_manager: "67890",
    });
    creationUtils.createNewRequests.mockResolvedValue([
      { id: 1, date: "2024-10-25", reason: "Work from home" },
    ]);
    creationUtils.checkWFHRequestsPerWeek.mockResolvedValue(new Set(["2024-10-24"]));

    // Main function
    await createRegArrangementRequests(req, res);

    // Expectations
    expect(creationUtils.checkWFHRequestsPerWeek).toHaveBeenCalledWith(
      expect.any(Array), // Cleaned arrangement requests array
      "12345"
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Notice! You have more than 2 requests in the week(s) of [2024-10-24]. Request will be processed and manager will be notified.",
      })
    );
  });

  // Test - Internal Server Error
  test("should return 500 if an internal server error occurs", async () => {
    // Helper calls
    dateChecker.checkDatesValidity.mockReturnValue({ isValid: true });
    getStaffDetails.mockRejectedValue(new Error("Internal Server Error"));

    // Main function
    await createRegArrangementRequests(req, res);

    // Expectations
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Internal Server Error",
      })
    );
  });
});
