import { getNotifications } from "../../../../api/controllers/notificationController.js";
import Notification from "../../../../api/models/notificationModel.js";
import httpMocks from "node-mocks-http";
import { mockNotificationWithChangedBy } from "../../../mock/testHelper.js";

jest.mock("../../../../api/models/notificationModel.js");

describe("getNotifications", () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest({
      method: "GET",
      url: "/notifications/staff/101",
      params: {
        staffId: "101",
      },
    });
    res = httpMocks.createResponse();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return a 400 if staff ID is not provided", async () => {
    req.params.staffId = null;
    await getNotifications(req, res);

    expect(res.statusCode).toBe(400);
    const response = res._getJSONData();
    expect(response).toEqual({ message: 'Staff ID is required' });
  });

  test("should return a 200 and fetched notifications on success", async () => {
    const mockNotifications = [
      mockNotificationWithChangedBy,
      { request_id: "60d5ec49b09e3c001c8e4b51", changed_by: 101, receiver_id: 101 },
    ];
  
    Notification.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockNotifications),
    });
  
    await getNotifications(req, res);
  
    expect(Notification.find).toHaveBeenCalledWith({ receiver_id: req.params.staffId });
    expect(res.statusCode).toBe(200);
  
    const response = res._getJSONData();
    expect(response).toEqual({
      message: "Notifications fetched successfully!",
      notifications: expect.arrayContaining(mockNotifications),
    });
  });
  
  test("should return a 404 if no notifications found", async () => {
    Notification.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue([]),
    });
  
    await getNotifications(req, res);
  
    expect(res.statusCode).toBe(404);
    const response = res._getJSONData();
    expect(response).toEqual({ message: 'No notifications found for this staff member' });
  });  

  test("should return a 500 if an error occurs during fetching", async () => {
    const errorMessage = "An error occurred while fetching notifications.";
    Notification.find.mockReturnValueOnce({
      populate: jest.fn().mockImplementationOnce(() => {
        throw new Error(errorMessage);
      }),
    });

    await getNotifications(req, res);

    expect(res.statusCode).toBe(500);
    const response = res._getJSONData();
    expect(response).toEqual({ message: "An error occurred while fetching notifications." });
  });
});
