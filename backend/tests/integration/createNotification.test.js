import mongoose from "mongoose";
import httpMocks from "node-mocks-http";
import { createNotification } from "../../api/controllers/notificationController.js";
import Notification from "../../api/models/notificationModel.js";
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
  await Notification.deleteMany({});
});

describe("createNotification - Integration Test", () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest({
      method: "POST",
      url: "/notifications",
      body: {
        recipient_type: "staff",
        recipient_id: "140881",
        request_type: "Work From Home",
        request_date_time: new Date(),
        status: "Pending",
        reason: "Health reasons",
        notification_message: "Your WFH request is pending.",
      },
    });
    res = httpMocks.createResponse();
  });

  test("should create a new notification and return 201 on success", async () => {
    await createNotification(req, res);
    const response = res._getJSONData();
    
    expect(res.statusCode).toBe(201);
    expect(response.data).toHaveProperty("_id");
    expect(response.data.recipient_id).toBe("140881");
  });

  test("should return 400 if required fields are missing", async () => {
    req.body = {};  // Empty body to simulate missing fields
    await createNotification(req, res);
    const response = res._getData();

    expect(res.statusCode).toBe(400);
    expect(response).toContain("Missing required fields");
  });
});
