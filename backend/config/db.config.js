import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config()

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI_PROD);
    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1); // Exit the process if the connection fails
  }
};

export default connectDB;
