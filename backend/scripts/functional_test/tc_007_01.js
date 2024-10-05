import { connectDB, currentTestDB } from "./db_test_start.js";
import teardownDB from "./db_test_end.js";
import ArrangementRequest from "../../api/models/arrangementRequestsModel.js";
import Staff from "../../api/models/staffModel.js";
import app from "./backend_start.js";

console.log("Running!");

(async () => {
  await connectDB("007_01");

  await populateData();

  const server = app.listen(process.env.PORT, () => {
    console.log(`Server ready on port ${process.env.PORT}`);
  });

  const shutdown = async () => {
    console.log("Shutting down...");
    await teardownDB(currentTestDB);
    server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  };

  // Listen for SIGINT and SIGTERM signals
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
})();

const populateData = async () => {
  await Promise.all([populateStaff(), populateRequest()]); 
};

const populateRequest = async () => {
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const dates = [
      { date: today, time: "AM" },
      { date: tomorrow, time: "PM" },
      { date: yesterday, time: "Full Day" },
    ];

    await ArrangementRequest.insertMany(
      dates.map((dateObj) => ({
        staff_id: 140881,
        request_date: dateObj.date,
        status: "Approved",
        manager_id: 130002,
        request_time: dateObj.time,
        reason: "Child carer",
      }))
    );
    console.log("Request data inserted successfully");
  } catch (error) {
    console.error("Error inserting request data:", error);
  }
};

const populateStaff = async () => {
  try {
    await Staff.create({
      staff_id: 140881,
      staff_fname: "George",
      staff_lname: "Clooney",
      dept: "Accounts Manager",
      position: "Manager",
      country: "Singapore",
      email: "george.clooney@allinone.com.sg",
      reporting_manager: 130002,
      role: 2,
    });
    console.log("Staff data inserted successfully");
  } catch (error) {
    console.error("Error inserting staff data:", error);
  }
};
