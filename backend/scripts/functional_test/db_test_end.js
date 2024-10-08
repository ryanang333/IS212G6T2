import mongoose from 'mongoose';

const tearDownDB = async (currentTestDB) => {
    try {
        if (currentTestDB) {
            await mongoose.connection.dropDatabase();
            console.log(`Database ${currentTestDB} dropped successfully!`);
        } else {
            console.warn("No test database to drop.");
        }
    } catch (error) {
        console.error("Failed to drop the database: ", error.message);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB!");
    }
};

export default tearDownDB;
