import { cancelPendingArrangementRequests } from "../../api/controllers/arrangementRequestsController";
import mongoose from "mongoose";
import httpMocks from "node-mocks-http";
import ArrangementRequest from "../../api/models/arrangementRequestsModel.js";
import dotenv from 'dotenv';

dotenv.config();

const mongoURI = process.env.MONGODB_URI_TEST;

beforeAll(async () => {
  await mongoose.connect(mongoURI);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

afterEach(async () => {
  await ArrangementRequest.deleteMany({});
});

describe("cancelPendingArrangementRequests - Integration Test with MongoDB Atlas", () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest({
      method: "POST",
      url: "/arrangementRequests/cancel",
      body: {
        staffId: 140881,
        requestIds: [],
        cancelAll: false,
      },
    });
    res = httpMocks.createResponse();
  });

  test("should cancel selected pending requests and return 200", async () => {
    const testRequest1 = new ArrangementRequest({
      staff_id: 140881,
      request_date: new Date("2024-10-05T16:00:00.000Z"),
      status: "Pending",
      manager_id: 140008,
      group_id: null,
      request_time: "PM",
      reason: "Medical appointment"
    });
    const testRequest2 = new ArrangementRequest({
      staff_id: 140881,
      request_date: new Date("2024-10-10T16:00:00.000Z"),
      status: "Pending",
      manager_id: 140008,
      group_id: null,
      request_time: "AM",
      reason: "Personal errand"
    });

    await testRequest1.save();
    await testRequest2.save();


    req.body.requestIds = [testRequest1._id.toString()];

    await cancelPendingArrangementRequests(req, res);

    const response = res._getJSONData();
    const updatedRequest1 = await ArrangementRequest.findById(testRequest1._id);

    expect(res.statusCode).toBe(200);
    expect(updatedRequest1.status).toBe("Cancelled");
    expect(response.data).toContain(testRequest1._id.toString());
    expect(response.message).toBe("Selected request(s) have been successfully cancelled.");
  });

  test("should return 404 if no pending requests found for cancellation", async () => {
    const approvedRequest = new ArrangementRequest({
      staff_id: 140881,
      request_date: new Date("2024-10-05T16:00:00.000Z"),
      status: "Approved",
      manager_id: 140008,
      group_id: null,
      request_time: "PM",
      reason: "Medical appointment"
    });
    await approvedRequest.save();

    req.body.requestIds = [approvedRequest._id.toString()];  
    await cancelPendingArrangementRequests(req, res);

    const response = res._getJSONData();
    expect(res.statusCode).toBe(404);
    expect(response.message).toBe("No pending requests found for cancellation.");
  });
        
  test("should cancel all requests in the group when cancelAll is true", async () => {
    const testRequest1 = new ArrangementRequest({
      staff_id: 140881,
      request_date: new Date(),
      status: "Pending",
      group_id: "group123",
      reason: "Children",  
      request_time: "AM",     
      manager_id: 140008
    });      
    const testRequest2 = new ArrangementRequest({
      staff_id: 140881,
      request_date: new Date(),
      status: "Pending",
      group_id: "group123",
      reason: "Children",  
      request_time: "PM",     
      manager_id: 140008      
    });
    await testRequest1.save();
    await testRequest2.save();
  
    req = httpMocks.createRequest({
      method: "POST",
      url: "/arrangementRequests/cancel",
      body: {
        staffId: "140881",
        requestIds: [testRequest1._id],
        cancelAll: true,
      },
    });
  
    await cancelPendingArrangementRequests(req, res);
    const response = res._getJSONData();
  
    expect(res.statusCode).toBe(200);
  
   
    const updatedRequest1 = await ArrangementRequest.findById(testRequest1._id);
    const updatedRequest2 = await ArrangementRequest.findById(testRequest2._id);
    
    expect(updatedRequest1.status).toBe("Cancelled");
    expect(updatedRequest2.status).toBe("Cancelled");
  });
  test("should cancel only the selected requests when cancelAll is false", async () => {
    const testRequest1 = new ArrangementRequest({
      staff_id: 140881,
      request_date: new Date(),
      status: "Pending",
      group_id: "group123",
      reason: "Hungry",  
      request_time: "PM",     
      manager_id: 140008    
    });
    const testRequest2 = new ArrangementRequest({
      staff_id: 140881,
      request_date: new Date(),
      status: "Pending",
      group_id: "group123",
      reason: "Sleepy",  
      request_time: "PM",     
      manager_id: 140008    
    });
    await testRequest1.save();
    await testRequest2.save();
  
    req = httpMocks.createRequest({
      method: "POST",
      url: "/arrangementRequests/cancel",
      body: {
        staffId: "140881",
        requestIds: [testRequest1._id], 
        cancelAll: false,
      },
    });
  
    await cancelPendingArrangementRequests(req, res);
    const response = res._getJSONData();
  
    expect(res.statusCode).toBe(200);
  
    const updatedRequest1 = await ArrangementRequest.findById(testRequest1._id);
    const updatedRequest2 = await ArrangementRequest.findById(testRequest2._id);
    
    expect(updatedRequest1.status).toBe("Cancelled");
    expect(updatedRequest2.status).toBe("Pending"); 
  });
  
  test("should not cancel requests with non-pending status", async () => {
    const testRequest1 = new ArrangementRequest({
      staff_id: 140881,
      request_date: new Date(),
      status: "Approved",     
      group_id: "group123",
      reason: "Golf",   
      request_time: "AM",     
      manager_id: 140008      
    });
    const testRequest2 = new ArrangementRequest({
      staff_id: 140881,
      request_date: new Date(),
      status: "Rejected",    
      group_id: "group123",
      reason: "Medical",      
      request_time: "PM",      
      manager_id: 140008       
    });
    await testRequest1.save();
    await testRequest2.save();
  
    req = httpMocks.createRequest({
      method: "POST",
      url: "/arrangementRequests/cancel",
      body: {
        staffId: "140881",
        requestIds: [testRequest1._id, testRequest2._id],
        cancelAll: false,
      },
    });
  
    await cancelPendingArrangementRequests(req, res);
    const response = res._getJSONData();
  
    expect(res.statusCode).toBe(404);  
    expect(response.message).toBe("No pending requests found for cancellation.");
  
    
    const updatedRequest1 = await ArrangementRequest.findById(testRequest1._id);
    const updatedRequest2 = await ArrangementRequest.findById(testRequest2._id);
    
    expect(updatedRequest1.status).toBe("Approved");
    expect(updatedRequest2.status).toBe("Rejected");
  });
  
  
});
