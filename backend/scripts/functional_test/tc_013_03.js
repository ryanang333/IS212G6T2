import { connectDB, currentTestDB } from "./db_test_start.js"; 
import teardownDB from "./db_test_end.js";
import ArrangementRequest from "../../api/models/arrangementRequestsModel.js";
import Staff from "../../api/models/staffModel.js"; // Make sure to import the Staff model
import app from "./backend_start.js";

console.log("Running TC-013-03!");

(async () => {
  await connectDB("tc_013_03");

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
  await Promise.all([populateStaff(), populateRequests()]);
};

const populateStaff = async () => {
  try {
    await Staff.create({
      staff_id: 140008,
      staff_fname: "George",
      staff_lname: "Clooney",
      dept: "Accounts",
      position: "Manager",
      country: "Singapore",
      email: "george.clooney@allinone.com.sg",
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
    await ArrangementRequest.insertMany([
      { staff_id: 140001, request_date: new Date("2024-10-01T19:29:24"), request_time: "PM", reason: "Childcare Issues", status: "Pending", manager_id: 140008 },
      { staff_id: 140002, request_date: new Date("2024-10-02T19:29:24"), request_time: "AM", reason: "Personal Leave", status: "Pending", manager_id: 140008 },
      { staff_id: 140003, request_date: new Date("2024-10-03T19:29:24"), request_time: "PM", reason: "Travel Plans", status: "Pending", manager_id: 140008 },
      { staff_id: 140004, request_date: new Date("2024-10-04T19:29:24"), request_time: "AM", reason: "Home Repair", status: "Pending", manager_id: 140008 },
      { staff_id: 140005, request_date: new Date("2024-10-05T19:29:24"), request_time: "PM", reason: "Mental Health Day", status: "Pending", manager_id: 140008 },
      { staff_id: 140006, request_date: new Date("2024-10-06T19:29:24"), request_time: "AM", reason: "Sick Leave", status: "Pending", manager_id: 140008 },
      { staff_id: 140007, request_date: new Date("2024-10-07T19:29:24"), request_time: "PM", reason: "Pet Care", status: "Pending", manager_id: 140008 },
      { staff_id: 140008, request_date: new Date("2024-10-08T19:29:24"), request_time: "AM", reason: "Travel Plans", status: "Pending", manager_id: 140008 },
      { staff_id: 140009, request_date: new Date("2024-10-09T19:29:24"), request_time: "PM", reason: "Stomach Pain", status: "Pending", manager_id: 140008 },
      { staff_id: 140010, request_date: new Date("2024-10-10T19:29:24"), request_time: "AM", reason: "Personal Leave", status: "Pending", manager_id: 140008 },
      { staff_id: 140011, request_date: new Date("2024-10-11T19:29:24"), request_time: "PM", reason: "Doctor Appointment", status: "Pending", manager_id: 140008 },
      { staff_id: 140012, request_date: new Date("2024-10-12T19:29:24"), request_time: "AM", reason: "Family Emergency", status: "Pending", manager_id: 140008 },
      { staff_id: 140013, request_date: new Date("2024-10-13T19:29:24"), request_time: "PM", reason: "Mental Health Day", status: "Pending", manager_id: 140008 },
      { staff_id: 140014, request_date: new Date("2024-10-14T19:29:24"), request_time: "AM", reason: "Relocation", status: "Pending", manager_id: 140008 },
      { staff_id: 140015, request_date: new Date("2024-10-15T19:29:24"), request_time: "PM", reason: "Relocation", status: "Pending", manager_id: 140008 },
      { staff_id: 140016, request_date: new Date("2024-10-16T19:29:24"), request_time: "AM", reason: "Travel Plans", status: "Pending", manager_id: 140008 },
      { staff_id: 140017, request_date: new Date("2024-10-17T19:29:24"), request_time: "PM", reason: "Doctor Appointment", status: "Pending", manager_id: 140008 },
      { staff_id: 140018, request_date: new Date("2024-10-18T19:29:24"), request_time: "AM", reason: "Home Repair", status: "Pending", manager_id: 140008 },
      { staff_id: 140019, request_date: new Date("2024-10-19T19:29:24"), request_time: "PM", reason: "Childcare Issues", status: "Pending", manager_id: 140008 },
      { staff_id: 140020, request_date: new Date("2024-10-20T19:29:24"), request_time: "AM", reason: "Personal Leave", status: "Pending", manager_id: 140008 },
      { staff_id: 140021, request_date: new Date("2024-10-21T19:29:24"), request_time: "PM", reason: "Travel Plans", status: "Pending", manager_id: 140008 },
    ]);
    console.log("Arrangement requests inserted successfully");
  } catch (error) {
    console.error("Error inserting arrangement requests:", error);
  }
};
