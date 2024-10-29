import { createNotification } from "../../../../api/controllers/notificationController.js";
import Notification from "../../../../api/models/notificationModel.js";

jest.mock("../../../../api/models/notificationModel.js");

describe("createNotification", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should create a notification successfully", async () => {
    const mockNotificationData = {
      request_id: "60d5ec49b09e3c001c8e4b51",
      changed_by: 101,
      receiver_id: 202,
      old_status: "Pending",
      new_status: "Approved",
      created_at: new Date(),
      reason: "Approved by manager",
      request_type: "Manager_Action",
    };

    const mockSavedNotification = {
      ...mockNotificationData,
      _id: "60d5ec49b09e3c001c8e4b52",
    };

    Notification.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(mockSavedNotification),
    }));

    const result = await createNotification(mockNotificationData);

    expect(Notification).toHaveBeenCalledWith(mockNotificationData);
    expect(result).toEqual(mockSavedNotification);
  });

  test("should throw an error if required fields are missing", async () => {
    const incompleteNotificationData = {
      changed_by: 101,
      receiver_id: 202,
      old_status: "Pending",
      new_status: "Approved",
      created_at: new Date(),
      reason: "Approved by manager",
      request_type: "Manager_Action",
    };

    await expect(createNotification(incompleteNotificationData)).rejects.toThrow("Missing required fields: request_id, changed_by, receiver_id, old_status, new_status, created_at, and request_type are all required.");
  });

  test("should throw an error if save operation fails", async () => {
    const mockNotificationData = {
      request_id: "60d5ec49b09e3c001c8e4b51",
      changed_by: 101,
      receiver_id: 202,
      old_status: "Pending",
      new_status: "Approved",
      created_at: new Date(),
      reason: "Approved by manager",
      request_type: "Manager_Action",
    };

    Notification.mockImplementation(() => ({
      save: jest.fn().mockRejectedValue(new Error("Database error")),
    }));

    await expect(createNotification(mockNotificationData)).rejects.toThrow("Failed to create notification: Database error");
  });
});
