import { connectDB, currentTestDB } from "./db_test_start.js";
import teardownDB from "./db_test_end.js";
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
  await populateStaff(); // Only populate staff data
};

const populateStaff = async () => {
  try {
    await Staff.create({
      staff_id: 140882,
      staff_fname: "Brad",
      staff_lname: "Pitt",
      dept: "Marketing",
      position: "Team Lead",
      country: "Singapore",
      email: "brad.pitt@allinone.com.sg",
      reporting_manager: 130002,
      role: 2,
    });
    console.log("Staff data inserted successfully");
  } catch (error) {
    console.error("Error inserting staff data:", error);
  }
};