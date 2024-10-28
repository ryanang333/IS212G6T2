// import mongoose from 'mongoose';
// import { MongoMemoryServer } from 'mongodb-memory-server-core';
// import request from 'supertest';
// import app from '../../api/index';
// import ArrangementRequest from "../../api/models/arrangementRequestsModel.js";
// import Notification from '../../api/models/notificationModel.js';

// let mongoServer;
// let server;

// beforeAll(async () => {
//   mongoServer = await MongoMemoryServer.create();
//   const uri = mongoServer.getUri();

//   if (mongoose.connection.readyState !== 0) {
//     await mongoose.disconnect();
//   }

//   await mongoose.connect(uri, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   });

//   server = app.listen(0);
// });

// afterAll(async () => {
//   await mongoose.connection.dropDatabase();
//   await mongoose.connection.close();
//   await mongoServer.stop();

//   await new Promise((resolve, reject) => {
//     server.close((err) => {
//       if (err) return reject(err);
//       resolve();
//     });
//   });
// });

// afterEach(async () => {
//   await ArrangementRequest.deleteMany({});
//   await Notification.deleteMany({});
// });

// describe('Functional Test for getNotification', () => {
//   test('should fetch notification logs if arrangement requests are found', async () => {
//     const mockArrangementRequest = await ArrangementRequest.create({
//       _id: new mongoose.Types.ObjectId(),
//       staff_id: 140008,
//       request_date: new Date('2025-01-01T00:00:00.000Z'),
//       status: 'Pending',
//       manager_id: 140008,
//       reason: 'Test reason',
//       withdraw_reason: null,
//       manager_reason: null,
//       request_time: 'Full Day',
//     });

//     await Notification.create({
//       _id: new mongoose.Types.ObjectId(),
//       request_id: mockArrangementRequest._id,
//       request_type: 'Manager_Action',
//       changed_by: 140008,
//       receiver_id: 140009,
//       old_status: 'Pending',
//       new_status: 'Approved',
//       change_timestamp: new Date('2025-01-01T12:00:00.000Z'),
//       reason: 'Status update',
//     });

//     const res = await request(app)
//       .get('/notifications')
//       .query({
//         startDate: '2024-05-05',
//         endDate: '2025-05-06',
//         staffId: 140008,
//       })
//       .expect(200);

//     expect(res.body).toMatchObject({
//       count: 1,
//       logs: [
//         {
//           _id: expect.any(String),
//           request_id: {
//             _id: mockArrangementRequest._id.toString(),
//             staff_id: 140008,
//             request_date: mockArrangementRequest.request_date.toISOString(),
//             reason: 'Test reason',
//             withdraw_reason: null,
//             manager_reason: null,
//           },
//           changed_by: 140008,
//           change_timestamp: new Date('2025-01-01T12:00:00.000Z').toISOString(),
//           old_status: 'Pending',
//           new_status: 'Approved',
//           request_type: 'Manager_Action',
//           receiver_id: 140009,
//           reason: 'Status update',
//         },
//       ],
//     });
//   });

//   test('should return an empty array if no notification logs match', async () => {
//     const res = await request(app)
//       .get('/notifications')
//       .query({
//         startDate: '2024-05-05',
//         endDate: '2025-05-06',
//         staffId: 140008,
//       })
//       .expect(200);

//     expect(res.body).toMatchObject({
//       count: 0,
//       logs: [],
//     });
//   });

//   test('should return an empty array if no arrangement requests are found', async () => {
//     const res = await request(app)
//       .get('/notifications')
//       .query({
//         startDate: '2024-05-05',
//         endDate: '2025-05-06',
//         staffId: 140008,
//       })
//       .expect(200);

//     expect(res.body).toMatchObject({
//       count: 0,
//       logs: [],
//     });
//   });

//   test('should handle partial query when only staffId is provided', async () => {
//     const mockArrangementRequest = await ArrangementRequest.create({
//       _id: new mongoose.Types.ObjectId(),
//       staff_id: 140008,
//       request_date: new Date('2025-01-01T00:00:00.000Z'),
//       status: 'Pending',
//       manager_id: 140008,
//       reason: 'Test reason',
//       withdraw_reason: null,
//       manager_reason: null,
//       request_time: 'Full Day',
//     });

//     await Notification.create({
//       _id: new mongoose.Types.ObjectId(),
//       request_id: mockArrangementRequest._id,
//       request_type: 'Manager_Action',
//       changed_by: 140008,
//       receiver_id: 140009,
//       old_status: 'Pending',
//       new_status: 'Approved',
//       change_timestamp: new Date('2025-01-01T12:00:00.000Z'),
//       reason: 'Status update',
//     });

//     const res = await request(app)
//       .get('/notifications')
//       .query({
//         staffId: 140008,
//       })
//       .expect(200);

//     expect(res.body).toMatchObject({
//       count: 1,
//       logs: [
//         {
//           _id: expect.any(String),
//           request_id: {
//             _id: mockArrangementRequest._id.toString(),
//             staff_id: 140008,
//             request_date: mockArrangementRequest.request_date.toISOString(),
//             reason: 'Test reason',
//             withdraw_reason: null,
//             manager_reason: null,
//           },
//           changed_by: 140008,
//           change_timestamp: new Date('2025-01-01T12:00:00.000Z').toISOString(),
//           old_status: 'Pending',
//           new_status: 'Approved',
//           request_type: 'Manager_Action',
//           receiver_id: 140009,
//           reason: 'Status update',
//         },
//       ],
//     });
//   });

//   test('should handle a database error gracefully', async () => {
//     jest.spyOn(ArrangementRequest, 'find').mockImplementationOnce(() => {
//       throw new Error("Database error");
//     });

//     const res = await request(app)
//       .get('/notifications')
//       .query({
//         startDate: '2024-05-05',
//         endDate: '2025-05-06',
//         staffId: 140008,
//       })
//       .expect(500);

//     expect(res.body).toMatchObject({
//       message: "Internal server error",
//     });
//   });
// });
