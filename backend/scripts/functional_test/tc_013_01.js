import { connectDB, currentTestDB } from "./db_test_start.js";
import teardownDB from "./db_test_end.js";
import ArrangementRequest from "../../api/models/arrangementRequestsModel.js";
import Staff from "../../api/models/staffModel.js";
import app from "./backend_start.js";

console.log("Running!");

(async () => {
  await connectDB("TC_13_01");

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
        dept: "Accounts Manager",
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
    const requests = await ArrangementRequest.insertMany([
      {
        staff_id: 140081,
        request_date: new Date("2024-01-12T08:00:00"),
        request_time: "AM",
        reason: "Need to take care of children",
        status: "Pending",
        manager_id: 140008,
      },
      {
        staff_id: 140082,
        request_date: new Date("2024-09-24T08:00:00"),
        request_time: "AM",
        reason: "Stomach Pain",
        status: "Pending",
        manager_id: 140008,
      }
    ]);

    console.log("Request data inserted successfully", requests);
  } catch (error) {
    console.error("Error inserting request data:", error);
  }
};
