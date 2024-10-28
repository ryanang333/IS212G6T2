import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config()

let currentTestDB = null;

const connectDB = async (testDB) => {
    try { 
        currentTestDB = testDB;
        let mongoURI = process.env.MONGODB_URI_FUNCTIONAL_TEST_PREFIX + testDB + process.env.MONGODB_URI_FUNCTIONAL_TEST_SUFFIX;
        // console.log(mongoURI)
        await mongoose.connect(mongoURI);
        console.log("MongoDB test " + testDB + " connected successfully!");
    }catch (error) {
        console.error("MongoDB connection failed: ", error.message);
        process.exit(1);
    }
}

export { connectDB, currentTestDB }; 