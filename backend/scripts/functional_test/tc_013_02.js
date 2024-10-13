import { connectDB, currentTestDB } from "./db_test_start.js";
import teardownDB from "./db_test_end.js";
import app from "./backend_start.js";
import httpMocks from "node-mocks-http";
import { getArrangementRequests } from "../../api/controllers/arrangementRequestsController.js";
import ArrangementRequest from "../../api/models/arrangementRequestsModel.js";
import Staff from "../../api/models/staffModel.js";

console.log("Running TC-013-02!");

(async () => {
  await connectDB("TC-013-02");

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
  await populateStaff();
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

(async () => {
  await populateData();

  const req = httpMocks.createRequest({
    method: "GET",
    url: "/arrangementRequests/",
    query: {
      manager_id: 140008,
    },
  });

  const res = httpMocks.createResponse();
  await getArrangementRequests(req, res);

  const response = res._getJSONData();
  if (response.length === 0) {
    console.log("No submitted requests");
  }

  console.log(`Expected: No submitted requests, Actual: ${response.length === 0 ? "No submitted requests" : "Requests found"}`);
})();
