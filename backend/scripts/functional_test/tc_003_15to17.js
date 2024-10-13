import { connectDB, currentTestDB } from "./db_test_start.js";
import teardownDB from "./db_test_end.js";
import ArrangementRequest from "../../api/models/arrangementRequestsModel.js";
import Staff from "../../api/models/staffModel.js";
import app from "./backend_start.js";

console.log("Running!");

(async () => {
  await connectDB("003_06to10");

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
  await Promise.all([populateStaff(), populateRequests()]);
};

const populateStaff = async () => {
  try {
    await Staff.create({
      staff_id: 140883,
      staff_fname: "Angelina",
      staff_lname: "Jolie",
      dept: "HR",
      position: "HR Manager",
      country: "Singapore",
      email: "angelina.jolie@allinone.com.sg",
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
    // Inserting requests as an array
    const requests = await ArrangementRequest.insertMany([
      { staff_id: 140883, request_date: new Date("2024-10-27T19:29:24"), request_time: "AM", reason: "Childcare Issues", status: "Approved", manager_id: 130002 },
      { staff_id: 140883, request_date: new Date("2024-10-26T19:29:24"), request_time: "PM", reason: "Personal Leave", status: "Approved", manager_id: 130002 },
      { staff_id: 140883, request_date: new Date("2024-10-25T19:29:24"), request_time: "AM", reason: "Travel Plans", status: "Approved", manager_id: 130002 },
      { staff_id: 140883, request_date: new Date("2024-10-24T19:29:24"), request_time: "PM", reason: "Home Repair", status: "Approved", manager_id: 130002 },
      { staff_id: 140883, request_date: new Date("2024-10-23T19:29:24"), request_time: "PM", reason: "Mental Health Day", status: "Approved", manager_id: 130002 },
      { staff_id: 140883, request_date: new Date("2024-10-22T19:29:24"), request_time: "PM", reason: "Personal Leave", status: "Approved", manager_id: 130002 },
      { staff_id: 140883, request_date: new Date("2024-10-21T19:29:24"), request_time: "AM", reason: "Sick Leave", status: "Approved", manager_id: 130002 },
      { staff_id: 140883, request_date: new Date("2024-10-20T19:29:24"), request_time: "PM", reason: "Pet Care", status: "Approved", manager_id: 130002 },
      { staff_id: 140883, request_date: new Date("2024-10-19T19:29:24"), request_time: "AM", reason: "Travel Plans", status: "Approved", manager_id: 130002 },
      { staff_id: 140883, request_date: new Date("2024-10-18T19:29:24"), request_time: "PM", reason: "Stomach Pain", status: "Approved", manager_id: 130002 },
      { staff_id: 140883, request_date: new Date("2024-10-17T19:29:24"), request_time: "PM", reason: "Personal Leave", status: "Approved", manager_id: 130002 },
      { staff_id: 140883, request_date: new Date("2024-10-16T19:29:24"), request_time: "PM", reason: "Doctor Appointment", status: "Pending", manager_id: 130002 },
      { staff_id: 140883, request_date: new Date("2024-10-15T19:29:24"), request_time: "AM", reason: "Stomach Pain", status: "Pending", manager_id: 130002 },
      { staff_id: 140883, request_date: new Date("2024-10-14T19:29:24"), request_time: "PM", reason: "Family Emergency", status: "Pending", manager_id: 130002 },
      { staff_id: 140883, request_date: new Date("2024-10-13T19:29:24"), request_time: "PM", reason: "Mental Health Day", status: "Pending", manager_id: 130002 },
      { staff_id: 140883, request_date: new Date("2024-10-12T19:29:24"), request_time: "PM", reason: "Doctor Appointment", status: "Pending", manager_id: 130002 },
      { staff_id: 140883, request_date: new Date("2024-10-11T19:29:24"), request_time: "AM", reason: "Mental Health Day", status: "Pending", manager_id: 130002 },
      { staff_id: 140883, request_date: new Date("2024-10-10T19:29:24"), request_time: "AM", reason: "Relocation", status: "Pending", manager_id: 130002 },
      { staff_id: 140883, request_date: new Date("2024-10-09T19:29:24"), request_time: "PM", reason: "Relocation", status: "Pending", manager_id: 130002 },
      { staff_id: 140883, request_date: new Date("2024-10-08T19:29:24"), request_time: "PM", reason: "Travel Plans", status: "Pending", manager_id: 130002 },
      {staff_id: 140883, request_date: new Date("2024-10-07T19:29:24"), request_time: "PM", reason: "Doctor Appointment", status: "Pending", manager_id: 130002 },
    ]);
    console.log("Arrangement requests inserted successfully");
  } catch (error) {
    console.error("Error inserting requests:", error);
  }
};
