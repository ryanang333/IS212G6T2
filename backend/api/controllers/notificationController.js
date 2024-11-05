import Notification from "../models/notificationModel.js";

/**
 * Creates a new notification entry in the database.
 *
 * @param {Object} notificationData - Data required to create a notification.
 * @param {string} notificationData.request_id - The ID of the associated arrangement request.
 * @param {number} notificationData.changed_by - ID of the user who made the change.
 * @param {number} notificationData.receiver_id - ID of the user who will receive this notification.
 * @param {string} notificationData.old_status - The previous status of the arrangement request.
 * @param {string} notificationData.new_status - The new status of the arrangement request.
 * @param {Date} notificationData.created_at - Timestamp from the original request's date (used as creation time).
 * @param {string} notificationData.reason - The manager's reason for the status change.
 * @param {string} notificationData.request_type - Type of request action ("Manager_Action" or "Staff_Action").
 *
 * @returns {Promise<Object>} - The saved notification object.
 * @throws {Error} - If required fields are missing or an error occurs during the save operation.
 */
export const createNotification = async (notificationData) => {
  try {
    const { request_id, changed_by, receiver_id, old_status, new_status, created_at, reason, request_type } = notificationData;

    if (!request_id || !changed_by || !receiver_id || !old_status || !new_status || !created_at || !reason || !request_type) {
      throw new Error("Missing required fields: request_id, changed_by, receiver_id, old_status, new_status, created_at, and request_type are all required.");
    }

    const newNotification = new Notification({
      request_id,
      changed_by,
      receiver_id,
      old_status,
      new_status,
      created_at,
      reason,
      request_type
    });

    const savedNotification = await newNotification.save();
    return savedNotification;

  } catch (error) {
    throw new Error(`Failed to create notification: ${error.message}`);
  }
};

/**
 * Fetches all notifications for a specific staff member.
 *
 * @param {Object} req - Express request object.
 * @param {Object} req.params - Route parameters from the request.
 * @param {string} req.params.staffId - Staff ID to filter notifications.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Sends a JSON response with fetched notifications
 * or an error message if a failure occurs.
 */
export const getNotifications = async (req, res) => {
  try {
    const { staffId } = req.params;

    if (!staffId) {
      return res.status(400).json({ message: 'Staff ID is required' });
    }

    const notifications = await Notification.find({ receiver_id: staffId }).populate('changed_by');

    if (!notifications || notifications.length === 0) {
      return res.status(404).json({ message: 'No notifications found for this staff member' });
    }

    return res.status(200).json({
      message: "Notifications fetched successfully!",
      notifications,
    });
  } catch (error) {
    return res.status(500).json({ message: "An error occurred while fetching notifications." });
  }
};

