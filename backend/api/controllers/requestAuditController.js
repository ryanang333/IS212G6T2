import RequestAudit from "../models/requestAuditModel.js";
import ArrangementRequest from "../models/arrangementRequestsModel.js";

/**
 * Creates audit entries for a list of requests.
 *
 * @param {Array} requestArr - Array of request objects for which audit entries are to be created.
 * @param {string} staffId - The ID of the staff who changed the request status.
 * @param {string} oldStatus - The previous status of the requests.
 * @param {string} newStatus - The new status of the requests after the change.
 * @returns {Promise<void>} - A promise that resolves when the audit entries are inserted.
 */
export const createAuditEntry = async (requestArr, staffId, oldStatus, newStatus) => {
  try {
    await RequestAudit.insertMany(
      requestArr.map((req) => ({
        request_id: req._id,
        changed_by: staffId,
        old_status: oldStatus,
        new_status: newStatus,
      }))
    );
  } catch (error) {
    return responseUtils.handleInternalServerError(
      res,
      "Internal server error"
    );
  }
};

/**
 * Fetches audit logs based on optional filters for request date and staff ID.
 *
 * @param {Object} req - The request object from the client, containing optional query parameters.
 * @param {Object} res - The response object to send the result back to the client.
 * @returns {Promise<void>} - A promise that resolves when the response is sent back to the client.
 */
export const fetchAuditLogs = async (req, res) => {
  const { startDate, endDate, staffId } = req.query;

  try {
    let arrangementRequests = [];

    // Build query based on optional filters
    const query = {};
    if (startDate && endDate) {
      query.request_date = {
        $gte: new Date(startDate),
        $lt: new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1)),
      };
    } else if (startDate) {
      query.request_date = {
        $gte: new Date(startDate),
      };
    } else if (endDate) {
      query.request_date = {
        $lt: new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1)),
      };
    }
    
    if (staffId) {
      query.staff_id = staffId; // Filter by requester staff_id
    }

    // Fetch ArrangementRequest IDs based on filters
    arrangementRequests = await ArrangementRequest.find(query).select('_id staff_id request_date manager_id reason withdraw_reason manager_reason');

    // Fetch RequestAudit logs based on the filtered ArrangementRequest IDs or fetch all logs if no filters
    let logs = [];
    if (arrangementRequests.length) {
      console.log("in arrangementRequests.length block")
      logs = await RequestAudit.find({
        request_id: { $in: arrangementRequests.map(req => req._id) }
      }).populate({
        path: 'request_id',
        select: 'staff_id request_date reason withdraw_reason manager_reason',
      });
    }

    console.log('Arrangement Requests:', arrangementRequests.length);
    console.log('Fetched Logs:', logs.length);

    // Map logs to the desired output format
    const formattedLogs = logs.map(log => ({
      _id: log._id,
      request_id: log.request_id
        ? {
            _id: log.request_id._id,
            staff_id: log.request_id.staff_id,
            request_date: log.request_id.request_date,
            reason: log.request_id.reason,
            withdraw_reason: log.request_id.withdraw_reason,
            manager_reason: log.request_id.manager_reason,
          }
        : null,
      changed_by: log.changed_by,
      change_timestamp: log.change_timestamp,
      old_status: log.old_status,
      new_status: log.new_status,
    }));

    // Send the response in the desired format
    res.status(200).json({
      count: formattedLogs.length,
      logs: formattedLogs,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
