import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config()

const connectDB = async () => {
  try {
    let mongoURI;

    switch (process.env.NODE_ENV) {
      case 'production':
        mongoURI = process.env.MONGODB_URI_PROD;
        break;
      case 'test':
        mongoURI = process.env.MONGODB_URI_TEST;
        break;
      case 'development':
      default:
        mongoURI = process.env.MONGODB_URI_DEV;
        break;
    }

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });

    await mongoose.connect(mongoURI);
    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1); // Exit the process if the connection fails
  }
};

export default connectDB;
