import { fetchAuditLogs } from "../../../../api/controllers/requestAuditController";
import httpMocks from "node-mocks-http";
import ArrangementRequest from "../../../../api/models/arrangementRequestsModel";
import RequestAudit from "../../../../api/models/requestAuditModel";

// Mocking the database models
jest.mock("../../../../api/models/arrangementRequestsModel");
jest.mock("../../../../api/models/requestAuditModel");

describe("View Audit Logs", () => {
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
});
