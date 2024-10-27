import { connectDB, currentTestDB } from "./db_test_start.js";
import teardownDB from "./db_test_end.js";
import ArrangementRequest from "../../api/models/arrangementRequestsModel.js";
// import autoRejectPendingRequests from "../../api/controllers/arrangementRequestsController";
import app from "./backend_start.js";
import { autoRejectPendingRequests } from "../../api/controllers/arrangementRequestsController.js";


console.log("Running Auto-Reject Functional Test!");

(async () => {
  await connectDB("tc_020_01");

  await populateData();

  const server = app.listen(process.env.PORT, () => {
    console.log(`Server ready on port ${process.env.PORT}`);
  });

  await autoRejectPendingRequests();

  await verifyAutoRejectResults();

  const shutdown = async () => {
    console.log("Shutting down test environment...");
    await teardownDB(currentTestDB);
    server.close(() => {
      console.log("Server closed and test environment cleaned up.");
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
})();

const populateData = async () => {
  await ArrangementRequest.insertMany([
    {
      staff_id: 140881,
      request_date: new Date("2024-01-12T08:00:00"), // Expired date
      request_time: "AM",
      reason: "Need to take care of children",
      status: "Pending",
      manager_id: 130002
    },
    {
      staff_id: 140881,
      request_date: new Date(), // Not expired, today’s date
      request_time: "PM",
      reason: "Sick",
      status: "Pending",
      manager_id: 130002
    }
  ]);
  console.log("Test data populated.");
};

const verifyAutoRejectResults = async () => {
  const expiredRequest = await ArrangementRequest.findOne({ request_date: new Date("2024-01-12T08:00:00") });
  const currentRequest = await ArrangementRequest.findOne({ request_date: new Date() });

  if (expiredRequest.status === "Rejected" && expiredRequest.manager_reason === "Auto-rejected by system due to lack of manager action") {
    console.log("Expired request auto-rejected successfully.");
  } else {
    console.error("Auto-reject failed for expired request.");
  }

  if (currentRequest.status === "Pending") {
    console.log("Current request remained unaffected as expected.");
  } else {
    console.error("Unexpected status change in non-expired request.");
  }
};
