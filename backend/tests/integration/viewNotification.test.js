import mongoose from "mongoose";
import httpMocks from "node-mocks-http";
import { getNotificationsForStaff } from "../../api/controllers/notificationController.js";
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

describe("getNotificationsForStaff - Integration Test", () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest({
      method: "GET",
      url: "/notifications/staff/140881",
      params: { staffId: "140881" },
    });
    res = httpMocks.createResponse();
  });

  test("should return 200 and fetched notifications on success", async () => {
    const testNotification = new Notification({
      recipient_type: "staff",
      recipient_id: "140881",
      request_type: "Work From Home",
      request_date_time: new Date(),
      status: "Pending",
      notification_message: "Your WFH request is pending.",
    });
    await testNotification.save();

    await getNotificationsForStaff(req, res);
    const response = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(response.data.length).toBe(1);
    expect(response.data[0].recipient_id).toBe("140881");
  });

  test("should return 404 if no notifications found for the staff", async () => {
    await getNotificationsForStaff(req, res);
    const response = res._getData();

    expect(res.statusCode).toBe(404);
    expect(response).toContain("No notifications found");
  });

  test("should return 500 if there is a database error", async () => {
    jest.spyOn(Notification, "find").mockImplementation(() => {
      throw new Error("Database error");
    });
    await getNotificationsForStaff(req, res);

    expect(res.statusCode).toBe(500);
  });
});
