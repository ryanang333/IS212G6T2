import { connectDB, currentTestDB } from "./db_test_start.js";
import teardownDB from "./db_test_end.js";
import ArrangementRequest from "../../api/models/arrangementRequestsModel.js";
import Staff from "../../api/models/staffModel.js";
import app from "./backend_start.js";

(async () => {
  await connectDB("008_01");

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
    const today = new Date().toISOString().split('T')[0];
    const requests = [
      {
        staff_id: 140894,
        request_date: today,
        status: "Approved",
        manager_id: 140001,
        request_time: "AM",
        reason: "Child carer",
      },
      {
        staff_id: 140002,
        request_date: today,
        status: "Approved",
        manager_id: 140894,
        request_time: "PM",
        reason: "Elderly care",
      },
      {
        staff_id: 140003,
        request_date: today,
        status: "Approved",
        manager_id: 140894,
        request_time: "Full Day",
        reason: "Grandchildren care",
      },
    ];

    await ArrangementRequest.insertMany(requests);
    console.log("Request data inserted successfully");
  } catch (error) {
    console.error("Error inserting request data:", error);
  }
};

const populateStaff = async () => {
  const teamMembers = [
    {
      staff_id: 140894,
      staff_fname: "Rahim",
      staff_lname: "Khalid",
      dept: "Sales",
      position: "Sales Manager",
      country: "Singapore",
      email: "Rahim.Khalid@allinone.com.sg",
      reporting_manager: 140001,
      role: 3,
    },
    {
      staff_id: 140002,
      staff_fname: "Susan",
      staff_lname: "Goh",
      dept: "Sales",
      position: "Account Manager",
      country: "Singapore",
      email: "Susan.Goh@allinone.com.sg",
      reporting_manager: 140894,
      role: 2,
    },
    {
      staff_id: 140003,
      staff_fname: "Janice",
      staff_lname: "Chan",
      dept: "Sales",
      position: "Account Manager",
      country: "Singapore",
      email: "Janice.Chan@allinone.com.sg",
      reporting_manager: 140894,
      role: 2,
    },
  ];
  try {
    await Staff.insertMany(teamMembers);
    console.log("Staff data inserted successfully");
  } catch (error) {
    console.error("Error inserting staff data:", error);
  }
};
