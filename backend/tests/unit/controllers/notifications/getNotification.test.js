import mongoose from 'mongoose';
import { getNotifications } from '../../../../api/controllers/notificationController.js'; // Replace with your actual path
import Notification from '../../../../api/models/notificationModel.js'; // Replace with your actual path

jest.mock('../../../../api/models/notificationModel.js');

describe('getNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch notifications for a staff member', async () => {
    const mockNotifications = [
      { _id: 1, receiver_id: 1, request: { request_id: 'abc' }, changedBy: { staff_id: 2 } },
      { _id: 2, receiver_id: 1, request: { request_id: 'def' }, changedBy: { staff_id: 3 } },
    ];

    Notification.find.mockResolvedValue(mockNotifications);

    const mockReq = { params: { staffId: 1 } };
    const mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    await getNotifications(mockReq, mockRes);

    expect(Notification.find).toHaveBeenCalledWith({ receiver_id: 1 });
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(mockNotifications);
  });

  it('should handle error with proper response', async () => {
    const mockReq = { params: { staffId: 1 } };
    const mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    const mockError = new Error('Database error');

    Notification.find.mockRejectedValue(mockError);

    await getNotifications(mockReq, mockRes);

    expect(Notification.find).toHaveBeenCalledWith({ receiver_id: 1 });
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });

  it('should handle missing staff ID with bad request response', async () => {
    const mockReq = {};
    const mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    await getNotifications(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Staff ID is required' });
  });

  it('should handle empty notifications', async () => {
    const mockReq = { params: { staffId: 1 } };
    const mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    Notification.find.mockResolvedValue([]);

    await getNotifications(mockReq, mockRes);

    expect(Notification.find).toHaveBeenCalledWith({ receiver_id: 1 });
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'No notifications found for this staff member' });
  });
});