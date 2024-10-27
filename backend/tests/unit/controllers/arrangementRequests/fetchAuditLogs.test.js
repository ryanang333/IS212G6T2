import { fetchAuditLogs } from "../../../../api/controllers/requestAuditController";
import httpMocks from "node-mocks-http";
import ArrangementRequest from "../../../../api/models/arrangementRequestsModel";
import RequestAudit from "../../../../api/models/requestAuditModel";

// Mocking the database models
jest.mock("../../../../api/models/arrangementRequestsModel");
jest.mock("../../../../api/models/requestAuditModel");



describe("View Audit Logs", () => {
  beforeEach(() => {
    jest.clearAllMocks();  // Clear all mocks before each test
  });

  test("should fetch audit logs if arrangement requests are found", async () => {
    // Mock arrangement request as an array with a single object
    const mockArrangementRequest = [
      {
        _id: "123456789012345678901234",  // Ensure valid _id
        staff_id: 140008,
        request_date: new Date("2025-01-01T00:00:00.000Z"),
        status: "Pending",
        manager_id: 140008,
        reason: "Test reason",
        withdraw_reason: null,
        manager_reason: null,
      },
    ];

    // Mock audit logs for the arrangement request
    const mockAuditLogs = [
      {
        _id: "123456789012345678901235",
        request_id: mockArrangementRequest[0],  // Full object instead of just ID
        changed_by: 140008,
        old_status: "Pending",
        new_status: "Approved",
        change_timestamp: "2025-01-01T12:00:00.000Z"
      },
    ];

    // Mock ArrangementRequest to allow chaining of .find().select() and return array of objects
    ArrangementRequest.find.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockArrangementRequest), // Array with objects
    });

    // Mock RequestAudit.find to allow chaining of .populate() and return audit logs
    RequestAudit.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockAuditLogs),  // Mock populated audit logs
    });

    const req = httpMocks.createRequest({
      method: "GET",
      url: "/requestAudit",
      query: {
        startDate: "2024-05-05",
        endDate: "2025-05-06",
        staffId: 140008
      },
    });
    const res = httpMocks.createResponse();

    // Call the function after mocking the data
    await fetchAuditLogs(req, res);

    // Assertions for ArrangementRequest find query (array)
    expect(ArrangementRequest.find).toHaveBeenCalledWith({
      request_date: {
        $gte: new Date("2024-05-05T00:00:00.000Z"),
        $lt: new Date("2025-05-07T00:00:00.000Z")  // End date + 1 day
      },
      staff_id: 140008
    });

    // Assertions for RequestAudit find query (should use $in array of request _ids)
    expect(RequestAudit.find).toHaveBeenCalledWith({
      request_id: { $in: ["123456789012345678901234"] }  // Expect an array of _id values inside $in
    });

    // Ensure populate is called
    expect(RequestAudit.find().populate).toHaveBeenCalledWith({
      path: 'request_id',
      select: 'staff_id request_date reason withdraw_reason manager_reason',
    });

    // Assert the correct response
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toMatchObject({
      count: mockAuditLogs.length,
      logs: mockAuditLogs.map(log => ({
        _id: log._id,
        request_id: {
          _id: mockArrangementRequest[0]._id,  // Access the object in the array
          staff_id: mockArrangementRequest[0].staff_id,
          request_date: mockArrangementRequest[0].request_date.toISOString(),
          reason: mockArrangementRequest[0].reason,
          withdraw_reason: mockArrangementRequest[0].withdraw_reason,
          manager_reason: mockArrangementRequest[0].manager_reason
        },
        changed_by: log.changed_by,
        change_timestamp: log.change_timestamp,
        old_status: log.old_status,
        new_status: log.new_status
      }))
    });
  });


  test("should return empty logs if no arrangement requests are found", async () => {
    // Mock an empty arrangement request array
    ArrangementRequest.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([]), // No arrangement requests found
    });
  
    const req = httpMocks.createRequest({
      method: "GET",
      url: "/requestAudit",
      query: {
        startDate: "2024-05-05",
        endDate: "2025-05-06",
        staffId: 140008
      },
    });
    const res = httpMocks.createResponse();
  
    // Call the function
    await fetchAuditLogs(req, res);
  
    // Assertions for ArrangementRequest find query (empty array)
    expect(ArrangementRequest.find).toHaveBeenCalledWith({
      request_date: {
        $gte: new Date("2024-05-05T00:00:00.000Z"),
        $lt: new Date("2025-05-07T00:00:00.000Z")
      },
      staff_id: 140008
    });
  
    // RequestAudit.find should not be called since there are no arrangement requests
    expect(RequestAudit.find).not.toHaveBeenCalled();  // Ensure it is not called
  
    // Assert the correct response
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toMatchObject({
      count: 0,   // No audit logs found
      logs: []    // Empty logs array
    });
  });
  

  test("should handle errors gracefully if a database error occurs", async () => {
    // Simulate a database error for ArrangementRequest.find
    ArrangementRequest.find.mockReturnValue({
      select: jest.fn().mockRejectedValue(new Error("Database error")),
    });

    const req = httpMocks.createRequest({
      method: "GET",
      url: "/requestAudit",
      query: {
        startDate: "2024-05-05",
        endDate: "2025-05-06",
        staffId: 140008
      },
    });
    const res = httpMocks.createResponse();

    // Call the function
    await fetchAuditLogs(req, res);

    // Assert that an error response was sent
    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toMatchObject({
      message: "Internal server error"
    });
  });

  test("should return empty logs if no audit logs are found for the arrangement requests", async () => {
    // Mock arrangement request as an array with a single object
    const mockArrangementRequest = [
      {
        _id: "123456789012345678901234",  // Ensure valid _id
        staff_id: 140008,
        request_date: new Date("2025-01-01T00:00:00.000Z"),
        status: "Pending",
        manager_id: 140008,
        reason: "Test reason",
        withdraw_reason: null,
        manager_reason: null,
      },
    ];
  
    // No audit logs found for the arrangement request
    const mockAuditLogs = []; // Empty audit logs array
  
    // Mock ArrangementRequest to allow chaining of .find().select() and return array of objects
    ArrangementRequest.find.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockArrangementRequest), // Array with objects
    });
  
    // Mock RequestAudit.find to allow chaining of .populate() and return empty logs
    RequestAudit.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockAuditLogs),  // Empty logs array
    });
  
    const req = httpMocks.createRequest({
      method: "GET",
      url: "/requestAudit",
      query: {
        startDate: "2024-05-05",
        endDate: "2025-05-06",
        staffId: 140008
      },
    });
    const res = httpMocks.createResponse();
  
    // Call the function after mocking the data
    await fetchAuditLogs(req, res);
  
    // Assert that the arrangement requests query was made
    expect(ArrangementRequest.find).toHaveBeenCalledWith({
      request_date: {
        $gte: new Date("2024-05-05T00:00:00.000Z"),
        $lt: new Date("2025-05-07T00:00:00.000Z"),
      },
      staff_id: 140008,
    });
  
    // Assert that RequestAudit.find was called
    expect(RequestAudit.find).toHaveBeenCalledWith({
      request_id: { $in: ["123456789012345678901234"] },
    });
  
    // Assert the correct response when no audit logs are found
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toMatchObject({
      count: 0,   // No audit logs found
      logs: [],   // Empty logs array
    });
  });
  test("should handle only staffId provided in query", async () => {
    // Mock arrangement request as an array with a single object
    const mockArrangementRequest = [
      {
        _id: "123456789012345678901234",  // Ensure valid _id
        staff_id: 140008,
        request_date: new Date("2025-01-01T00:00:00.000Z"),
        status: "Pending",
        manager_id: 140008,
        reason: "Test reason",
        withdraw_reason: null,
        manager_reason: null,
      },
    ];
  
    const mockAuditLogs = [
      {
        _id: "123456789012345678901235",
        request_id: mockArrangementRequest[0],  // Full object instead of just ID
        changed_by: 140008,
        old_status: "Pending",
        new_status: "Approved",
        change_timestamp: "2025-01-01T12:00:00.000Z",
      },
    ];
  
    // Mock ArrangementRequest to return array of objects
    ArrangementRequest.find.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockArrangementRequest),
    });
  
    // Mock RequestAudit.find to return audit logs
    RequestAudit.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockAuditLogs),
    });
  
    const req = httpMocks.createRequest({
      method: "GET",
      url: "/requestAudit",
      query: {
        staffId: 140008,  // Only staffId provided
      },
    });
    const res = httpMocks.createResponse();
  
    // Call the function after mocking the data
    await fetchAuditLogs(req, res);
  
    // Assertions for ArrangementRequest find query (array)
    expect(ArrangementRequest.find).toHaveBeenCalledWith({
      staff_id: 140008,
    });
  
    // Assertions for RequestAudit find query (should use $in array of request _ids)
    expect(RequestAudit.find).toHaveBeenCalledWith({
      request_id: { $in: ["123456789012345678901234"] },
    });
  
    // Assert the correct response
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toMatchObject({
      count: mockAuditLogs.length,
      logs: mockAuditLogs.map(log => ({
        _id: log._id,
        request_id: {
          _id: mockArrangementRequest[0]._id,
          staff_id: mockArrangementRequest[0].staff_id,
          request_date: mockArrangementRequest[0].request_date.toISOString(),
          reason: mockArrangementRequest[0].reason,
          withdraw_reason: mockArrangementRequest[0].withdraw_reason,
          manager_reason: mockArrangementRequest[0].manager_reason,
        },
        changed_by: log.changed_by,
        change_timestamp: log.change_timestamp,
        old_status: log.old_status,
        new_status: log.new_status,
      })),
    });
  });
  
});
