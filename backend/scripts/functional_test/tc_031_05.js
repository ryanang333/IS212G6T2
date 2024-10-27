import { connectDB, currentTestDB } from "./db_test_start.js";
import teardownDB from "./db_test_end.js";
import ArrangementRequest from "../../api/models/arrangementRequestsModel.js";
import RequestAudit from "../../api/models/requestAuditModel.js";
import Staff from "../../api/models/staffModel.js";
import app from "./backend_start.js";

console.log("Running! TC_031_05");

(async () => {
  await connectDB("031_05");

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
  };8
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
})();

const populateData = async () => {
    await Promise.all([populateStaff(), populateRequests(), populateAuditLogs()]);
  };

  const populateRequests = async () => {
    try {
      await ArrangementRequest.insertMany([
        { 
          _id: "123456789012345678901231",
          staff_id: 140008, 
          request_date: new Date("2024-12-01T08:00:00"), 
          request_time: "AM", 
          reason: "test", 
          status: "Pending Withdrawal", 
          manager_id: 140001, 
          group_id: "test group_id",
        },
      ]);
  
      console.log("Request data inserted successfully");
    } catch (error) {
      console.error("Error inserting request data:", error);
    }
  };

  const populateAuditLogs = async () => {
    try {
      await RequestAudit.insertMany([
        {
          request_id: "123456789012345678901231",
          changed_by: 140008,
          old_status: "N/A",
          new_status: "Pending",
          change_timestamp: new Date("2024-12-01T08:00:00"),
        },
        {
          request_id: "123456789012345678901231",
          changed_by: 140001,
          old_status: "Pending",
          new_status: "Approved",
          change_timestamp: new Date("2024-12-01T08:00:00"),
        },
        {
          request_id: "123456789012345678901231",
          changed_by: 140008,
          old_status: "Approved",
          new_status: "Pending Withdrawal",
          change_timestamp: new Date("2024-12-01T08:00:00"),
        },
      ]);
      console.log("Audit log data inserted successfully");
    } catch (error) {
      console.error("Error inserting audit log data:", error);
    }
  };

  const populateStaff = async () => {
    try {
      await Staff.insertMany([
        {
          staff_id: 140008,
          staff_fname: "Jaclyn",
          staff_lname: "Tan",
          dept: "Sales",
          position: "Sales Manager",
          country: "Singapore",
          email: "Jaclyn.Lee@allinone.com.sg",
          reporting_manager: 140001,
          role: 3,
        },
        {
          staff_id: 140001,
          staff_fname: "Derek",
          staff_lname: "Tan",
          dept: "Sales",
          position: "Director",
          country: "Singapore",
          email: "Derek.Tan@allinone.com.sg",
          reporting_manager: 130002,
          role: 1,
        }
      ]);
        console.log("Staff data inserted successfully");
      } catch (error) {
        console.error("Error inserting staff data:", error);
      }
    };
