import { createNotification } from "../../api/controllers/notificationController.js";
import mongoose from "mongoose";
import httpMocks from "node-mocks-http";
import Notification from "../../api/models/notificationModel.js";
import { MongoMemoryServer } from 'mongodb-memory-server-core';

let mongoServer;

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
  await Notification.deleteMany({});
});

describe("Notification Creation - Integration Tests", () => {
  let req, res;

  beforeEach(() => {
    res = httpMocks.createResponse();
  });

  const testCases = [
    { 
      description: "manager approves (Pending -> Approved)", 
      old_status: "Pending", 
      new_status: "Approved",
      request_type: "Manager_Action"
    },
    { 
      description: "manager rejects (Pending -> Rejected)", 
      old_status: "Pending", 
      new_status: "Rejected",
      request_type: "Manager_Action"
    },
    { 
      description: "manager withdraws (Approved -> Withdrawn)", 
      old_status: "Approved", 
      new_status: "Withdrawn",
      request_type: "Manager_Action"
    },
    { 
      description: "staff creates a request (N/A -> Pending)", 
      old_status: "N/A", 
      new_status: "Pending",
      request_type: "Staff_Action"
    },
    { 
      description: "staff requests to withdraw (Approved -> Pending Withdrawal)", 
      old_status: "Approved", 
      new_status: "Pending Withdrawal",
      request_type: "Staff_Action"
    },
    { 
      description: "manager accepts pending withdrawal (Pending Withdrawal -> Withdrawn)", 
      old_status: "Pending Withdrawal", 
      new_status: "Withdrawn",
      request_type: "Manager_Action"
    },
    { 
      description: "manager rejects pending withdrawal (Pending Withdrawal -> Approved)", 
      old_status: "Pending Withdrawal", 
      new_status: "Approved",
      request_type: "Manager_Action"
    }
  ];

  testCases.forEach(({ description, old_status, new_status, request_type }) => {
    test(`should create notification when ${description}`, async () => {
      req = httpMocks.createRequest({
        method: "POST",
        url: "/notifications",
        body: {
          request_id: new mongoose.Types.ObjectId(),
          changed_by: 140881,
          receiver_id: 140882,
          old_status: old_status,
          new_status: new_status,
          created_at: new Date(),
          reason: "Status updated by manager/staff",
          request_type: request_type,
        },
      });

      await createNotification(req.body);

      const notification = await Notification.findOne({
        changed_by: 140881,
        receiver_id: 140882,
        old_status: old_status,
        new_status: new_status
      });

      expect(notification).toBeTruthy();
      expect(notification.receiver_id).toBe(140882);
      expect(notification.old_status).toBe(old_status);
      expect(notification.new_status).toBe(new_status);
      expect(notification.request_type).toBe(request_type);
      expect(notification.reason).toBe("Status updated by manager/staff");
    });
  });

  test("should return a 400 if required fields are missing", async () => {
    req = httpMocks.createRequest({
      method: "POST",
      url: "/notifications",
      body: {
        changed_by: 140881,
        receiver_id: 140882,
        old_status: "Pending",
        new_status: "Approved",
        reason: "Approved by manager",
        request_type: "Manager_Action",
      },
    });

    await expect(createNotification(req.body)).rejects.toThrow("Missing required fields");
  });
});
