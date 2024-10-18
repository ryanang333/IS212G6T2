import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import staffRoutes from '../../api/routes/staffRoutes.js';
import arrangementRequestsRoutes from '../../api/routes/arrangementRequestsRoutes.js';

dotenv.config();
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

export default app;
