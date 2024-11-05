import { autoRejectPendingRequests } from "./controllers/arrangementRequestsController.js";

export const handler = async (req, res) => {
  try {
    await autoRejectPendingRequests();
    res.status(200).send("Pending requests auto-rejected successfully.");
  } catch (error) {
    res.status(500).send("Error occurred while processing requests");
  }
};
