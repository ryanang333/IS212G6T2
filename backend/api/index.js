import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import staffRoutes from './routes/staffRoutes.js';
import arrangementRequestsRoutes from './routes/arrangementRequestsRoutes.js';
import connectDB from '../config/db.config.js'; 
import notificationRoutes from './routes/notificationRoutes.js'

dotenv.config();

connectDB();

const app = express();

const corsOptions = {
  origin: process.env.ORIGIN,
};

app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "hello!" });
});

app.use('/staff', staffRoutes);
app.use('/arrangementRequests', arrangementRequestsRoutes);
app.use('/notifications', notificationRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server ready on port ${process.env.PORT}`);
});

export default app;
