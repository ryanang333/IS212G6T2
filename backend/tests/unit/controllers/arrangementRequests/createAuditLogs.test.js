import mongoose from "mongoose";
import httpMocks from "node-mocks-http";
import { createAuditEntry } from "../../../../api/controllers/requestAuditController";
import RequestAudit from "../../../../api/models/requestAuditModel";

// Mocking the database models
jest.mock("../../../../api/models/arrangementRequestsModel");
jest.mock("../../../../api/models/requestAuditModel");

describe("Audit Entry Pending Status", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks(); // Clear all mocks before each test
    req = httpMocks.createRequest({
      method: "POST",
      url: "/requestAudit",
      body: {
        requests: [],
      },
    });
    res = httpMocks.createResponse();
  });

  test("should create new arrangement requests", async () => {
    const mockArrangementRequests = [
      { 
        _id: "123456789012345678901231",
        staff_id: 140008,
        request_date: "December 30, 2024",
        status: "Pending",
        manager_id: 140001,
        group_id: null,
        request_time: "PM",
        reason: "Test request 1",
        __v: 0,
      },
    ];
    const staff_id = 140008;
    const oldStatus = "N/A";
    const newStatus = "Pending";

    // Mock ArrangementRequest to allow chaining of .find().select() and return array of objects
    RequestAudit.find.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockArrangementRequests),
    });

    await createAuditEntry(mockArrangementRequests, staff_id, oldStatus, newStatus);

    expect(RequestAudit.insertMany).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          request_id: "123456789012345678901231",
          changed_by: staff_id,
          old_status: oldStatus,
          new_status: newStatus,
        }),
      ])
    );
  });

  test("should create approved arrangement requests", async () => {
    const mockArrangementRequests = [
      { 
        _id: "123456789012345678901231",
        staff_id: 140008,
        request_date: "December 30, 2024",
        status: "Approved",
        manager_id: 140001,
        group_id: null,
        request_time: "PM",
        reason: "Test request 1",
        __v: 0,
      },
    ];
    const staff_id = 140008;
    const oldStatus = "Pending";
    const newStatus = "Approved";

    // Mock ArrangementRequest to allow chaining of .find().select() and return array of objects
    RequestAudit.find.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockArrangementRequests),
    });

    await createAuditEntry(mockArrangementRequests, staff_id, oldStatus, newStatus);

    expect(RequestAudit.insertMany).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          request_id: "123456789012345678901231",
          changed_by: staff_id,
          old_status: oldStatus,
          new_status: newStatus,
        }),
      ])
    );
  });

  test("should create rejected arrangement requests", async () => {
    const mockArrangementRequests = [
      { 
        _id: "123456789012345678901231",
        staff_id: 140008,
        request_date: "December 30, 2024",
        status: "Rejected",
        manager_id: 140001,
        group_id: null,
        request_time: "PM",
        reason: "Test request 1",
        manaer_reason: "Test Reject",
        __v: 0,
      },
    ];
    const staff_id = 140008;
    const oldStatus = "Pending";
    const newStatus = "Rejected";

    // Mock ArrangementRequest to allow chaining of .find().select() and return array of objects
    RequestAudit.find.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockArrangementRequests),
    });

    await createAuditEntry(mockArrangementRequests, staff_id, oldStatus, newStatus);

    expect(RequestAudit.insertMany).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          request_id: "123456789012345678901231",
          changed_by: staff_id,
          old_status: oldStatus,
          new_status: newStatus,
        }),
      ])
    );
  });

  test("should create cancelled arrangement requests", async () => {
    const mockArrangementRequests = [
      { 
        _id: "123456789012345678901231",
        staff_id: 140008,
        request_date: "December 30, 2024",
        status: "Cancelled",
        manager_id: 140001,
        group_id: null,
        request_time: "PM",
        reason: "Test request 1",
        __v: 0,
      },
    ];
    const staff_id = 140008;
    const oldStatus = "Pending";
    const newStatus = "Cancelled";

    // Mock ArrangementRequest to allow chaining of .find().select() and return array of objects
    RequestAudit.find.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockArrangementRequests),
    });

    await createAuditEntry(mockArrangementRequests, staff_id, oldStatus, newStatus);

    expect(RequestAudit.insertMany).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          request_id: "123456789012345678901231",
          changed_by: staff_id,
          old_status: oldStatus,
          new_status: newStatus,
        }),
      ])
    );
  });

  test("should create pending withdrawal arrangement requests", async () => {
    const mockArrangementRequests = [
      { 
        _id: "123456789012345678901231",
        staff_id: 140008,
        request_date: "December 30, 2024",
        status: "Pending Withdrawal",
        manager_id: 140001,
        group_id: null,
        request_time: "PM",
        reason: "Test request 1",
        __v: 0,
      },
    ];
    const staff_id = 140008;
    const oldStatus = "Approved";
    const newStatus = "Pending Withdrawal";

    // Mock ArrangementRequest to allow chaining of .find().select() and return array of objects
    RequestAudit.find.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockArrangementRequests),
    });

    await createAuditEntry(mockArrangementRequests, staff_id, oldStatus, newStatus);

    expect(RequestAudit.insertMany).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          request_id: "123456789012345678901231",
          changed_by: staff_id,
          old_status: oldStatus,
          new_status: newStatus,
        }),
      ])
    );
  });

  test("should create approved withdrawal arrangement requests", async () => {
    const mockArrangementRequests = [
      { 
        _id: "123456789012345678901231",
        staff_id: 140008,
        request_date: "December 30, 2024",
        status: "Withdrawn",
        manager_id: 140001,
        group_id: null,
        request_time: "PM",
        reason: "Test request 1",
        __v: 0,
      },
    ];
    const staff_id = 140008;
    const oldStatus = "Approved";
    const newStatus = "Withdrawn";

    // Mock ArrangementRequest to allow chaining of .find().select() and return array of objects
    RequestAudit.find.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockArrangementRequests),
    });

    await createAuditEntry(mockArrangementRequests, staff_id, oldStatus, newStatus);

    expect(RequestAudit.insertMany).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          request_id: "123456789012345678901231",
          changed_by: staff_id,
          old_status: oldStatus,
          new_status: newStatus,
        }),
      ])
    );
  });

  test("should create rejected arrangement requests", async () => {
    const mockArrangementRequests = [
      { 
        _id: "123456789012345678901231",
        staff_id: 140008,
        request_date: "December 30, 2024",
        status: "Approved",
        manager_id: 140001,
        group_id: null,
        request_time: "PM",
        reason: "Test request 1",
        __v: 0,
      },
    ];
    const staff_id = 140008;
    const oldStatus = "Pending Withdrawal";
    const newStatus = "Approved";

    // Mock ArrangementRequest to allow chaining of .find().select() and return array of objects
    RequestAudit.find.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockArrangementRequests),
    });

    await createAuditEntry(mockArrangementRequests, staff_id, oldStatus, newStatus);

    expect(RequestAudit.insertMany).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          request_id: "123456789012345678901231",
          changed_by: staff_id,
          old_status: oldStatus,
          new_status: newStatus,
        }),
      ])
    );
  });
});