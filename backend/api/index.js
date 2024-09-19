import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import staffRoutes from './routes/staffRoutes.js';
import connectDB from '../config/db.config.js'; 

dotenv.config();

// Connect to MongoDB
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

app.listen(process.env.PORT, () => {
  console.log(`Server ready on port ${process.env.PORT}`);
});

export default app;
