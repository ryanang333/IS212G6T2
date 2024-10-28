import { connectDB, currentTestDB } from "./db_test_start.js";
import teardownDB from "./db_test_end.js";
import Staff from "../../api/models/staffModel.js";
import app from "./backend_start.js";

console.log("Running TC-030-01 - Valid Login and Access to Designated Sections");

(async () => {
  await connectDB("030_01");

  await populateStaffData();

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

const populateStaffData = async () => {
  try {
    const staffArr = [
      {
        staff_id: 140881,
        staff_fname: "Jack",
        staff_lname: "Doe",
        dept: "CEO",
        position: "MD",
        country: "Singapore",
        email: "jack.doe@blackrock.com",
        reporting_manager: 140881,
        role: 1,
      },
      {
        staff_id: 140882,
        staff_fname: "John",
        staff_lname: "Doe",
        dept: "IT",
        position: "Developer",
        country: "Singapore",
        email: "john.doe@blackrock.com",
        reporting_manager: 160008,
        role: 2,
      },
      {
        staff_id: 160008,
        staff_fname: "Sally",
        staff_lname: "Doe",
        dept: "HR",
        position: "Director",
        country: "Singapore",
        email: "sally.doe@blackrock.com",
        reporting_manager: 140881,
        role: 3,
      },
    ];
    await Staff.insertMany(staffArr);
    console.log("Staff data inserted successfully for valid login test");
  } catch (error) {
    console.error("Error inserting staff data:", error);
  }
};
