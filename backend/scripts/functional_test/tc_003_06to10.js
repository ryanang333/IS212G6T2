import { connectDB, currentTestDB } from "./db_test_start.js";
import teardownDB from "./db_test_end.js";
import ArrangementRequest from "../../api/models/arrangementRequestsModel.js";
import Staff from "../../api/models/staffModel.js";
import app from "./backend_start.js";

console.log("Running!");

(async () => {
  await connectDB("003_06to10");

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
      staff_id: 140882,
      staff_fname: "Brad",
      staff_lname: "Pitt",
      dept: "Marketing",
      position: "Team Lead",
      country: "Singapore",
      email: "brad.pitt@allinone.com.sg",
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
    // Inserting requests for staff_id 140882
    const requests = await ArrangementRequest.insertMany([
      {
        staff_id: 140882,
        request_date: new Date("2024-12-01T08:00:00"),
        request_time: "AM",
        reason: "Need to take care of children",
        status: "Pending",
        manager_id: 130002,
      },
      {
        staff_id: 140882,
        request_date: new Date("2024-09-24T08:00:00"),
        request_time: "AM",
        reason: "Stomach Pain",
        status: "Approved",
        manager_id: 130002,
      },
      {
        staff_id: 140882,
        request_date: new Date("2024-09-24T08:00:00"),
        request_time: "AM",
        reason: "Tired of work",
        status: "Rejected",
        manager_id: 130002,
      },
      {
        staff_id: 140882,
        request_date: new Date("2024-09-24T08:00:00"),
        request_time: "AM",
        reason: "I love working",
        status: "Withdrawn",
        manager_id: 130002,
      },
    ]);

    // Ensuring the result is an array
    if (Array.isArray(requests)) {
      console.log("Request data inserted successfully", requests);
    } else {
      console.log("Data is not an array, converting to an array");
      console.log([requests]);
    }

  } catch (error) {
    console.error("Error inserting request data:", error);
  }
};
