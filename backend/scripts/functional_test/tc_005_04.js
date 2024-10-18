import { connectDB, currentTestDB } from "./db_test_start.js";
import teardownDB from "./db_test_end.js";
import ArrangementRequest from "../../api/models/arrangementRequestsModel.js";
import Staff from "../../api/models/staffModel.js";
import app from "./backend_start.js";

console.log("Running!");

(async () => {
  await connectDB("005_04");

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
    const today = new Date()
      .toLocaleDateString("en-CA", {
        timeZone: "Asia/Singapore",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .split("-")
      .join("-"); 
    const requests = [
      {
        staff_id: 150034,
        request_date: today,
        status: "Approved",
        manager_id: 140001,
        request_time: "AM",
        reason: "Child carer",
      },
      {
        staff_id: 140293,
        request_date: today,
        status: "Approved",
        manager_id: 140894,
        request_time: "PM",
        reason: "Elderly care",
      },
      {
        staff_id: 140193,
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
  try {
    const staffArr = [
      {
        staff_id: 160075,
        staff_fname: "James",
        staff_lname: "Tan",
        dept: "HR",
        position: "HR Team",
        country: "Singapore",
        email: "James.Tan@allinone.com.sg",
        reporting_manager: 160008,
        role: 1,
      },
      {
        staff_id: 150008,
        staff_fname: "Eric",
        staff_lname: "Loh",
        dept: "Solutioning",
        position: "Director",
        country: "Singapore",
        email: "Eric.Loh@allinone.com.sg",
        reporting_manager: 130002,
        role: 1,
      },
      {
        staff_id: 140894,
        staff_fname: "Rahim",
        staff_lname: "Khalid",
        dept: "Sales",
        position: "Sales Manager",
        country: "Singapore",
        email: "Rahim.khalid@allinone.com.sg",
        reporting_manager: 140001,
        role: 3,
      },
      {
        staff_id: 150034,
        staff_fname: "George",
        staff_lname: "Floyd",
        dept: "Sales",
        position: "Sales Manager",
        country: "Singapore",
        email: "Rahim.khalid@allinone.com.sg",
        reporting_manager: 140001,
        role: 3,
      },
      {
        staff_id: 140293,
        staff_fname: "Isaac",
        staff_lname: "Newton",
        dept: "Sales",
        position: "Sales Manager",
        country: "Singapore",
        email: "Rahim.khalid@allinone.com.sg",
        reporting_manager: 140001,
        role: 3,
      },
      {
        staff_id: 140193,
        staff_fname: "Wayne",
        staff_lname: "Rooney",
        dept: "Sales",
        position: "Sales Manager",
        country: "Singapore",
        email: "Rahim.khalid@allinone.com.sg",
        reporting_manager: 140001,
        role: 3,
      },
    ];
    await Staff.insertMany(staffArr);
    console.log("Staff data inserted successfully");
  } catch (error) {
    console.error("Error inserting staff data:", error);
  }
};
