import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import staffRoutes from './routes/staffRoutes.js';
import arrangementRequestsRoutes from './routes/arrangementRequestsRoutes.js';
import requestAuditRoutes from './routes/requestAuditRoutes.js';
import connectDB from '../config/db.config.js'; 
import notificationRoutes from './routes/notificationRoutes.js'
import setupAutoRejectCronJob from './utils/cronJob.js';

dotenv.config();

connectDB();

const app = express();

const corsOptions = {
  origin: process.env.ORIGIN,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/staff', staffRoutes);
app.use('/arrangementRequests', arrangementRequestsRoutes);
app.use('/requestAudit', requestAuditRoutes);
app.use('/notifications', notificationRoutes);

setupAutoRejectCronJob();

if (process.env.NODE_ENV !== 'test') {
  app.listen(process.env.PORT, () => {
    console.log(`Server ready on port ${process.env.PORT}`);
  });
}

export default app;
