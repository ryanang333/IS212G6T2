import { connectDB, currentTestDB } from "./db_test_start.js";
import teardownDB from "./db_test_end.js";
import ArrangementRequest from "../../api/models/arrangementRequestsModel.js";
import Staff from "../../api/models/staffModel.js";
import app from "./backend_start.js";

console.log("Running!");

(async () => {
  await connectDB("014_04");

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

    const formattedTomorrow = tomorrow
      .toLocaleDateString("en-CA", {
        timeZone: "Asia/Singapore",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .split("-")
      .join("-");

    const two_days = new Date(today);
    two_days.setDate(today.getDate() + 2);

    const formattedTwoDays = two_days
      .toLocaleDateString("en-CA", {
        timeZone: "Asia/Singapore",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .split("-")
      .join("-");

    const three_days = new Date(today);
    three_days.setDate(today.getDate() + 3);

    const formattedThreeDays = three_days
      .toLocaleDateString("en-CA", {
        timeZone: "Asia/Singapore",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .split("-")
      .join("-");

    const four_days = new Date(today);
    four_days.setDate(today.getDate() + 4);

    const formattedFourDays = four_days
      .toLocaleDateString("en-CA", {
        timeZone: "Asia/Singapore",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .split("-")
      .join("-");

    const five_days = new Date(today);
    five_days.setDate(today.getDate() + 5);

    const formattedFiveDays = five_days
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
        status: "Approved",
        manager_id: 140001,
        request_time: "AM",
        reason: "Child carer",
        group_id: null,
      },
      {
        staff_id: 140081,
        request_date: formattedTwoDays,
        status: "Rejected",
        manager_id: 140001,
        request_time: "AM",
        reason: "COVID-19",
        group_id: null,
      },
      {
        staff_id: 140081,
        request_date: formattedThreeDays,
        status: "Cancelled",
        manager_id: 140001,
        request_time: "AM",
        reason: "COVID-20",
        group_id: null,
      },
      {
        staff_id: 140081,
        request_date: formattedFourDays,
        status: "Pending Withdrawal",
        manager_id: 140001,
        request_time: "AM",
        reason: "COVID-21",
        group_id: null,
      },
      {
        staff_id: 140081,
        request_date: formattedFiveDays,
        status: "Withdrawn",
        manager_id: 140001,
        request_time: "AM",
        reason: "COVID-78",
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
        reporting_manager: 140001,
        role: 3,
      },
      {
        staff_id: 140001,
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
