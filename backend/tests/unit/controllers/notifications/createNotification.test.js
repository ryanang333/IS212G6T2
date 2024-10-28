const mongoose = require('mongoose');
const sinon = require('sinon');

const Notification = require('../../../../api/models/notificationModel.js'); // Replace with your path
const { createNotification } = require('../../../../api/controllers/notificationController.js'); // Replace with your path

describe('createNotification', () => {
  beforeEach(() => {
    sinon.stub(mongoose, 'connect').resolves(); // Mock mongoose connection
  });

  afterEach(() => {
    sinon.restore(); // Restore original mongoose behavior
  });

  it('should create a new notification', async () => {
    const mockData = {
      request_id: new mongoose.Types.ObjectId(),
      changed_by: 1,
      receiver_id: 2,
      old_status: 'Pending',
      new_status: 'Approved',
      created_at: new Date(),
      reason: 'Manager approved the request.',
      request_type: 'Manager_Action',
    };

    sinon.stub(Notification.prototype, 'save').resolves(mockData); // Mock save method

    const savedNotification = await createNotification(mockData);

    expect(savedNotification).toEqual(mockData);
    expect(Notification.prototype.save.calledOnce).toBe(true);
  });

  it('should throw error for missing fields', async () => {
    const incompleteData = {
      request_id: new mongoose.Types.ObjectId(),
      changed_by: 1,
      receiver_id: 2,
      old_status: 'Pending',
      new_status: 'Approved',
    };

    await expect(createNotification(incompleteData)).rejects.toThrowError('Missing required fields');
  });
});