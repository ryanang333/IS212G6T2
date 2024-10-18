import { connectDB, currentTestDB } from "./db_test_start.js";
import teardownDB from "./db_test_end.js";
import ArrangementRequest from "../../api/models/arrangementRequestsModel.js";
import Staff from "../../api/models/staffModel.js";
import app from "./backend_start.js";

console.log("Running!");

(async () => {
  await connectDB("003_01to05");

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
  await Promise.all([populateStaff(), populateRequests()]);
};

const populateStaff = async () => {
  try {
    await Staff.create({
      staff_id: 140883,
      staff_fname: "Matt",
      staff_lname: "Damon",
      dept: "Sales",
      position: "Team Lead",
      country: "Singapore",
      email: "matt.damon@allinone.com.sg",
      reporting_manager: 130002,
      role: 2,
    });
    console.log("Staff data inserted successfully");
  } catch (error) {
    console.error("Error inserting staff data:", error);
  }
};

const populateRequests = async () => {
  try {
    // Inserting requests as an array
    const requests = await ArrangementRequest.insertMany([
      {
        staff_id: 140883,
        request_date: new Date("2024-01-12T08:00:00"), 
        request_time: "AM",
        reason: "Need to take care of children",
        status: "Pending",
        manager_id: 130002
      },
      {
        staff_id: 140883,
        request_date: new Date("2024-09-24T08:00:00"),
        request_time: "AM",
        reason: "Stomach Pain",
        status: "Approved",
        manager_id: 130002
      }
    ]);

    // Ensuring the result is an array (though it should already be one)
    if (Array.isArray(requests)) {
      console.log("Request data inserted successfully", requests);
    } else {
      console.log("Data is not an array, converting to an array");
      console.log([requests]); // Wrapping it in an array if it's not already
    }

  } catch (error) {
    console.error("Error inserting request data:", error);
  }
};
