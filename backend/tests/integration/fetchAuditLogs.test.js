import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import app from '../../api/index';  // Assuming this is your Express app entry point
import ArrangementRequest from "../../api/models/arrangementRequestsModel.js";
import RequestAudit from '../../api/models/requestAuditModel';

let mongoServer;

beforeAll(async () => {
  // Start the in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  // Close the connection to the in-memory MongoDB server
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  // Clear the database after each test
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
});
