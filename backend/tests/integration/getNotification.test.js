import { getNotifications } from "../../api/controllers/notificationController.js";
import mongoose from "mongoose";
import httpMocks from "node-mocks-http";
import Notification from "../../api/models/notificationModel.js";
import { MongoMemoryServer } from "mongodb-memory-server-core";

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

describe("getNotifications - Integration Test with MongoDB", () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest({
      method: "GET",
      url: "/notifications/staff/140881",
      params: {
        staffId: 140881,
      },
    });
    res = httpMocks.createResponse();
  });

  test("should fetch notification logs if notifications are found", async () => {
    const notification = new Notification({
      request_id: new mongoose.Types.ObjectId(),
      request_type: "Manager_Action",
      changed_by: 140008,
      receiver_id: 140881,
      old_status: "Pending",
      new_status: "Approved",
      change_timestamp: new Date("2024-10-04T12:00:00.000Z"),
      reason: "Request approved",
    });
    await notification.save();

    await getNotifications(req, res);

    const response = res._getJSONData();
    
    // Assertions
    expect(res.statusCode).toBe(200);
    expect(response.message).toBe("Notifications fetched successfully!");
    expect(response.notifications).toHaveLength(1);
    expect(response.notifications[0]).toMatchObject({
      request_id: notification.request_id.toString(),
      request_type: notification.request_type,
      changed_by: notification.changed_by,
      receiver_id: notification.receiver_id,
      old_status: notification.old_status,
      new_status: notification.new_status,
      change_timestamp: notification.change_timestamp.toISOString(),
      reason: notification.reason,
    });
  });

  test("should return a 404 if no notifications are found", async () => {
    await getNotifications(req, res);

    expect(res.statusCode).toBe(404);
    expect(res._getJSONData()).toMatchObject({
      message: 'No notifications found for this staff member',
    });
  });

  test("should return a 400 if staff ID is not provided", async () => {
    req.params.staffId = undefined;

    await getNotifications(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toMatchObject({
      message: 'Staff ID is required',
    });
  });

  test("should handle a database error gracefully", async () => {
    jest.spyOn(Notification, "find").mockImplementationOnce(() => {
      throw new Error("Database error");
    });

    await getNotifications(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toMatchObject({
      message: "An error occurred while fetching notifications.",
    });
  });
});
