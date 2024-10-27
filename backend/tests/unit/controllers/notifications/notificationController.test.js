import { createNotification, getNotificationsForStaff, getNotificationsForManager } from '../../../../api/controllers/notificationController.js';
import Notification from '../../../../api/models/notificationModel.js';
import Staff from '../../../../api/models/staffModel.js';
import responseUtils from '../../../../api/utils/responseUtils.js';
import httpMocks from 'node-mocks-http';

jest.mock('../../../../api/models/notificationModel.js');
jest.mock('../../../../api/models/staffModel.js');
jest.mock('../../../../api/utils/responseUtils.js');

describe('Notification Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createNotification', () => {
    let req, res;

    beforeEach(() => {
      req = httpMocks.createRequest({
        method: 'POST',
        url: '/notifications',
        body: {
          recipient_id: '140881',
          message: 'Test notification',
          recipient_type: 'staff',
        },
      });
      res = httpMocks.createResponse();
    });

    test('should create and return a notification when valid data is provided', async () => {
      const savedNotification = { id: '1', ...req.body };
      Notification.create.mockResolvedValue(savedNotification);

      await createNotification(req, res);
      expect(Notification.create).toHaveBeenCalledWith(req.body);
      expect(res.statusCode).toBe(201);
      expect(res._getJSONData()).toEqual(savedNotification);
    });

    test('should return a 400 if required fields are missing', async () => {
      req.body = { message: 'Test notification' }; // Missing recipient_id and recipient_type

      await createNotification(req, res);
      expect(responseUtils.handleBadRequest).toHaveBeenCalledWith(res, 'Missing required fields');
      expect(res.statusCode).toBe(400);
    });

    test('should return a 500 if saving the notification fails', async () => {
      Notification.create.mockRejectedValue(new Error('Database error'));

      await createNotification(req, res);
      expect(responseUtils.handleServerError).toHaveBeenCalledWith(res, 'Failed to create notification: Database error');
      expect(res.statusCode).toBe(500);
    });
  });

  describe('getNotificationsForStaff', () => {
    let req, res;

    beforeEach(() => {
      req = httpMocks.createRequest({
        method: 'GET',
        url: '/notifications/staff/140881',
        params: { staff_id: '140881' },
      });
      res = httpMocks.createResponse();
    });

    test('should return a 400 error if staff ID is missing', async () => {
      req.params.staff_id = null;

      await getNotificationsForStaff(req, res);
      expect(responseUtils.handleBadRequest).toHaveBeenCalledWith(res, 'Staff ID is required');
      expect(res.statusCode).toBe(400);
    });

    test('should return a 404 error if no notifications found', async () => {
      Notification.find.mockResolvedValue([]);

      await getNotificationsForStaff(req, res);
      expect(responseUtils.handleNotFoundResponse).toHaveBeenCalledWith(res, 'No notifications found for this staff member');
      expect(res.statusCode).toBe(404);
    });

    test('should return notifications for a specific staff member', async () => {
      const notifications = [{ id: '1', message: 'Test notification', recipient_id: '140881' }];
      Notification.find.mockResolvedValue(notifications);

      await getNotificationsForStaff(req, res);
      expect(Notification.find).toHaveBeenCalledWith({ recipient_id: '140881' });
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(notifications);
    });
  });

  describe('getNotificationsForManager', () => {
    let req, res;

    beforeEach(() => {
      req = httpMocks.createRequest({
        method: 'GET',
        url: '/notifications/manager/140881',
        params: { manager_id: '140881' },
      });
      res = httpMocks.createResponse();
    });

    test('should return a 400 error if manager ID is missing', async () => {
      req.params.manager_id = null;

      await getNotificationsForManager(req, res);
      expect(responseUtils.handleBadRequest).toHaveBeenCalledWith(res, 'Manager ID is required');
      expect(res.statusCode).toBe(400);
    });

    test('should return notifications for a specific manager', async () => {
      const staffMembers = [{ id: '140883' }, { id: '140884' }];
      const notifications = [{ id: '1', message: 'Test notification', recipient_id: '140883' }];
      Staff.find.mockResolvedValue(staffMembers);
      Notification.find.mockResolvedValue(notifications);

      await getNotificationsForManager(req, res);
      expect(Staff.find).toHaveBeenCalledWith({ manager_id: '140881' });
      expect(Notification.find).toHaveBeenCalledWith({
        recipient_id: { $in: staffMembers.map(staff => staff.id) },
        recipient_type: 'staff',
      });
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(notifications);
    });
  });
});
