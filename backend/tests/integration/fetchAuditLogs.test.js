import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server-core';
import request from 'supertest';
import app from '../../api/index';  // Assuming this is your Express app entry point
import ArrangementRequest from "../../api/models/arrangementRequestsModel.js";
import RequestAudit from '../../api/models/requestAuditModel';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Check if there's an active connection and disconnect if necessary
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  // Clear the in-memory database and disconnect from MongoDB
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

afterEach(async () => {
  // Clear the collections after each test
  await ArrangementRequest.deleteMany({});
  await RequestAudit.deleteMany({});
});

describe('Functional Test for fetchAuditLogs', () => {
  test('should fetch audit logs if arrangement requests are found', async () => {
    // Step 1: Insert mock arrangement request into the real database
    const mockArrangementRequest = await ArrangementRequest.create({
      _id: new mongoose.Types.ObjectId(),
      staff_id: 140008,
      request_date: new Date('2025-01-01T00:00:00.000Z'),
      status: 'Pending',
      manager_id: 140008,
      reason: 'Test reason',
      withdraw_reason: null,
      manager_reason: null,
      request_time: 'Full Day', 

    });

    // Step 2: Insert mock audit log into the real database
    await RequestAudit.create({
      _id: new mongoose.Types.ObjectId(),
      request_id: mockArrangementRequest._id,
      changed_by: 140008,
      old_status: 'Pending',
      new_status: 'Approved',
      change_timestamp: new Date('2025-01-01T12:00:00.000Z'),
    });

    // Step 3: Make a GET request to the API endpoint
    const res = await request(app)
      .get('/requestAudit')
      .query({
        startDate: '2024-05-05',
        endDate: '2025-05-06',
        staffId: 140008,
      })
      .expect(200);  // We expect the API to return a 200 status code

    // Step 4: Assert the response
    expect(res.body).toMatchObject({
      count: 1,
      logs: [
        {
          _id: expect.any(String),  // MongoDB-generated _id
          request_id: {
            _id: mockArrangementRequest._id.toString(),
            staff_id: 140008,
            request_date: mockArrangementRequest.request_date.toISOString(),
            reason: 'Test reason',
            withdraw_reason: null,
            manager_reason: null,
          },
          changed_by: 140008,
          change_timestamp: new Date('2025-01-01T12:00:00.000Z').toISOString(),
          old_status: 'Pending',
          new_status: 'Approved',
        },
      ],
    });
  });

  test('should return an empty array if no audit logs match', async () => {
    // No data inserted into the database

    // Make a GET request to the API endpoint
    const res = await request(app)
      .get('/requestAudit')
      .query({
        startDate: '2024-05-05',
        endDate: '2025-05-06',
        staffId: 140008,
      })
      .expect(200);  // We expect the API to return a 200 status code

    // Assert that no logs were found
    expect(res.body).toMatchObject({
      count: 0,
      logs: [],
    });
  });

  test('should return an empty array if no arrangement requests are found', async () => {
    // No arrangement requests are inserted

    // Make a GET request to the API endpoint
    const res = await request(app)
      .get('/requestAudit')
      .query({
        startDate: '2024-05-05',
        endDate: '2025-05-06',
        staffId: 140008,
      })
      .expect(200);  // We expect the API to return a 200 status code

    // Assert that no arrangement requests or logs were found
    expect(res.body).toMatchObject({
      count: 0,
      logs: [],
    });
  });

  test('should handle partial query when only staffId is provided', async () => {
    // Step 1: Insert mock arrangement request into the real database
    const mockArrangementRequest = await ArrangementRequest.create({
      _id: new mongoose.Types.ObjectId(),
      staff_id: 140008,
      request_date: new Date('2025-01-01T00:00:00.000Z'),
      status: 'Pending',
      manager_id: 140008,
      reason: 'Test reason',
      withdraw_reason: null,
      manager_reason: null,
      request_time: 'Full Day', 
    });

    // Step 2: Insert mock audit log into the real database
    await RequestAudit.create({
      _id: new mongoose.Types.ObjectId(),
      request_id: mockArrangementRequest._id,
      changed_by: 140008,
      old_status: 'Pending',
      new_status: 'Approved',
      change_timestamp: new Date('2025-01-01T12:00:00.000Z'),
    });

    // Step 3: Make a GET request to the API endpoint with only staffId
    const res = await request(app)
      .get('/requestAudit')
      .query({
        staffId: 140008, // Only staffId provided in query
      })
      .expect(200);  // We expect the API to return a 200 status code

    // Step 4: Assert the response
    expect(res.body).toMatchObject({
      count: 1,
      logs: [
        {
          _id: expect.any(String),  // MongoDB-generated _id
          request_id: {
            _id: mockArrangementRequest._id.toString(),
            staff_id: 140008,
            request_date: mockArrangementRequest.request_date.toISOString(),
            reason: 'Test reason',
            withdraw_reason: null,
            manager_reason: null,
          },
          changed_by: 140008,
          change_timestamp: new Date('2025-01-01T12:00:00.000Z').toISOString(),
          old_status: 'Pending',
          new_status: 'Approved',
        },
      ],
    });
  });

  test('should handle a database error gracefully', async () => {
    // Simulate a database error for ArrangementRequest.find
    jest.spyOn(ArrangementRequest, 'find').mockImplementationOnce(() => {
      throw new Error("Database error");
    });

    // Make a GET request to the API endpoint
    const res = await request(app)
      .get('/requestAudit')
      .query({
        startDate: '2024-05-05',
        endDate: '2025-05-06',
        staffId: 140008,
      })
      .expect(500);  // We expect the API to return a 500 status code for the error

    // Assert that an error message was returned
    expect(res.body).toMatchObject({
      message: "Internal server error",
    });
  });
});
