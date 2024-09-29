import ArrangementRequest from "../models/arrangementRequestsModel.js";
import { getStaffDetails } from "./staffController.js";
import {
  checkDatesValidity,
  checkIfDatesOverlap,
} from "../utils/dateChecker.js";
import * as responseUtils from "../utils/responseUtils.js";
import { v4 as uuidv4 } from 'uuid'; // Used to generate group_id

/**
 * Approves arrangement request instantly if staff is CEO.
 * @param {string} staffId - The ID of the staff member.
 * @param {Array<Object>} arrangementRequests - The array of arrangement request objects.
 * @returns {Promise<Array|boolean>} - A promise that resolves to an array of approved requests or false if not the CEO.
 */
const approveIfCEO = async (staffId, arrangementRequests) => {
  if (staffId === '00001') {
    // Instantly approve the request if the staff is CEO
    return await ArrangementRequest.insertMany(
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

    // Check if the staff is CEO and approve instantly if true
    const instantApproval = await approveIfCEO(staffId, arrangementRequests);
    if (instantApproval) {
      return responseUtils.handleCreatedResponse(
        res,
        instantApproval,
        "Request(s) have been instantly approved!"
      );
    }

    const validationResponse = checkDatesValidity(arrangementRequests);
    if (!validationResponse.isValid) {
      return responseUtils.handleBadRequest(
        res,
        "Arrangement request dates are invalid!"
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

export const createRegArrangementRequests = async (req, res) => {
  try {
    const { staffId, arrangementRequests } = req.body;
    const arrangementRequestsDirty = arrangementRequests[0];

    // Uses UUID module to gen unique group ID - Note that it is a string
    const groupID = uuidv4();

    // Convert the recurring weeks into individual dates for arrangement requests
    const startDate = new Date(arrangementRequestsDirty.startDate);
    const recurringInterval = parseInt(arrangementRequestsDirty.recurringInterval.replace("week", ""), 10); // Get the interval in weeks
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

    // Check if the staff is CEO and approve instantly if true
    const instantApproval = await approveIfCEO(staffId, newRequests);
    if (instantApproval) {
      return responseUtils.handleCreatedResponse(
        res,
        instantApproval,
        "Request(s) have been instantly approved!"
      );
    }
    // Everything below is the same as Ang's Temp Arrangment, utilizing the makeRequest function
    // Validate the newly created arrangement requests 
    const validationResponse = checkDatesValidity(newRequests);
    if (!validationResponse.isValid) {
      return responseUtils.handleBadRequest(
        res,
        "Arrangement request dates are invalid!"
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

    return await ArrangementRequest.insertMany(
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
  } catch (error) {
    const msg = error.message.includes("Cannot apply")
      ? error.message
      : "Failed to create arrangement requests";
    throw new Error(msg);
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
      status: "Pending",
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
      return res.status(400).json({ error: "staff_id is required" });
    }

    const numericStaffID = Number(staff_id);

    const arrangementRequests = await ArrangementRequest.find({
      staff_id: numericStaffID,
    }).populate("staff");

    if (arrangementRequests.length === 0) {
      return res
        .status(404)
        .json({ message: "No arrangement requests found for this staff" });
    }

    res.status(200).json(arrangementRequests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
