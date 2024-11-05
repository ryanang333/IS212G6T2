import { connectDB, currentTestDB } from "./db_test_start.js";
import teardownDB from "./db_test_end.js";
import ArrangementRequest from "../../api/models/arrangementRequestsModel.js";
import Staff from "../../api/models/staffModel.js";
import app from "./backend_start.js";

console.log("Running test setup!");

(async () => {
  await connectDB("tc-033-03");

  await populateData();

  const server = app.listen(process.env.PORT, () => {
    console.log(`Server is ready on port ${process.env.PORT}`);
  });

  const shutdown = async () => {
    console.log("Shutting down...");
    await teardownDB(currentTestDB);
    server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  };

  // Listen for termination signals
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
})();

const populateData = async () => {
  await Promise.all([populateStaff(), populateRequests()]);
};

const populateRequests = async () => {
  try {
    const requestDate = new Date("2024-12-13");

    const requests = [
      createRequest(140008, requestDate, "Approved", 140081, "PM", "Testing withdraw notification"),
    ];

    await ArrangementRequest.insertMany(requests);
    console.log("Request data inserted successfully");
  } catch (error) {
    console.error("Error inserting request data:", error);
  }
};

const createRequest = (staffId, date, status, managerId, requestTime, reason) => {
  const formattedDate = formatDate(date);
  return {
    staff_id: staffId,
    request_date: formattedDate,
    status: status,
    manager_id: managerId,
    request_time: requestTime,
    reason: reason,
  };
};

const formatDate = (date) => {
  return date.toLocaleDateString("en-CA", {
    timeZone: "Asia/Singapore",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).split("-").join("-");
};

const populateStaff = async () => {
  try {
    const staffArr = [
      createStaff(140081, "Ethan", "Tan", "Sales", "Sales Manager", "Singapore", "Rahim.khalid@allinone.com.sg", 140008, 3),
      createStaff(140008, "George", "Tan", "Sales", "Director", "Singapore", "George.Tan@allinone.com.sg", 140008, 1),
    ];
    
    await Staff.insertMany(staffArr);
    console.log("Staff data inserted successfully");
  } catch (error) {
    console.error("Error inserting staff data:", error);
  }
};

const createStaff = (staffId, firstName, lastName, dept, position, country, email, reportingManager, role) => {
  return {
    staff_id: staffId,
    staff_fname: firstName,
    staff_lname: lastName,
    dept: dept,
    position: position,
    country: country,
    email: email,
    reporting_manager: reportingManager,
    role: role,
  };
};
