import { connectDB, currentTestDB } from "./db_test_start.js";
import teardownDB from "./db_test_end.js";
import ArrangementRequest from "../../api/models/arrangementRequestsModel.js";
import Staff from "../../api/models/staffModel.js";
import app from "./backend_start.js";

console.log("Running!");

(async () => {
  await connectDB("tc-034-02");

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
          staff_id: 140081,
          request_date: formattedTomorrow,
          status: "Pending Withdrawal",
          manager_id: 140008,
          request_time: "AM",
          reason: "Child carer",
          withdraw_reason: "EHEHEH carer",
          group_id: "12031203910249",
        },
        {
          staff_id: 140081,
          request_date: formattedNextWeek,
          status: "Pending Withdrawal",
          manager_id: 140008,
          request_time: "AM",
          reason: "Child carer",

          withdraw_reason: "Cherereild carer",
          group_id: "12031203910249",
        },
        {
          staff_id: 140081,
          request_date: formattedNextWeek,
          status: "Pending Withdrawal",
          manager_id: 140008,
          request_time: "AM",
          reason: "Chieeeld carer",
          withdraw_reason: "OI KN",
          group_id: null,
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
        position: "Director",
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