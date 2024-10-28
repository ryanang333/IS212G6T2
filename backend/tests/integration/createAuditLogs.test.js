import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server-core';
import request from 'supertest';
import httpMocks from "node-mocks-http";
import app from '../../api/index';  // Assuming this is your Express app entry point
import ArrangementRequest from "../../api/models/arrangementRequestsModel.js";
import RequestAudit from '../../api/models/requestAuditModel';
import { 
    createNewRequests,
    createNewCEORequests
 } from '../../api/utils/creationUtils.js';
import { 
    approveStaffRequests,
    rejectStaffRequests,
    cancelStaffRequests,
    withdrawStaffRequests,
    ApproveWithdrawalRequest,
    RejectWithdrawalRequest,
    withdrawRequestsAsManager
 } from '../../api/controllers/arrangementRequestsController.js';


let mongoServer;
let server;

beforeAll(async () => {
  // Start MongoMemoryServer for in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Check if there's an active connection and disconnect if necessary
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  // Connect to the in-memory MongoDB instance
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Start the server on a random port
  server = app.listen(0);  // 0 allows the OS to assign a random available port
});

afterAll(async () => {
  // Close MongoDB connection and stop in-memory server
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();

  // Close the Express server, awaiting the close event
  await new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
});

afterEach(async () => {
  // Clear the collections after each test
  await ArrangementRequest.deleteMany({});
  await RequestAudit.deleteMany({});
});

describe("createAuditLogs - Integration Test with MongoDB", () => {

    test("should create an audit log when new requests are created", async () => {
        const staffId = 140008;
        const managerId = 140001;
    
        const arrangementRequests = [
          {
            date: '2025-01-01T00:00:00.000Z',
            time: 'AM',
            reason: 'Test reason',
            group_id: null,
          },
        ];
    
        await createNewRequests(arrangementRequests, staffId, managerId);
    
        const createdRequests = await ArrangementRequest.find({ staff_id: staffId });
        expect(createdRequests.length).toBe(1);
        expect(createdRequests[0].reason).toBe('Test reason');
    
        const auditLogs = await RequestAudit.find({ changed_by: staffId });
        expect(auditLogs.length).toBe(1);
        expect(auditLogs[0].request_id.toString()).toBe(createdRequests[0]._id.toString());
        expect(auditLogs[0].old_status).toBe('N/A');
        expect(auditLogs[0].new_status).toBe('Pending');
    });

    test("should create an audit log when new CEO requests are created", async () => {
        const staffId = 130002;
        const managerId = 130002;
    
        const arrangementRequests = [
          {
            date: '2025-01-01T00:00:00.000Z',
            time: 'AM',
            reason: 'Test reason',
            group_id: null,
          },
        ];
    
        await createNewCEORequests(arrangementRequests, staffId, managerId);
    
        const createdRequests = await ArrangementRequest.find({ staff_id: staffId });
        expect(createdRequests.length).toBe(1);
        expect(createdRequests[0].reason).toBe('Test reason');

        const auditLogs = await RequestAudit.find({ changed_by: staffId });
        expect(auditLogs.length).toBe(1);
        expect(auditLogs[0].request_id.toString()).toBe(createdRequests[0]._id.toString());
        expect(auditLogs[0].old_status).toBe('N/A');
        expect(auditLogs[0].new_status).toBe('Approved');
    });
});

describe("Approve AuditLogs - Integration Test with MongoDB", () => {

    let req, res;

    beforeEach(() => {
        req = httpMocks.createRequest({
        method: "PATCH",
        url: "/arrangementRequests/staffapproval",
        body: {
            requests: [],
        },
        });
        res = httpMocks.createResponse();
    });

    test("should create an audit log when requests are approved", async () => {    
        const arrangementRequests = new ArrangementRequest({
            staff_id: 140008,
            request_date: new Date("2025-01-01T00:00:00.000Z"),
            status: "Pending",
            manager_id: 140001,
            group_id: null,
            request_time: "AM",
            reason: "Test",
        });
        await arrangementRequests.save();
        
        req.body.requests = [arrangementRequests];
        await approveStaffRequests(req, res);
    
        const response = res._getJSONData();
        expect(res.statusCode).toBe(200);
    
        const auditLogs = await RequestAudit.find({ changed_by: arrangementRequests.manager_id });
        expect(auditLogs.length).toBe(1);
        expect(auditLogs[0].old_status).toBe('Pending');
        expect(auditLogs[0].new_status).toBe('Approved');
    });
});

describe("Reject AuditLogs - Integration Test with MongoDB", () => {

    let req, res;
    const reason = "Test rejection reason";

    beforeEach(() => {
        req = httpMocks.createRequest({
        method: "PATCH",
        url: "/arrangementRequests/staffrejection",
        body: {
            requests: [],
            reason: reason
        },
        });
        res = httpMocks.createResponse();
    });

    test("should create an audit log when requests are rejected", async () => {    
        const arrangementRequests = new ArrangementRequest({
            staff_id: 140008,
            request_date: new Date("2025-01-01T00:00:00.000Z"),
            status: "Pending",
            manager_id: 140001,
            group_id: null,
            request_time: "AM",
            reason: "Test",
        });
        const rejection_reason = "Rejected";
        await arrangementRequests.save();
        
        req.body.requests = [arrangementRequests];
        await rejectStaffRequests(req, res);
    
        const response = res._getJSONData();
        expect(res.statusCode).toBe(200);
    
        const auditLogs = await RequestAudit.find({ changed_by: arrangementRequests.manager_id });
        expect(auditLogs.length).toBe(1);
        expect(auditLogs[0].old_status).toBe('Pending');
        expect(auditLogs[0].new_status).toBe('Rejected');
    });
});

describe("Cancel AuditLogs - Integration Test with MongoDB", () => {

    let req, res;

    beforeEach(() => {
        req = httpMocks.createRequest({
        method: "PATCH",
        url: "/arrangementRequests/staffcancellation",
        body: {
            requests: [],
        },
        });
        res = httpMocks.createResponse();
    });

    test("should create an audit log when requests are cancelled", async () => {    
        const arrangementRequests = new ArrangementRequest({
            staff_id: 140008,
            request_date: new Date("2025-01-01T00:00:00.000Z"),
            status: "Pending",
            manager_id: 140001,
            group_id: null,
            request_time: "AM",
            reason: "Test",
        });
        await arrangementRequests.save();
        
        req.body.requests = [arrangementRequests];
        await cancelStaffRequests(req, res);
    
        const response = res._getJSONData();
        expect(res.statusCode).toBe(200);
    
        const auditLogs = await RequestAudit.find({ changed_by: arrangementRequests.staff_id });
        expect(auditLogs.length).toBe(1);
        expect(auditLogs[0].old_status).toBe('Pending');
        expect(auditLogs[0].new_status).toBe('Cancelled');
    });
});

describe("Withdraw AuditLogs - Integration Test with MongoDB", () => {

    let req, res;
    const reason = "Test withdrawal reason";

    beforeEach(() => {
        req = httpMocks.createRequest({
        method: "PATCH",
        url: "/arrangementRequests/staffwithdrawal",
        body: {
            requests: [],
            reason: reason
        },
        });
        res = httpMocks.createResponse();
    });

    test("should create an audit log when requests are pending withdrawal", async () => {    
        const arrangementRequests = new ArrangementRequest({
            staff_id: 140008,
            request_date: new Date("2025-01-01T00:00:00.000Z"),
            status: "Approved",
            manager_id: 140001,
            group_id: null,
            request_time: "AM",
            reason: "Test",
        });
        await arrangementRequests.save();
        
        req.body.requests = [arrangementRequests];
        await withdrawStaffRequests(req, res);
    
        const response = res._getJSONData();
        expect(res.statusCode).toBe(200);
    
        const auditLogs = await RequestAudit.find({ changed_by: arrangementRequests.staff_id });
        expect(auditLogs.length).toBe(1);
        expect(auditLogs[0].old_status).toBe('Approved');
        expect(auditLogs[0].new_status).toBe('Pending Withdrawal');
    });
});

describe("Approve Withdrawal AuditLogs - Integration Test with MongoDB", () => {

    let req, res;

    beforeEach(() => {
        req = httpMocks.createRequest({
        method: "PATCH",
        url: "/arrangementRequests/approveWithdrawal",
        body: {
            requests: [],
        },
        });
        res = httpMocks.createResponse();
    });

    test("should create an audit log when requests are withdrawn", async () => {    
        const arrangementRequests = new ArrangementRequest({
            staff_id: 140008,
            request_date: new Date("2025-01-01T00:00:00.000Z"),
            status: "Pending Withdrawal",
            manager_id: 140001,
            group_id: null,
            request_time: "AM",
            reason: "Test",
            withdrawal_reason: "Test approve withdraw"
        });
        await arrangementRequests.save();
        
        req.body.requests = [arrangementRequests];
        await ApproveWithdrawalRequest(req, res);
    
        const response = res._getJSONData();
        expect(res.statusCode).toBe(200);
    
        const auditLogs = await RequestAudit.find({ changed_by: arrangementRequests.manager_id });
        expect(auditLogs.length).toBe(1);
        expect(auditLogs[0].old_status).toBe('Pending Withdrawal');
        expect(auditLogs[0].new_status).toBe('Withdrawn');
    });
});

describe("Reject Withdrawal AuditLogs - Integration Test with MongoDB", () => {

    let req, res;

    beforeEach(() => {
        req = httpMocks.createRequest({
        method: "PATCH",
        url: "/arrangementRequests/rejectWithdrawal",
        body: {
            requests: []
        },
        });
        res = httpMocks.createResponse();
    });

    test("should create an audit log when requests are rejected", async () => {    
        const arrangementRequests = new ArrangementRequest({
            staff_id: 140008,
            request_date: new Date("2025-01-01T00:00:00.000Z"),
            status: "Pending Withdrawal",
            manager_id: 140001,
            group_id: null,
            request_time: "AM",
            reason: "Test",
        });
        await arrangementRequests.save();
        
        req.body.requests = [arrangementRequests];
        await RejectWithdrawalRequest(req, res);
    
        const response = res._getJSONData();
        expect(res.statusCode).toBe(200);
    
        const auditLogs = await RequestAudit.find({ changed_by: arrangementRequests.manager_id });
        expect(auditLogs.length).toBe(1);
        expect(auditLogs[0].old_status).toBe('Pending Withdrawal');
        expect(auditLogs[0].new_status).toBe('Approved');
    });
});

describe("Withdraw as Manager AuditLogs - Integration Test with MongoDB", () => {

    let req, res;
    const reason = "Test withdrawal reason";

    beforeEach(() => {
        req = httpMocks.createRequest({
        method: "PATCH",
        url: "/arrangementRequests/managerwithdrawal",
        body: {
            requests: [],
            reason: reason
        },
        });
        res = httpMocks.createResponse();
    });

    test("should create an audit log when requests are withdrawn by manager", async () => {    
        const arrangementRequests = new ArrangementRequest({
            staff_id: 140008,
            request_date: new Date("2025-01-01T00:00:00.000Z"),
            status: "Approved",
            manager_id: 140001,
            group_id: null,
            request_time: "AM",
            reason: "Test",
            withdrawal_reason: "Test approve withdraw"
        });
        await arrangementRequests.save();
        
        req.body.requests = [arrangementRequests];
        await withdrawRequestsAsManager(req, res);
    
        const response = res._getJSONData();
        expect(res.statusCode).toBe(200);
    
        const auditLogs = await RequestAudit.find({ changed_by: arrangementRequests.manager_id });
        expect(auditLogs.length).toBe(1);
        expect(auditLogs[0].old_status).toBe('Approved');
        expect(auditLogs[0].new_status).toBe('Withdrawn');
    });
});