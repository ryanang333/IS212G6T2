import { fetchAuditLogs } from "../../../../api/controllers/requestAuditController";
import httpMocks from "node-mocks-http";
import ArrangementRequest from "../../../../api/models/arrangementRequestsModel";
import RequestAudit from "../../../../api/models/requestAuditModel";

// Mocking the database model
jest.mock("../../../../api/models/arrangementRequestsModel");
jest.mock("../../../../api/models/requestAuditModel");

describe("View Audit Logs", () => {
    let req, res;

    beforeEach(() => {
        req = httpMocks.createRequest({
        method: "GET",
        url: "/requestAudit",
        query: {
            startDate: '',
            endDate: '',
            filterStaffId: ''
        },
        });
        res = httpMocks.createResponse();
    });

    test("should return 200 and fetch audit logs successfully", async () => {
        const mockarrangementRequests = [{
            _id: "123456789012345678901231",
            staff_id: 140008,
            request_date: "2025-01-01T00:00:00.000Z",
            status: "Pending",
            manager_id: 140001,
            group_id: null,
            request_time: "AM",
            reason: "Test request 1",
            __v: 0
        }];

        const mockrequestAudit = [{
            _id: "123456789012345678901230",
            request_id: "123456789012345678901231",
            changed_by: 140008,
            old_status: "N/A",
            new_status: "Pending",
            change_timestamp: "2025-01-01T00:00:00.000Z",
        }];

        ArrangementRequest.find.mockResolvedValue(mockarrangementRequests);
        RequestAudit.find.mockResolvedValue(mockrequestAudit);
        await fetchAuditLogs(req, res);

        // expect(ArrangementRequest.find).toHaveBeenCalledWith(expect.any(Object));
        // expect(RequestAudit.find).toHaveBeenCalledWith({
        //     request_id: { $in: mockarrangementRequests.map(req => req._id)}
        // }); // Check that find was called
        // expect(RequestAudit.find).toHaveBeenCalledWith({
        //     request_id: { $in: mockarrangementRequests.map(req => req._id) }
        // });

        expect(ArrangementRequest.find).toHaveBeenCalledWith({
            request_date: {
                $gte: new Date("2025-01-01"),
                $lt: new Date("2025-01-02T00:00:00Z"),
            },
            staff_id: 140008,
        });

        expect(RequestAudit.find).toHaveBeenCalledWith({
            request_id: { $in: mockarrangementRequests.map(req => req._id) }
        });

         
        // expect(res.statusCode).toBe(200);
        expect(res._getJSONData()).toEqual({
            count: mockrequestAudit.length,
            logs: expect.arrayContaining(mockrequestAudit.map(log => ({
                _id: log._id,
                request_id: {
                    _id: log.request_id,
                    staff_id: mockarrangementRequests[0].staff_id,
                    request_date: mockarrangementRequests[0].request_date,
                    reason: mockarrangementRequests[0].reason,
                    withdraw_reason: null,
                    manager_reason: null,
                },
                changed_by: log.changed_by,
                change_timestamp: log.change_timestamp,
                old_status: log.old_status,
                new_status: log.new_status,
            }))),
        });
    }, 10000);
});




    // test("should return 500 if database error occurs", async () => {
    //     RequestAudit.find.mockRejectedValue(new Error("Database error"));

    //     await fetchAuditLogs(req, res);
    //     expect(res.statusCode).toBe(500);
    //     expect(res._getJSONData()).toEqual({ message: "Internal server error" });
    // });

    // test("should return 400 if no filters are applied", async () => {
    //     req.query = {}; // Simulate no filters
    //     await fetchAuditLogs(req, res);
    //     expect(res.statusCode).toBe(400);
    //     expect(res._getJSONData().message).toEqual("Please provide valid filters");
    // });
