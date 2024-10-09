import mongoose from 'mongoose';
import ArrangementRequest from '../../api/models/arrangementRequestsModel.js';
import connectDB from '../../config/db.config.js';

connectDB();

const clearCollection = async () => {
  try {
    await ArrangementRequest.deleteMany({}); // Clear all documents in the collection
    console.log('Collection cleared successfully.');
  } catch (error) {
    console.error('Error clearing collection:', error.message);
  }
};

const importRequestData = async () => {
  const requestData = [
    {
      staff_id: 140881,
      request_date: new Date('2024-12-30T00:00:00.000Z'),
      status: 'Pending',
      manager_id: 140008,
      group_id: null,
      request_time: 'PM',
      reason: 'Test request 1',
      rejection_reason: null,
    },
  ];

  try {
    await clearCollection(); // Clear the collection before populating
    await ArrangementRequest.insertMany(requestData); // Insert test data
    console.log('Test data imported successfully.');
  } catch (error) {
    console.error('Error importing test data:', error.message);
  } finally {
    mongoose.connection.close(); // Close the connection
  }
};

importRequestData();
