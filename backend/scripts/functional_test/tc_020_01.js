import { connectDB, currentTestDB } from "./db_test_start.js";
import teardownDB from "./db_test_end.js";
import ArrangementRequest from "../../api/models/arrangementRequestsModel.js";
import Staff from "../../api/models/staffModel.js";
import app from "./backend_start.js";
import { autoRejectPendingRequests } from "../../api/controllers/arrangementRequestsController.js";


console.log("Running Auto-Reject Functional Test!");

(async () => {
  await connectDB("tc_020_01");

  await populateData();
  await populateStaff();

  const server = app.listen(process.env.PORT, () => {
    console.log(`Server ready on port ${process.env.PORT}`);
  });
  // await new Promise(r => setTimeout(r, 40000));

  app.get('/autoRejectPendingRequests', (req, res) => {
    autoRejectPendingRequests(req, res);
    // console.log("here");
  });

  // await verifyAutoRejectResults();

  const shutdown = async () => {
    console.log("Shutting down test environment...");
    await teardownDB(currentTestDB);
    server.close(() => {
      console.log("Server closed and test environment cleaned up.");
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
})();
const populateStaff = async () => {
  try {
    const staffArr = [
      {
        staff_id: 140881,
        staff_fname: "Rahim",
        staff_lname: "Khalid",
        dept: "Sales",
        position: "Sales Manager",
        country: "Singapore",
        email: "Rahim.khalid@allinone.com.sg",
        reporting_manager: 160008,
        role: 3,
      },
      {
        staff_id: 140882,
        staff_fname: "George",
        staff_lname: "Tan",
        dept: "Sales",
        position: "Director",
        country: "Singapore",
        email: "George.Tan@allinone.com.sg",
        reporting_manager: 140001,
        role: 1,
      },
    ];
    await Staff.insertMany(staffArr);
    console.log("Staff data inserted successfully");
  } catch (error) {
    console.error("Error inserting staff data:", error);
  }
};

const populateData = async () => {
  await ArrangementRequest.insertMany([
    {
      staff_id: 140881,
      request_date: new Date("2024-10-29T08:00:00"), // Expired date
      request_time: "AM",
      reason: "Need to take care of children",
      status: "Pending",
      manager_id: 130002
    },
    {
      staff_id: 140881,
      request_date: new Date("2024-10-29T08:00:00"), // expired, today’s date
      request_time: "PM",
      reason: "Sick",
      status: "Pending",
      manager_id: 130002
    },
    {
      staff_id: 140881,
      request_date: new Date("2025-01-10T08:00:00"), 
      request_time: "AM",
      reason: "Sick",
      status: "Pending",
      manager_id: 130002
    }
  ]);
  console.log("Test data populated.");
};

// const verifyAutoRejectResults = async () => {
//   const expiredRequest = await ArrangementRequest.findOne({ request_date: new Date("2024-01-12T08:00:00") });
//   const currentRequest = await ArrangementRequest.findOne({ request_date: new Date() });

//   if (expiredRequest.status === "Rejected" && expiredRequest.manager_reason === "Auto-rejected by system due to lack of manager action") {
//     console.log("Expired request auto-rejected successfully.");
//   } else {
//     console.error("Auto-reject failed for expired request.");
//   }

//   if (currentRequest.status === "Pending") {
//     console.log("Current request remained unaffected as expected.");
//   } else {
//     console.error("Unexpected status change in non-expired request.");
//   }
// };
