import ArrangementRequest from "../models/arrangementRequestsModel.js";
import { getStaffDetails, getStaffIdsByDept } from "./staffController.js";
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
export const REQUEST_STATUS_CANCELLED = "Cancelled";

/**
 * Approves arrangement request instantly if staff is CEO.
 * @param {string} staffId - The ID of the staff member.
 * @param {Array<Object>} arrangementRequests - The array of arrangement request objects.
 * @returns {Promise<Array|boolean>} - A promise that resolves to an array of approved requests or false if not the CEO.
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
 * Formats the schedule data for staff members based on their requests.
 *
 * This function creates a schedule map from a mapping of staff IDs to names
 * and an array of requests. It populates the schedule for each staff member
 * based on their requests.
 *
 * @param {Map<string, string>} staffIdMap - A map where the key is the staff ID and the value is the staff member's name.
 * @param {Array<Object>} requestsArray - An array of request objects, each containing details about the requests made by staff members.
 * @returns {Map<string, Object>} A map where each key is a staff ID, and the value is an object containing the AM and PM status and the staff member's name.
 */
const formatScheduleData = (staffIdMap, requestsArray) => {
  const staffIdToScheduleMap = transformStaffIdToScheduleMap(staffIdMap);
  populateScheduleMap(staffIdToScheduleMap, requestsArray);
  return staffIdToScheduleMap;
};

/**
 * Transforms a map of staff IDs to a schedule map.
 *
 * This function initializes a new map where each staff ID is mapped to an object
 * containing the AM and PM schedule status (initialized to 0) and the staff member's name.
 *
 * @param {Map<string, string>} staffIdMap - A map where the key is the staff ID and the value is the staff member's name.
 * @returns {Map<string, Object>} A map where each key is a staff ID, and the value is an object containing the AM and PM schedule status and the staff member's name.
 */
const transformStaffIdToScheduleMap = (staffIdMap) => {
  const staffIdToScheduleMap = new Map();
  for (let [staffId, name] of staffIdMap) {
    staffIdToScheduleMap.set(staffId, {
      AM: 0,
      PM: 0,
      name: name,
    });
  }
  return staffIdToScheduleMap;
};

/**
 * Populates the schedule map with request data.
 *
 * This function iterates over an array of requests and updates the schedule
 * map based on the requests made by each staff member. It sets the AM and PM
 * schedule statuses according to the request type (Full Day or Part Day).
 *
 * @param {Map<string, Object>} staffIdToScheduleMap - A map where each key is a staff ID, and the value is an object containing the AM and PM schedule status and the staff member's name.
 * @param {Array<Object>} requestsArray - An array of request objects, each containing details about the requests made by staff members.
 */
const populateScheduleMap = (staffIdToScheduleMap, requestsArray) => {
  for (let request of requestsArray) {
    let schedule;
    if (staffIdToScheduleMap.has(request.staff_id)) {
      schedule = staffIdToScheduleMap.get(request.staff_id);
    }
    if (request.request_time == "Full Day") {
      schedule["AM"] = 1;
      schedule["PM"] = 1;
    } else {
      schedule[request.request_time] = 1;
    }
    staffIdToScheduleMap.set(request.staff_id, schedule);
  }
};

/**
 * Handles the GET request for fetching the team schedule.
 *
 * This asynchronous function retrieves the staff IDs for a specific department
 * and finds any existing requests between the provided start and end dates.
 * It formats the schedule data and returns it in the response.
 *
 * @async
 * @param {Object} req - The request object from the client, containing query parameters for start date, end date, and department.
 * @param {Object} res - The response object used to send back the desired HTTP response.
 * @returns {Promise<void>} A promise that resolves when the response is sent or rejects on error.
 */
export const getTeamSchedule = async (req, res) => {
  const { startDate, endDate, dept } = req.query;
  if (!startDate || !endDate) {
    return responseUtils.handleBadRequest(
      res,
      "Start or end date not populated!"
    );
  } else if (!dept) {
    return responseUtils.handleBadRequest(res, "Please provide the department");
  }
  try {
    const staffIdMap = await getStaffIdsByDept(dept);
    let requestsArray = [];
    if (staffIdMap.size > 0) {
      requestsArray = await findExistingRequestsBetweenDates(
        Array.from(staffIdMap.keys()),
        startDate,
        endDate
      );
    }
    const formattedMap = formatScheduleData(staffIdMap, requestsArray);
    return responseUtils.handleSuccessResponse(
      res,
      Array.from(formattedMap.values()),
      "Requests fetched successfully!"
    );
  } catch (error) {
    return responseUtils.handleInternalServerError(
      res,
      "Unable to get requests by dept :("
    );
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
      [staff_id],
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
 * @param {Array} staffIds - An array of unique identifier of the staff members.
 * @param {string} startDate - The start date for filtering requests (inclusive).
 * @param {string} endDate - The end date for filtering requests (inclusive).
 * @throws {Error} Will throw an error if the request to fetch existing requests fails.
 * @returns {Promise<Array>} A promise that resolves to an array of approved arrangement requests.
 */
export const findExistingRequestsBetweenDates = async (
  staffIds,
  startDate,
  endDate
) => {
  try {
    return await ArrangementRequest.find({
      staff_id: { $in: staffIds },
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

export const getArrangementRequests = async (req, res) => {
  try {
    const { manager_id } = req.query;

    if (!manager_id) {
      return res.status(400).json({ error: "manager_id is required" });
    }

    const numericManagerId = Number(manager_id);

    const arrangementRequests = await ArrangementRequest.find({
      manager_id: numericManagerId,
      status: { $in: ["Pending", "Approved"] }, // Fetch both Pending and Approved
    }).populate("staff");

    if (arrangementRequests.length === 0) {
      return res
        .status(404)
        .json({ message: "No arrangement requests found for this manager" });
    }

    res.status(200).json(arrangementRequests);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    });

    if (arrangementRequests.length === 0) {
      return responseUtils.handleNotFound(res, "No arrangement requests found for this staff");
    }
    return responseUtils.handleSuccessResponse(res, arrangementRequests, "Staff requests fetched successfully!");
  } catch (error) {
    return responseUtils.handleInternalServerError(res, error.message);
  }
};
/**
 * Cancels pending WFH arrangement requests for a staff member.
 * Staff can either cancel an entire regular request (parent) or individual ad-hoc requests (children).
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the response has been sent.
 **/

 export const cancelPendingArrangementRequests = async (req, res) => {
  try {
    const { staffId, requestIds, cancelAll } = req.body;

    if (!requestIds || requestIds.length === 0) {
      return responseUtils.handleBadRequest(res, "No requests selected for cancellation.");
    }

  
    const pendingRequests = await ArrangementRequest.find({
      staff_id: staffId,
      _id: { $in: requestIds },
      status: REQUEST_STATUS_PENDING,
    });

    if (pendingRequests.length === 0) {
      return responseUtils.handleNotFound(res, "No pending requests found for cancellation.");
    }

    
    if (cancelAll) {
      const groupId = pendingRequests[0].group_id; 
      if (groupId) {
       
        await ArrangementRequest.updateMany(
          { group_id: groupId, status: REQUEST_STATUS_PENDING },
          { status: REQUEST_STATUS_CANCELLED }
        );
      }
    } else {
      
      await ArrangementRequest.updateMany(
        { _id: { $in: requestIds }, status: REQUEST_STATUS_PENDING },
        { status: REQUEST_STATUS_CANCELLED }
      );
    }

    
    await createAuditEntry(pendingRequests, staffId, REQUEST_STATUS_PENDING, REQUEST_STATUS_CANCELLED);

    return responseUtils.handleSuccessResponse(
      res,
      pendingRequests.map((req) => req._id),
      "Selected request(s) have been successfully cancelled."
    );
  } catch (error) {
    return responseUtils.handleInternalServerError(res, error.message);
  }
};


export const updateRequestStatus = async (req, res) => {
  const { id } = req.params;   
  const { status, withdraw_reason, manager_reason } = req.body; 
  
  if ((!withdraw_reason || withdraw_reason.trim() === "") && (!manager_reason || manager_reason.trim() === "")) {
    return res.status(400).json({ message: 'Cancellation reason or manager reason cannot be empty' });
  }
  
  try {
    const updateFields = { status: status };

    if (withdraw_reason) {
      updateFields.withdraw_reason = withdraw_reason;
    }
    if (manager_reason) {
      updateFields.manager_reason = manager_reason;
    }

    const updatedRequest = await ArrangementRequest.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.status(200).json(updatedRequest);
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
