import { connectDB, currentTestDB } from "./db_test_start.js";
import teardownDB from "./db_test_end.js";
import ArrangementRequest from "../../api/models/arrangementRequestsModel.js";
import RequestAudit from "../../api/models/requestAuditModel.js";
import Staff from "../../api/models/staffModel.js";
import app from "./backend_start.js";

console.log("Running! TC_021_01");

(async () => {
  await connectDB("021_01");

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
          request_date: new Date("2025-01-13T08:00:00"), 
          request_time: "AM", 
          reason: "test", 
          status: "Pending", 
          manager_id: 140001, 
          group_id: "test group_id",
        },
        { 
          _id: "123456789012345678901232",
          staff_id: 140008, 
          request_date: new Date("2025-01-14T08:00:00"), 
          request_time: "AM", 
          reason: "test", 
          status: "Pending", 
          manager_id: 140001, 
          group_id: "test group_id",
        },
        { 
          _id: "123456789012345678901233",
          staff_id: 140008, 
          request_date: new Date("2025-01-15T08:00:00"), 
          request_time: "AM", 
          reason: "test", 
          status: "Pending", 
          manager_id: 140001, 
          group_id: "test group_id",
        },
        { 
          _id: "123456789012345678901234",
          staff_id: 140008, 
          request_date: new Date("2025-01-16T08:00:00"), 
          request_time: "AM", 
          reason: "test", 
          status: "Pending", 
          manager_id: 140001, 
          group_id: "test group_id",
        },
        { 
          _id: "123456789012345678901235",
          staff_id: 140008, 
          request_date: new Date("2025-01-17T08:00:00"), 
          request_time: "AM", 
          reason: "test", 
          status: "Pending", 
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
          change_timestamp: new Date("2025-01-13T08:00:00"),
        },
        {
          request_id: "123456789012345678901232",
          changed_by: 140008,
          old_status: "N/A",
          new_status: "Pending",
          change_timestamp: new Date("2025-01-14T08:00:00"),
        },
        {
          request_id: "123456789012345678901233",
          changed_by: 140008,
          old_status: "N/A",
          new_status: "Pending",
          change_timestamp: new Date("2025-01-15T08:00:00"),
        },
        {
          request_id: "123456789012345678901234",
          changed_by: 140008,
          old_status: "N/A",
          new_status: "Pending",
          change_timestamp: new Date("2025-01-16T08:00:00"),
        },
        {
          request_id: "123456789012345678901235",
          changed_by: 140008,
          old_status: "N/A",
          new_status: "Pending",
          change_timestamp: new Date("2025-01-13T08:00:00"),
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
        }
      ]);
        console.log("Staff data inserted successfully");
      } catch (error) {
        console.error("Error inserting staff data:", error);
      }
    };
