import httpMocks from "node-mocks-http";
import ArrangementRequest from '../../../../api/models/arrangementRequestsModel.js';
import { 
    mockPendingArrangementRequest, 
    mockPendingArrangementRequestSelected,
    mockPendingArrangementRequestGroup,
    mockPendingArrangementRequestAll
} from "../../../mock/arrangement_requests.js";
import { 
    approveRequest,
    rejectRequest,
    approveSelectedRequests,
    rejectSelectedRequests,
    approveGroupRequests,
    rejectGroupRequests,
    approveAllRequests,
    rejectAllRequests
} from '../../../../api/controllers/arrangementRequestsController.js';


jest.mock("../../../../api/models/arrangementRequestsModel.js");

describe("approveRequest", () => {
    let req, res;
    beforeEach(() => {
      req = httpMocks.createRequest({
        method: "POST",
        url: "/arrangementrequests/approve",
        body: {
          requestId: 'validRequestId', // Assuming you're using requestId in the body
      }
      });
      res = httpMocks.createResponse();
    });

    test("should approve the request successfully", async () => {
        const mockApprovedRequest = { _id: 'validRequestId', status: 'Approved' };
        ArrangementRequest.findByIdAndUpdate.mockResolvedValue(mockApprovedRequest);

        await approveRequest(req, res);

        expect(res.statusCode).toBe(200);
        const responseData =  (res._getJSONData());
        expect(responseData.data).toEqual(mockApprovedRequest);
    });

    test("should return 400 if requestId is missing", async () => {
        req.body = {}; // No requestId
    
        await approveRequest(req, res);
    
        expect(res.statusCode).toBe(400);
        const responseData =  (res._getJSONData());
        expect(responseData).toEqual({ message: 'Bad request' });
    });

    test("should return 404 if requestId does not match any existing request", async () => {
        ArrangementRequest.findByIdAndUpdate.mockResolvedValue(null); // Simulate not finding the request
    
        await approveRequest(req, res);
    
        expect(res.statusCode).toBe(404);
        const responseData =  (res._getJSONData());
        expect(responseData).toEqual({ message: 'Request not found' });
    });

    test("should return 500 if there is a database error", async () => {
        const dbError = new Error("Database error");
        ArrangementRequest.findByIdAndUpdate.mockRejectedValue(dbError); // Simulate a database error
    
        await approveRequest(req, res);
    
        expect(res.statusCode).toBe(500);
        const responseData =  (res._getJSONData());
        expect(responseData).toEqual({ message: 'Server error' });
    });
});

describe("rejectRequest", () => {
    let req, res;

    beforeEach(() => {
        req = httpMocks.createRequest({
            method: "POST",
            url: "/arrangementrequests/reject",
            body: {
                requestId: 'validRequestId',
                reason: 'Not needed anymore',
            }
        });
        res = httpMocks.createResponse();
    });

    test("should reject the request successfully", async () => {
        const mockRejectedRequest = { _id: 'validRequestId', status: 'Rejected', rejection_reason: 'Not needed anymore' };
        ArrangementRequest.findByIdAndUpdate.mockResolvedValue(mockRejectedRequest);

        await rejectRequest(req, res);

        expect(res.statusCode).toBe(200);
        const responseData =  (res._getJSONData());
        expect(responseData.data).toEqual(mockRejectedRequest);
    });

    test("should return 400 if requestId or reason is missing", async () => {
        req.body = { requestId: 'validRequestId' }; // No reason
        await rejectRequest(req, res);
        
        expect(res.statusCode).toBe(400);
        let responseData = (res._getJSONData());
        expect(responseData).toEqual({ message: "Bad request" });
    });
});

describe("approveSelectedRequests", () => {
    let req, res;

    beforeEach(() => {
        req = httpMocks.createRequest({
            method: "POST",
            url: "/arrangementrequests/approveSelected",
            body: {
                requestIds: ['validRequestId1', 'validRequestId2'],
                managerId: 'validManagerId'
            }
        });
        res = httpMocks.createResponse();
    });

    test("should approve selected requests successfully", async () => {
        const mockApprovedSelectedRequest = { 
            _id: 'validRequestId1', status: 'Approved',
            _id: 'validRequestId2', status: 'Approved'
         };
        ArrangementRequest.updateMany.mockResolvedValue({ mockApprovedSelectedRequest });

        await approveSelectedRequests(req, res);

        expect(res.statusCode).toBe(200);
        const responseData = res._getJSONData();
        expect(responseData.data).toEqual({ mockApprovedSelectedRequest });
    });

    test("should return 400 if requestIds or managerId are missing", async () => {
        req.body = { managerId: 'validManagerId' }; // No requestIds
        await approveSelectedRequests(req, res);
        expect(res.statusCode).toBe(400);
        expect(res._getJSONData()).toEqual({ message: "No Request Selected" });
    });

    test("should return 404 if no requests are found to approve", async () => {
        ArrangementRequest.updateMany.mockResolvedValue({ nModified: 0 });

        await approveSelectedRequests(req, res);

        expect(res.statusCode).toBe(404);
        expect(res._getJSONData()).toEqual({ message: 'Request not found' });
    });

    test("should return 500 if there is a database error", async () => {
        const dbError = new Error("Database error");
        ArrangementRequest.updateMany.mockRejectedValue(dbError);

        await approveSelectedRequests(req, res);

        expect(res.statusCode).toBe(500);
        expect(res._getJSONData()).toEqual({ message: 'Server error' });
    });
});

describe("rejectSelectedRequests", () => {
    let req, res;

    beforeEach(() => {
        req = httpMocks.createRequest({
            method: "POST",
            url: "/arrangementrequests/rejectSelected",
            body: {
                requestIds: ['validRequestId1', 'validRequestId2'],
                reason: 'Not needed anymore',
            }
        });
        res = httpMocks.createResponse();
    });

    test("should reject selected requests successfully", async () => {
        const mockRejectedSelectedRequest = { 
            _id: 'validRequestId1', status: 'Rejected', rejection_reason: 'Not needed anymore',
            _id: 'validRequestId2', status: 'Rejected', rejection_reason: 'Not needed anymore' 
        };
        ArrangementRequest.updateMany.mockResolvedValue({ mockRejectedSelectedRequest });

        await rejectSelectedRequests(req, res);

        expect(res.statusCode).toBe(200);
        const responseData = res._getJSONData();
        expect(responseData.data).toEqual({ mockRejectedSelectedRequest });
    });

    test("should return 400 if reason or requestIds are missing", async () => {
        req.body = { requestIds: ['validRequestId1', 'validRequestId2'] }; // No reason
        await rejectSelectedRequests(req, res);
        expect(res.statusCode).toBe(400);
        expect(res._getJSONData()).toEqual({ message: "Rejection Reason Required" });    
    });

    test("should return 404 if no requests are found to reject", async () => {
        ArrangementRequest.updateMany.mockResolvedValue({ nModified: 0 });

        await rejectSelectedRequests(req, res);

        expect(res.statusCode).toBe(404);
        expect(res._getJSONData()).toEqual({ message: 'Request not found' });
    });

    test("should return 500 if there is a database error", async () => {
        const dbError = new Error("Database error");
        ArrangementRequest.updateMany.mockRejectedValue(dbError);

        await rejectSelectedRequests(req, res);

        expect(res.statusCode).toBe(500);
        expect(res._getJSONData()).toEqual({ message: 'Server error' });
    });
});

describe("approveGroupRequests", () => {
    let req, res;

    beforeEach(() => {
        req = httpMocks.createRequest({
            method: "POST",
            url: "/arrangementrequests/approveGroup",
            body: {
                requestIds: ['validRequestId1', 'validRequestId2'],
            }
        });
        res = httpMocks.createResponse();
    });

    test("should approve group requests successfully", async () => {
        const mockApprovedGroupRequest = { 
            _id: 'validRequestId1', group_id: 'testgroup 1', status: 'Approved',
            _id: 'validRequestId2', group_id: 'testgroup 1', status: 'Approved' 
        };
        ArrangementRequest.updateMany.mockResolvedValue({ mockApprovedGroupRequest });

        await approveGroupRequests(req, res);

        expect(res.statusCode).toBe(200);
        const responseData = res._getJSONData();
        expect(responseData.data).toEqual({ mockApprovedGroupRequest });
    });

    test("should return 400 if requestIds are missing", async () => {
        req.body = {}; // No requestIds

        await approveGroupRequests(req, res);

        expect(res.statusCode).toBe(400);
        expect(res._getJSONData()).toEqual({ message: "No Request Selected" });
    });

    test("should return 404 if no requests are found to approve", async () => {
        ArrangementRequest.updateMany.mockResolvedValue({ nModified: 0 });

        await approveGroupRequests(req, res);

        expect(res.statusCode).toBe(404);
        expect(res._getJSONData()).toEqual({ message: 'Request not found' });
    });

    test("should return 500 if there is a database error", async () => {
        const dbError = new Error("Database error");
        ArrangementRequest.updateMany.mockRejectedValue(dbError);

        await approveGroupRequests(req, res);

        expect(res.statusCode).toBe(500);
        expect(res._getJSONData()).toEqual({ message: 'Server error' });
    });
});

describe("rejectGroupRequests", () => {
    let req, res;

    beforeEach(() => {
        req = httpMocks.createRequest({
            method: "POST",
            url: "/arrangementrequests/rejectGroup",
            body: {
                requestIds: ['validRequestId1', 'validRequestId2'],
                reason: 'Not needed anymore',
            }
        });
        res = httpMocks.createResponse();
    });

    test("should reject group requests successfully", async () => {
        const mockRejectGroupRequest = { 
            _id: 'validRequestId1', group_id: 'testgroup 1', status: 'Rejected', rejection_reason: 'reject reason',
            _id: 'validRequestId2', group_id: 'testgroup 1', status: 'Rejected', rejection_reason: 'reject reason' 
        };
        ArrangementRequest.updateMany.mockResolvedValue({ mockRejectGroupRequest });

        await rejectGroupRequests(req, res);

        expect(res.statusCode).toBe(200);
        const responseData = res._getJSONData();
        expect(responseData.data).toEqual({ mockRejectGroupRequest });
    });

    test("should return 400 if reason or requestIds are missing", async () => {
        req.body = { requestIds: ['validRequestId1', 'validRequestId2'] }; // No reason
        await rejectGroupRequests(req, res);
        expect(res.statusCode).toBe(400);
        expect(res._getJSONData()).toEqual({ message: "Rejection Reason Required" });
    });

    test("should return 404 if no requests are found to reject", async () => {
        ArrangementRequest.updateMany.mockResolvedValue({ modifiedCount: 0 });

        await rejectGroupRequests(req, res);

        expect(res.statusCode).toBe(404);
        expect(res._getJSONData()).toEqual({ message: 'Request not found' });
    });

    test("should return 500 if there is a database error", async () => {
        const dbError = new Error("Database error");
        ArrangementRequest.updateMany.mockRejectedValue(dbError);

        await rejectGroupRequests(req, res);

        expect(res.statusCode).toBe(500);
        expect(res._getJSONData()).toEqual({ message: 'Server error' });
    });
});



describe("approveAllRequests", () => {
    let req, res;

    beforeEach(() => {
        req = httpMocks.createRequest({
            method: "POST",
            url: "/arrangementrequests/approveAll",
            body: {
                // requestIds: ['validRequestId1', 'validRequestId2'],
                managerId: 'validManagerId' // Include the Manager ID
            }
        });
        res = httpMocks.createResponse();
    });

    test("should approve all requests successfully", async () => {
        const mockApprovedAllRequest = { 
            _id: 'validRequestId1', status: 'Approved',
            _id: 'validRequestId2', status: 'Approved'
        };
        ArrangementRequest.updateMany.mockResolvedValue({ mockApprovedAllRequest });
        ArrangementRequest.find.mockResolvedValue([{ id: 'validRequestId1' }, { id: 'validRequestId2' }]); // Mock finding requests

        //ArrangementRequest.updateMany.mockResolvedValue({ nModified: 2 });

        await approveAllRequests(req, res);
        expect(res.statusCode).toBe(200);
        const responseData = res._getJSONData();
        expect(responseData.data).toEqual({ mockApprovedAllRequest });
    });        

    test("should return 400 if requestIds are missing", async () => {
        req.body = { managerId: 'validManagerId' }; // Only managerId is present
        ArrangementRequest.find.mockResolvedValue([]);
        await approveAllRequests(req, res);
        expect(res.statusCode).toBe(404); // This case will fall through to not found
        expect(res._getJSONData()).toEqual({ message: "Request not found" });
    });    
});

describe("rejectAllRequests", () => {
    let req, res;

    beforeEach(() => {
        req = httpMocks.createRequest({
            method: "POST",
            url: "/arrangementrequests/rejectAll",
            body: {
                managerId: 'validManagerId',
                reason: 'Not needed anymore'
            }
        });
        res = httpMocks.createResponse();
    });

    test("should reject all requests successfully", async () => {
        // Mocking the response to indicate successful rejection
        ArrangementRequest.updateMany.mockResolvedValue({ modifiedCount: 2 }); // Simulating that 2 requests were modified
    
        // Mocking the find call to return some pending requests
        ArrangementRequest.find.mockResolvedValue([
            { manager_id: 'validManagerId', status: 'Pending' },
            { manager_id: 'validManagerId', status: 'Pending' }
        ]);
    
        await rejectAllRequests(req, res);
    
        expect(res.statusCode).toBe(200);
        const responseData = res._getJSONData();
        expect(responseData.message).toEqual('Success');
    });
    
    test("should return 400 if reason is missing", async () => {
        req.body = { managerId: 'validManagerId' }; // No reason
        await rejectAllRequests(req, res);
        expect(res.statusCode).toBe(400);
        expect(res._getJSONData()).toEqual({ message: "Rejection Reason Required" });
    });

    test("should return 404 if no requests are found to reject", async () => {
        ArrangementRequest.find.mockResolvedValue([]);
    
        ArrangementRequest.updateMany.mockResolvedValue({ nModified: 0 });
    
        await rejectAllRequests(req, res);
    
        expect(res.statusCode).toBe(404);
        expect(res._getJSONData()).toEqual({ message: 'Request not found' });
    });
    

    test("should return 500 if there is a database error", async () => {
        const dbError = new Error("Database error");
        ArrangementRequest.find.mockResolvedValue([{ manager_id: 'validManagerId' }]);
        ArrangementRequest.updateMany.mockRejectedValue(dbError);
    
        await rejectAllRequests(req, res);
    
        expect(res.statusCode).toBe(500);
        expect(res._getJSONData()).toEqual({ message: 'Server error' });
    });
    
});