// Remove the Sinon Date Mocking

// Now import the application and other modules directly
import { connectDB, currentTestDB } from "./db_test_start.js";
import teardownDB from "./db_test_end.js";
import ArrangementRequest from "../../api/models/arrangementRequestsModel.js";
import Staff from "../../api/models/staffModel.js";
import app from "./backend_start.js";

// Proceed with the rest of your logic
console.log("Running!");

(async () => {
  await connectDB("tc-012-01to04");

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
  await Promise.all([populateStaff()]);
};

const populateStaff = async () => {
  try {
    const staffArr = [
      {
        staff_id: 140081,
        staff_fname: "Rahim",
        staff_lname: "Khalid",
        dept: "Sales",
        position: "Sales Manager",
        country: "Singapore",
        email: "Rahim.khalid@allinone.com.sg",
        reporting_manager: 14,
        role: 3,
      },
      {
        staff_id: 140008,
        staff_fname: "George",
        staff_lname: "Tan",
        dept: "Sales",
        position: "MD",
        country: "Singapore",
        email: "George.Tan@allinone.com.sg",
        reporting_manager: 140008,
        role: 1,
      },
    ];


    await Staff.insertMany(staffArr);
    console.log("Staff data inserted successfully");
  } catch (error) {
    console.error("Error inserting staff data:", error);
  }
};

// No need to restore the real Date object since we're not mocking it anymore
