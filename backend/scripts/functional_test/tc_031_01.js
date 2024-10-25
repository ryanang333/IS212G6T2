import { connectDB, currentTestDB } from "./db_test_start.js";
import teardownDB from "./db_test_end.js";
import ArrangementRequest from "../../api/models/arrangementRequestsModel.js";
import RequestAudit from "../../api/models/requestAuditModel.js";
import Staff from "../../api/models/staffModel.js";
import app from "./backend_start.js";

console.log("Running!");

(async () => {
  await connectDB("031_01");

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
  await Promise.all([populateStaff(), populateRequest(), populateAuditLogs()]);
};

  const populateRequest = async () => {
    try {
      const today = new Date();
      
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
  
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
  
      // Format the dates
      const formattedTomorrow = tomorrow
        .toLocaleDateString("en-CA", {
          timeZone: "Asia/Singapore",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .split("-")
        .join("-");
  
      const formattedNextWeek = nextWeek
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
          _id: "123456789012345678901231",
          staff_id: 140001,
          request_date: formattedTomorrow,
          status: "Pending",
          manager_id: 130002,
          request_time: "AM",
          reason: "Test",
          group_id: null,
        },
        {
          _id: "123456789012345678901232",
          staff_id: 140001,
          request_date: formattedNextWeek,
          status: "Pending",
          manager_id: 130002,
          request_time: "AM",
          reason: "Test",
          group_id: null,
        },
      ];
  
      await ArrangementRequest.insertMany(requests);
      console.log("Request data inserted successfully");
    } catch (error) {
      console.error("Error inserting request data:", error);
    }
  };

  const populateAuditLogs = async () => {
    try {  
      const today = new Date();
      const logs = [
        {
          request_id: "123456789012345678901231",
          changed_by: 140001,
          old_status: "N/A",
          new_status: "Pending",
          change_timestamp: today,
        },
        {
          request_id: "123456789012345678901232",
          changed_by: 140001,
          old_status: "N/A",
          new_status: "Pending",
          change_timestamp: today,
        },
      ];
  
      await RequestAudit.insertMany(logs);
      console.log("Audit log data inserted successfully");
    } catch (error) {
      console.error("Error inserting audit log data:", error);
    }
  };

  const populateStaff = async () => {
    try {
      const staffArr = [
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
        },
      ];
    await Staff.insertMany(staffArr);
    console.log("Staff data inserted successfully");
  } catch (error) {
    console.error("Error inserting staff data:", error);
  }
};
