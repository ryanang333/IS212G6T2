import ArrangementRequest from "../models/arrangementRequestsModel.js";
import { getStaffDetails } from "./staffController.js";
import { createAuditEntry } from "./requestAuditController.js";
import {
  checkDatesValidity,
  checkIfDatesOverlap,
} from "../utils/dateChecker.js";
import * as responseUtils from "../utils/responseUtils.js";
import { v4 as uuidv4 } from "uuid"; // Used to generate group_id 

export const REQUEST_STATUS_PENDING = "Pending";
export const REQUEST_STATUS_NONE = "N/A";
export const REQUEST_STATUS_APPROVED = "Approved";

/**
 * Approves arrangement request instantly if staff is CEO.
 * @param {string} staffId - The ID of the staff member.
 * @param {Array<Object>} arrangementRequests - The array of arrangement request objects.
 * @returns {Promise<Array|boolean>} - A promise that resolves to an array of approved requests or false if not the CEO.
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<void>} 
*/
const approveIfCEO = async (staffId, arrangementRequests) => {
  if (staffId === "00001") {
    // Instantly approve the request if the staff is CEO
    const reqArr = await ArrangementRequest.insertMany(
      arrangementRequests.map((req) => ({
        staff_id: staffId,
        request_date: new Date(req.date),
        status: "Approved", // Instantly approve
        manager_id: "00001", // is his own id
        request_time: req.time,
        group_id: req.group_id || null,
        reason: req.reason,
      }))
    );
    if (reqArr.length > 0) {
      await createAuditEntry(
        reqArr,
        staffId,
        REQUEST_STATUS_NONE,
        REQUEST_STATUS_APPROVED
      );
    }
    return true;
    //Create audit logs
  }
  return false;
};

/**
 * Creates temporary arrangement requests for a staff member.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the response has been sent.
 */
export const createTempArrangementRequests = async (req, res) => {
  try {
    const { staffId, arrangementRequests } = req.body;

    const validationResponse = checkDatesValidity(arrangementRequests);
    if (!validationResponse.isValid) {
      return responseUtils.handleBadRequest(
        res,
        "Arrangement request dates are invalid!"
      );
    }

    // Check if the staff is CEO and approve instantly if true
    const instantApproval = await approveIfCEO(staffId, arrangementRequests);
    if (instantApproval) {
      return responseUtils.handleCreatedResponse(
        res,
        instantApproval,
        "Request(s) have been instantly approved!"
      );
    }

    const staff = await getStaffDetails(staffId);
    if (!staff) {
      return responseUtils.handleNotFound(res, "Staff does not exist!");
    }

    return responseUtils.handleCreatedResponse(
      res,
      await createNewRequests(
        arrangementRequests,
        staff.staff_id,
        staff.reporting_manager
      ),
      "Request(s) have been submitted successfully!"
    );
  } catch (error) {
    if (error.message.includes("Cannot apply")) {
      return responseUtils.handleConflict(res, error.message);
    }
    return responseUtils.handleInternalServerError(res, error.message);
  }
};
/**
 * Retrieves the schedule of requests for a specific staff member between given dates.
 *
 * @async
 * @function getOwnSchedule
 * @param {Object} req - The request object from Express.
 * @param {Object} res - The response object from Express.
 * @throws {Error} Will respond with a bad request if startDate, endDate, or staff_id are not provided.
 * @returns {Promise<void>} A promise that resolves when the response has been sent.
 */
export const getOwnSchedule = async (req, res) => {
  const { startDate, endDate, staff_id } = req.query;
  if (!startDate || !endDate) {
    return responseUtils.handleBadRequest(
      res,
      "Start or end date not populated!"
    );
  } else if (!staff_id) {
    return responseUtils.handleBadRequest(res, "Please provide a staff Id");
  }

  try {
    const response = await findExistingRequestsBetweenDates(
      staff_id,
      startDate,
      endDate
    );
    return responseUtils.handleSuccessResponse(
      res,
      response,
      "Requests have been fetched successfully!"
    );
  } catch (error) {
    return responseUtils.handleInternalServerError(
      res,
      "Not able to fetch request(s) ... :("
    );
  }
};

export const createRegArrangementRequests = async (req, res) => {
  try {
    const { staffId, arrangementRequests } = req.body;
    const arrangementRequestsDirty = arrangementRequests[0];

    // Uses UUID module to gen unique group ID - Note that it is a string
    const groupID = uuidv4();

    // Convert the recurring weeks into individual dates for arrangement requests
    const startDate = new Date(arrangementRequestsDirty.startDate);
    const recurringInterval = parseInt(
      arrangementRequestsDirty.recurringInterval.replace("week", ""),
      10
    ); // Get the interval in weeks
    const numEvents = arrangementRequestsDirty.numEvents;
    const newRequests = [];

    for (let i = 0; i < numEvents; i++) {
      const requestDate = new Date(startDate);
      requestDate.setDate(requestDate.getDate() + i * recurringInterval * 7);

      newRequests.push({
        date: requestDate,
        time: arrangementRequestsDirty.time,
        reason: arrangementRequestsDirty.reason,
        group_id: groupID,
      });
    }
    const validationResponse = checkDatesValidity(arrangementRequests);
    if (!validationResponse.isValid) {
      return responseUtils.handleBadRequest(
        res,
        "Arrangement request dates are invalid!"
      );
    }
    // Check if the staff is CEO and approve instantly if true
    const instantApproval = await approveIfCEO(staffId, newRequests);
    if (instantApproval) {
      return responseUtils.handleCreatedResponse(
        res,
        instantApproval,
        "Request(s) have been instantly approved!"
      );
    }

    // Fetch staff details
    const staff = await getStaffDetails(staffId);
    if (!staff) {
      return responseUtils.handleNotFound(res, "Staff does not exist!");
    }

    // Create new arrangement requests
    const createdRequests = await createNewRequests(
      newRequests,
      staff.staff_id,
      staff.reporting_manager
    );

    return responseUtils.handleCreatedResponse(
      res,
      createdRequests,
      "Request(s) have been submitted successfully!"
    );
  } catch (error) {
    if (error.message.includes("Cannot apply")) {
      return responseUtils.handleConflict(res, error.message);
    }
    return responseUtils.handleInternalServerError(res, error.message);
  }
};

/**
 * Creates new arrangement requests if there are no existing requests for the specified slots.
 * @param {Array<Object>} arrangementRequests - The array of arrangement request objects.
 * @param {number} staffId - The ID of the staff member.
 * @param {number} managerId - The ID of the staff member's manager.
 * @returns {Promise<Array|boolean>} - A promise that resolves to an array of created requests or false if requests already exist.
 */
const createNewRequests = async (arrangementRequests, staffId, managerId) => {
  try {
    const requests = arrangementRequests.map((req) => ({
      date: new Date(req.date),
    }));
    const existingRequests = await findExistingRequests({
      staff_id: staffId,
      requestSlots: requests,
    });

    checkIfDatesOverlap(existingRequests, arrangementRequests);

    const reqArr = await ArrangementRequest.insertMany(
      arrangementRequests.map((req) => ({
        staff_id: staffId,
        request_date: new Date(req.date),
        status: "Pending",
        manager_id: managerId,
        request_time: req.time,
        group_id: req.group_id || null,
        reason: req.reason,
      }))
    );

    if (reqArr.length > 0) {
      await createAuditEntry(
        reqArr,
        staffId,
        REQUEST_STATUS_NONE,
        REQUEST_STATUS_PENDING
      );
    }
  } catch (error) {
    const msg = error.message.includes("Cannot apply")
      ? error.message
      : "Failed to create arrangement requests";
    throw new Error(msg);
  }
};

/**
 * Retrieves approved arrangement requests for a specific staff member between given dates.
 *
 * @async
 * @function findExistingRequestsBetweenDates
 * @param {string} staffId - The unique identifier of the staff member.
 * @param {string} startDate - The start date for filtering requests (inclusive).
 * @param {string} endDate - The end date for filtering requests (inclusive).
 * @throws {Error} Will throw an error if the request to fetch existing requests fails.
 * @returns {Promise<Array>} A promise that resolves to an array of approved arrangement requests.
 */
export const findExistingRequestsBetweenDates = async (
  staffId,
  startDate,
  endDate
) => {
  try {
    return await ArrangementRequest.find({
      staff_id: staffId,
      request_date: {
        $gte: startDate,
        $lte: endDate,
      },
      status: "Approved",
    });
  } catch (error) {
    throw new Error("Failed to fetch existing requests");
  }
};

/**
 * Finds existing arrangement requests based on provided filters.
 * @param {Object} filters - The filters to apply.
 * @param {string} [filters.staff_id] - The ID of the staff member.
 * @param {Array<Object>} [filters.requestSlots] - An array of request slots, each containing date and time.
 * @returns {Promise<Array>} - A promise that resolves to an array of existing requests.
 */
const findExistingRequests = async ({ staff_id, requestSlots }) => {
  const query = {};

  if (staff_id) {
    query.staff_id = staff_id;
  }

  if (requestSlots && requestSlots.length > 0) {
    query.$or = requestSlots.map((slot) => ({
      request_date: slot.date,
    }));
  }

  try {
    return await ArrangementRequest.find(query);
  } catch (error) {
    throw new Error("Failed to fetch existing requests");
  }
};

export const getStaffArrangementRequests = async (req, res) => {
  try {
    const { staff_id } = req.query;

    if (!staff_id) {
      return responseUtils.handleBadRequest(res, "staff_id is required");
    }

    const numericStaffID = Number(staff_id);

    const arrangementRequests = await ArrangementRequest.find({
      staff_id: numericStaffID,
    }).populate("staff");

    if (arrangementRequests.length === 0) {
      return responseUtils.handleNotFound(res, 'Request not found');
    }

    res.status(200).json(arrangementRequests);
  } catch (error) {
    return responseUtils.handleInternalServerError(res, 'Server error');
  }
};

export const getArrangementRequests = async (req, res) => {
  try {
    const { manager_id } = req.query;

    if (!manager_id) {
      return responseUtils.handleBadRequest(res, "Manager ID is required!");
    }

    const numericManagerId = Number(manager_id);

    const arrangementRequests = await ArrangementRequest.find({
      manager_id: numericManagerId,
      status: "Pending",
    }).populate("staff");

    if (arrangementRequests.length === 0) {
      return responseUtils.handleNotFound(res, "No arrangement requests found for this manager");
    }
    
    res.status(200).json(arrangementRequests);
  } catch (error) {
    return responseUtils.handleInternalServerError(res, error.message);
  }
};

export const approveRequest = async (req, res) => {
  const { requestId } = req.body;

  try {
    const updatedRequest = await ArrangementRequest.findByIdAndUpdate(
      requestId,
      { status: 'Approved' },
      { new: true }
    );

    if (!updatedRequest) {
      return responseUtils.handleNotFound(res, 'Request not found');
    }

    res.status(200).json(updatedRequest);
  } catch (error) {
    console.error('Error Approving request:', error);
    return responseUtils.handleNotFound(res, 'Request not found');
  }
};

export const rejectRequest = async (req, res) => {
  const { requestId, reason } = req.body;

  try {
    const updatedRequest = await ArrangementRequest.findByIdAndUpdate(
      requestId,
      { status: 'Rejected', rejection_reason: reason},
      { new: true }
    );

    if (!updatedRequest) {
      return responseUtils.handleNotFound(res, 'Request not found');
    }

    res.status(200).json(updatedRequest);
  } catch (error) {
    console.error('Error rejecting request:', error);
    return responseUtils.handleInternalServerError(res, 'Server error');
  }
};

export const approveSelectedRequests = async (req, res) => {
  try {
    const { requestIds, managerId } = req.body;

    if (!requestIds || requestIds.length === 0) {
      return responseUtils.handleBadRequest(res, "No Request Selected");
    }

    const updatedRequests = await ArrangementRequest.updateMany(
      { _id: { $in: requestIds }, manager_id: managerId, status: "Pending" },
      { $set: { status: "Approved" } }
    );

    if (updatedRequests.nModified === 0) {
      return responseUtils.handleNotFound(res, 'Request not found');
    }

    responseUtils.handleSuccessResponse(res, null, 'Selected requests approved successfully!');
  } catch (error) {
    console.error('Error approving selected requests:', error);
    return responseUtils.handleInternalServerError(res, 'Server error');
  }
};

export const rejectSelectedRequests = async (req, res) => {
  const { requestIds, reason } = req.body;

  try {

    if (!reason) {
      return responseUtils.handleBadRequest(res, "Rejection Reason Required");
    }

    if (!requestIds || requestIds.length === 0) {
      return responseUtils.handleBadRequest(res, "No Request Selected");
    }

    const updatedRequests = await ArrangementRequest.updateMany(
      { _id: { $in: requestIds }, status: 'Pending' },
      { $set: { status: 'Rejected', rejection_reason: reason } }
    );

    if (updatedRequests.nModified === 0) {
      return responseUtils.handleNotFound(res, 'Request not found');
    }

    responseUtils.handleSuccessResponse(res, null, 'Selected requests rejected successfully!');
  } catch (error) {
    console.error('Error rejecting selected requests:', error);
    return responseUtils.handleInternalServerError(res, 'Server error');
  }
};

export const approveGroupRequests = async (req, res) => {
  const { requestIds } = req.body;

  if (!requestIds || requestIds.length === 0) {
    return responseUtils.handleBadRequest(res, "No Request Selected");
  }

  try {
    const updatedRequests = await ArrangementRequest.updateMany(
      { _id: { $in: requestIds }, status: 'Pending' },
      { $set: { status: 'Approved' } }
    );

    if (updatedRequests.nModified === 0) {
      return responseUtils.handleNotFound(res, 'Request not found');
    }

    responseUtils.handleSuccessResponse(res, null, 'Group requests approved successfully!');

  } catch (error) {
    return responseUtils.handleInternalServerError(res, 'Server error');
  }
};

export const rejectGroupRequests = async (req, res) => {
  console.log(req.body);
  const { requestIds, reason } = req.body;

  try {

    if (!reason) {
      return responseUtils.handleBadRequest(res, "Rejection Reason Required");
    }

    const updatedRequests = await ArrangementRequest.updateMany(
      { _id: { $in: requestIds }, status: "Pending" },
      { $set: { status: "Rejected", rejection_reason: reason } }
    );
    console.log("updatedrequest => ", updatedRequests);
    console.log("updatedrequest n modified => ", updatedRequests.nModified);
    if (updatedRequests.modifiedCount === 0) {
      return responseUtils.handleNotFound(res, 'Request not found');
    }

    responseUtils.handleSuccessResponse(res, null, 'Group requests rejected successfully!');
  } catch (error) {
    console.error("Error rejecting group requests:", error);
    return responseUtils.handleInternalServerError(res, 'Server error');
  }
};

export const approveAllRequests = async (req, res) => {
  try {
    const { managerId } = req.body;

    if (!managerId) {
      return responseUtils.handleBadRequest(res, "Manager ID Required");
    }

    const pendingRequests = await ArrangementRequest.find({
      manager_id: managerId,
      status: "Pending",
    });

    if (pendingRequests.length === 0) {
      return responseUtils.handleNotFound(res, 'Request not found');
    }

    const updatedRequests = await ArrangementRequest.updateMany(
      { manager_id: managerId, status: "Pending" },
      { $set: { status: "Approved" } },
      { new: true }
    );

    res.status(200).json({ message: 'All pending requests approved successfully!', updatedRequests });
  } catch (error) {
    console.error('Error approving all requests:', error);
    return responseUtils.handleInternalServerError(res, 'Server error');
  }
};

export const rejectAllRequests = async (req, res) => {
  const { managerId, reason } = req.body;

  try {
    if (!managerId) {
      return responseUtils.handleBadRequest(res, "Manager ID Required");
    }

    if (!reason) {
      return responseUtils.handleBadRequest(res, "Rejection Reason Required");
    }

    // Find all pending requests for the given manager
    const pendingRequests = await ArrangementRequest.find({
      manager_id: managerId,
      status: "Pending",
    });

    if (pendingRequests.length === 0) {
      return responseUtils.handleNotFound(res, 'Request not found');
    }

    // Reject all requests at once
    const updatedRequests = await ArrangementRequest.updateMany(
      { manager_id: managerId, status: "Pending" },
      { $set: { status: "Rejected", rejection_reason: reason } },
      { new: true }
    );

    res.status(200).json({ message: 'All pending requests rejected successfully!', updatedRequests });
  } catch (error) {
    console.error('Error rejecting all requests:', error);
    return responseUtils.handleInternalServerError(res, 'Server error');
  }
};