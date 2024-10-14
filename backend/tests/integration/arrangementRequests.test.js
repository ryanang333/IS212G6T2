import {
    approveRequest,
    rejectRequest,
    approveSelectedRequests,
    rejectSelectedRequests,
    approveGroupRequests,
    rejectGroupRequests,
    approveAllRequests,
    rejectAllRequests
 } from "../../api/controllers/arrangementRequestsController.js";
import {
    mockPendingArrangementRequest,
    mockPendingArrangementRequestSelected,
    mockPendingArrangementRequestGroup,
    mockPendingArrangementRequestAll
} from "../mock/arrangement_requests.js";
import mongoose from "mongoose";
import httpMocks from "node-mocks-http";
import ArrangementRequest from "../../api/models/arrangementRequestsModel.js";
import Staff from "../../api/models/staffModel.js";
import { MongoMemoryServer } from "mongodb-memory-server-core";

let mongoServer;

jest.setTimeout(120000);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoURI = mongoServer.getUri();
  await mongoose.connect(mongoURI);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

afterEach(async () => {
  await ArrangementRequest.deleteMany({});
  await Staff.deleteMany({});
});




  
describe('Arrangement Requests API', () => {
  
    it('should approve a request', async () => {
        const requestEntry = await ArrangementRequest.create({

          _id: "66fe5b8756686491085b1320",
        staff_id: 140881,
        request_date: new Date("2024-10-05T00:00:00.000Z"),
        status: "Pending",
        manager_id: 140008,
        group_id: "a2e203f1-eb27-42c7-acd8-ededa216e7c8",
        request_time: "AM",
        reason: "Testing",
        });
    
        const req = httpMocks.createRequest({
          method: 'POST',
          url: '/arrangementRequests/approve',
          body: { requestId: requestEntry._id }
        });
    
        const res = httpMocks.createResponse();
    
        await approveRequest(req, res);
    
        expect(res.statusCode).toBe(200);
        expect(res._getJSONData().data.status).toBe('Approved');
      });
  
      it('should reject a request with a reason', async () => {
        const requestEntry = await ArrangementRequest.create({
            _id: "66fe5b8756686491085b1320",
            staff_id: 140881,
            request_date: new Date("2024-10-05T00:00:00.000Z"),
            status: "Pending",
            manager_id: 140008,
            group_id: "a2e203f1-eb27-42c7-acd8-ededa216e7c8",
            request_time: "AM",
            reason: "Testing",
        });
    
        const req = httpMocks.createRequest({
          method: 'POST',
          url: '/arrangementRequests/reject',
          body: { requestId: requestEntry._id, reason: 'Not valid' }
        });
    
        const res = httpMocks.createResponse();
    
        await rejectRequest(req, res);
    
        expect(res.statusCode).toBe(200);
        expect(res._getJSONData().data.status).toBe('Rejected');
        expect(res._getJSONData().data.rejection_reason).toBe('Not valid');
      });
  
      it('should approve selected requests', async () => {
        const requests = await ArrangementRequest.create([
          { 
            _id: "66fe5b8756686491085b1320",
            staff_id: 140881,
            request_date: new Date("2024-10-05T00:00:00.000Z"),
            status: "Pending",
            manager_id: 140008,
            group_id: "a2e203f1-eb27-42c7-acd8-ededa216e7c8",
            request_time: "AM",
            reason: "Testing",
           },
          {  _id: "66fe5b8756686491085b1321",
            staff_id: 140881,
            request_date: new Date("2024-10-05T00:00:00.000Z"),
            status: "Pending",
            manager_id: 140008,
            group_id: "a2e203f1-eb27-42c7-acd8-ededa216e7c8",
            request_time: "PM",
            reason: "Testing", },
        ]);
    
        const req = httpMocks.createRequest({
          method: 'POST',
          url: '/arrangementRequests/approveSelected',
          body: { requestIds: requests.map(r => r._id), managerId: 140008 }
        });
    
        const res = httpMocks.createResponse();
    
        await approveSelectedRequests(req, res);
    
        expect(res.statusCode).toBe(200);
      });

      it('should reject selected requests', async () => {
        const requests = await ArrangementRequest.create([
            { 
                _id: "66fe5b8756686491085b1320",
                staff_id: 140881,
                request_date: new Date("2024-10-05T00:00:00.000Z"),
                status: "Pending",
                manager_id: 140008,
                group_id: "a2e203f1-eb27-42c7-acd8-ededa216e7c8",
                request_time: "AM",
                reason: "Testing",
               },
              {  _id: "66fe5b8756686491085b1321",
                staff_id: 140881,
                request_date: new Date("2024-10-05T00:00:00.000Z"),
                status: "Pending",
                manager_id: 140008,
                group_id: "a2e203f1-eb27-42c7-acd8-ededa216e7c8",
                request_time: "PM",
                reason: "Testing", 
            },
        ]);
    
        const req = httpMocks.createRequest({
          method: 'POST',
          url: '/arrangementRequests/rejectSelected',
          body: { requestIds: requests.map(r => r._id), reason: 'Not needed' }
        });
    
        const res = httpMocks.createResponse();
    
        await rejectSelectedRequests(req, res);
    
        expect(res.statusCode).toBe(200);
      });

      it('should approve group requests', async () => {
        const requests = await ArrangementRequest.create([
            { 
                _id: "66fe5b8756686491085b1320",
                staff_id: 140881,
                request_date: new Date("2024-10-05T00:00:00.000Z"),
                status: "Pending",
                manager_id: 140008,
                group_id: "a2e203f1-eb27-42c7-acd8-ededa216e7c8",
                request_time: "AM",
                reason: "Testing",
               },
              {  _id: "66fe5b8756686491085b1321",
                staff_id: 140881,
                request_date: new Date("2024-10-05T00:00:00.000Z"),
                status: "Pending",
                manager_id: 140008,
                group_id: "a2e203f1-eb27-42c7-acd8-ededa216e7c8",
                request_time: "PM",
                reason: "Testing", },
        ]);
    
        const req = httpMocks.createRequest({
          method: 'POST',
          url: '/arrangementRequests/approveGroup',
          body: { requestIds: requests.map(r => r._id) }
        });
    
        const res = httpMocks.createResponse();
    
        await approveGroupRequests(req, res);
    
        expect(res.statusCode).toBe(200);
      });
    
      it('should reject group requests', async () => {
        const requests = await ArrangementRequest.create([
            { 
                _id: "66fe5b8756686491085b1320",
                staff_id: 140881,
                request_date: new Date("2024-10-05T00:00:00.000Z"),
                status: "Pending",
                manager_id: 140008,
                group_id: "a2e203f1-eb27-42c7-acd8-ededa216e7c8",
                request_time: "AM",
                reason: "Testing",
               },
              {  _id: "66fe5b8756686491085b1321",
                staff_id: 140881,
                request_date: new Date("2024-10-05T00:00:00.000Z"),
                status: "Pending",
                manager_id: 140008,
                group_id: "a2e203f1-eb27-42c7-acd8-ededa216e7c8",
                request_time: "PM",
                reason: "Testing", },
        ]);
    
        const req = httpMocks.createRequest({
          method: 'POST',
          url: '/arrangementRequests/rejectGroup',
          body: { requestIds: requests.map(r => r._id), reason: 'Not needed' }
        });
    
        const res = httpMocks.createResponse();
    
        await rejectGroupRequests(req, res);
    
        expect(res.statusCode).toBe(200);
      });

      it('should approve all requests', async () => {
        const requests = await ArrangementRequest.create([
            { 
                _id: "66fe5b8756686491085b1320",
                staff_id: 140881,
                request_date: new Date("2024-10-05T00:00:00.000Z"),
                status: "Pending",
                manager_id: 140008,
                group_id: "a2e203f1-eb27-42c7-acd8-ededa216e7c8",
                request_time: "AM",
                reason: "Testing",
               },
              {  _id: "66fe5b8756686491085b1321",
                staff_id: 140881,
                request_date: new Date("2024-10-05T00:00:00.000Z"),
                status: "Pending",
                manager_id: 140008,
                group_id: "a2e203f1-eb27-42c7-acd8-ededa216e7c8",
                request_time: "PM",
                reason: "Testing", 
            },
        ]);
    
        const req = httpMocks.createRequest({
          method: 'POST',
          url: '/arrangementRequests/approveAll',
          body: { managerId: 140008 }
        });
    
        const res = httpMocks.createResponse();
    
        await approveAllRequests(req, res);
    
        expect(res.statusCode).toBe(200);
      });

      it('should reject all requests with a reason', async () => {
        const requests = await ArrangementRequest.create([
            { 
                _id: "66fe5b8756686491085b1320",
                staff_id: 140881,
                request_date: new Date("2024-10-05T00:00:00.000Z"),
                status: "Pending",
                manager_id: 140008,
                group_id: "a2e203f1-eb27-42c7-acd8-ededa216e7c8",
                request_time: "AM",
                reason: "Testing",
               },
              {  _id: "66fe5b8756686491085b1321",
                staff_id: 140881,
                request_date: new Date("2024-10-05T00:00:00.000Z"),
                status: "Pending",
                manager_id: 140008,
                group_id: "a2e203f1-eb27-42c7-acd8-ededa216e7c8",
                request_time: "PM",
                reason: "Testing", },
        ]);
    
        const req = httpMocks.createRequest({
          method: 'POST',
          url: '/arrangementRequests/rejectAll',
          body: { managerId: 140008, reason: 'Not needed' }
        });
    
        const res = httpMocks.createResponse();
    
        await rejectAllRequests(req, res);
    
        expect(res.statusCode).toBe(200);
      });
  
    
  });