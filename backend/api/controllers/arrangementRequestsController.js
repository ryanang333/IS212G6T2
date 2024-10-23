import ArrangementRequest from "../models/arrangementRequestsModel.js";
import { getStaffDetails, getStaffIdsByDept } from "./staffController.js";
import { createAuditEntry } from "./requestAuditController.js";
import {
  checkDatesValidity,
  checkIfDatesOverlap,
} from "../utils/dateChecker.js";
import * as responseUtils from "../utils/responseUtils.js";
import { v4 as uuidv4 } from "uuid"; // Used to generate group_id

import {
  createNewCEORequests,
  createNewRequests,
  checkWFHRequestsPerWeek,
} from "../utils/creationUtils.js";
export const REQUEST_STATUS_PENDING = "Pending";
export const REQUEST_STATUS_NONE = "N/A";
export const REQUEST_STATUS_APPROVED = "Approved";
export const REQUEST_STATUS_REJECTED = "Rejected";
export const REQUEST_STATUS_CANCELLED = "Cancelled";
export const REQUEST_STATUS_PENDING_WITHDRAWAL = "Pending Withdrawal";
export const REQUEST_STATUS_WITHDRAWN = "Withdrawn";


/**
 * Creates temporary arrangement requests for a staff member.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the response has been sent.
 */
export const createTempArrangementRequests = async (req, res) => {
  try {
    const { staffId, arrangementRequests } = req.body;
    console.log(arrangementRequests);

    // Function 1 - Check Date
    const validationResponse = checkDatesValidity(arrangementRequests);
    if (!validationResponse.isValid) {
      return responseUtils.handleBadRequest(
        res,
        "Arrangement request dates are invalid!"
      );
    }
    console.log(validationResponse);

    // Function 2 - Get Staff Details
    const staff = await getStaffDetails(staffId);
    if (!staff) {
      return responseUtils.handleNotFound(res, "Staff does not exist!");
    }
    console.log(staff);

    // Function 3 - CEO?
    if (staff.position === "MD") {
      await createNewCEORequests(
        arrangementRequests,
        staffId,
        staff.reporting_manager
      );
      return responseUtils.handleCreatedResponse(
        res,
        true,
        "Request(s) have been instantly approved for CEO!"
      );
    }
    console.log(staff.position);

    // Function 4 - Not CEO!
    const createdRequests = await createNewRequests(
      arrangementRequests,
      staff.staff_id,
      staff.reporting_manager
    );
    console.log(createdRequests);

    // Function 5 - More Than 2 WFH?
    const weeksWithTooManyRequests = await checkWFHRequestsPerWeek(
      arrangementRequests,
      staffId
    );
    let alertMessage = "Request created successfully!";
    if (weeksWithTooManyRequests.size > 0) {
      alertMessage = `Notice! You have more than 2 requests in the week(s) of [${[
        ...weeksWithTooManyRequests,
      ].join(", ")}]. Request will be processed and manager will be notified.`;
    }

    // Done!
    return responseUtils.handleCreatedResponse(
      res,
      createdRequests,
      alertMessage
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

    // Create an array to hold all the clean arrangement requests
    const allArrangementRequestsClean = [];

    // Loop through each arrangement request
    for (const arrangementRequestDirty of arrangementRequests) {
      // Generate a unique group ID for each arrangement request
      const groupID = uuidv4();

      // Convert the recurring weeks into individual dates for each arrangement request
      const startDate = new Date(arrangementRequestDirty.startDate);
      const recurringInterval = parseInt(
        arrangementRequestDirty.recurringInterval.replace("week", ""),
        10
      ); // Get the interval in weeks
      const numEvents = arrangementRequestDirty.numEvents;
      const arrangementRequestsClean = [];

      // Generate individual requests based on the number of events
      for (let i = 0; i < numEvents; i++) {
        const requestDate = new Date(startDate);
        requestDate.setDate(requestDate.getDate() + i * recurringInterval * 7);

        arrangementRequestsClean.push({
          ...arrangementRequestDirty, // Spread existing properties
          date: requestDate, // Override the date
          group_id: groupID, // Add a unique group ID for this request
        });
      }

      // Add the cleaned requests for this arrangement request to the main array
      allArrangementRequestsClean.push(...arrangementRequestsClean);
    }

    // Check dates for all requests
    const validationResponse = checkDatesValidity(allArrangementRequestsClean);
    if (!validationResponse.isValid) {
      return responseUtils.handleBadRequest(
        res,
        "Arrangement request dates are invalid!"
      );
    }
    // Function 2 - Get Staff Details
    const staff = await getStaffDetails(staffId);
    if (!staff) {
      return responseUtils.handleNotFound(res, "Staff does not exist!");
    }
    console.log(staff);

    // Function 3 - CEO?
    if (staff.position === "MD") {
      await createNewCEORequests(
        allArrangementRequestsClean,
        staffId,
        staff.reporting_manager
      );
      return responseUtils.handleCreatedResponse(
        res,
        true,
        "Request(s) have been instantly approved for CEO!"
      );
    }
    // Function 4 - Not CEO!
    const createdRequests = await createNewRequests(
      allArrangementRequestsClean,
      staff.staff_id,
      staff.reporting_manager
    );
    console.log(createdRequests);

    // Function 5 - More Than 2 WFH?
    const weeksWithTooManyRequests = await checkWFHRequestsPerWeek(
      allArrangementRequestsClean,
      staffId
    );
    let alertMessage = "Request created successfully!";
    if (weeksWithTooManyRequests.size > 0) {
      alertMessage = `Notice! You have more than 2 requests in the week(s) of [${[
        ...weeksWithTooManyRequests,
      ].join(", ")}]. Request will be processed and manager will be notified.`;
    }

    // Return the response with the appropriate alert message
    return responseUtils.handleCreatedResponse(
      res,
      createdRequests,
      alertMessage
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
 * Fetches arrangement requests for a specific manager.
 *
 * This function retrieves the arrangement requests for the provided manager ID,
 * and fetches staff details via a lookup operation. It filters for requests
 * with statuses: "Pending", "Approved", and "Pending Withdrawal".
 *
 * @param {Object} req - Express request object.
 * @param {Object} req.query - Query parameters from the request.
 * @param {string} req.query.manager_id - Manager ID to filter arrangement requests.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Sends a JSON response with fetched arrangement requests
 * or an error message if a failure occurs.
 * @throws {Error} - If an error occurs during database aggregation.
 */
export const getArrangementRequests = async (req, res) => {
  try {
    const { manager_id } = req.query;

    if (!manager_id) {
      return responseUtils.handleBadRequest(res, "The managerID is required");
    }

    const numericManagerId = Number(manager_id);

    const arrangementRequests = await ArrangementRequest.aggregate([
      {
        $match: {
          manager_id: numericManagerId,
          status: { $in: ["Pending", "Approved", "Pending Withdrawal"] },
        },
      },
      {
        $lookup: {
          from: "staff",
          localField: "staff_id",
          foreignField: "staff_id",
          as: "staffDetails",
        },
      },
      {
        $unwind: {
          path: "$staffDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          staff_name: {
            $concat: [
              { $ifNull: ["$staffDetails.staff_fname", ""] },
              " ",
              { $ifNull: ["$staffDetails.staff_lname", ""] },
            ],
          },
          position: { $ifNull: ["$staffDetails.position", ""] },
        },
      },
      {
        $project: {
          _id: 1,
          staff_id: 1,
          staff_name: 1,
          status: 1,
          request_date: 1,
          group_id: 1,
          request_time: 1,
          reason: 1,
          rejection_reason: 1,
          withdraw_reason: 1,
          manager_reason: 1,
          __v: 1,
          manager_id: 1,
          position: 1,
        },
      },
    ]);

    return responseUtils.handleSuccessResponse(
      res,
      arrangementRequests,
      "Requests fetched successfully!"
    );
  } catch (error) {
    return responseUtils.handleInternalServerError(res, error.message);
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

    return responseUtils.handleSuccessResponse(
      res,
      arrangementRequests,
      "Staff requests fetched successfully!"
    );
  } catch (error) {
    return responseUtils.handleInternalServerError(res, error.message);
  }
};

/**
 * Extracts the IDs of requests that have a specific status.
 *
 * This function filters the provided array of request objects to include only those
 * that match the given status, and then maps the filtered requests to return their IDs.
 *
 * @param {Array<Object>} reqArray - An array of request objects, each containing an `_id` and `status`.
 * @param {string} status - The status to filter the requests by.
 *
 * @returns {Array<string>} An array of IDs of the requests that match the specified status.
 */
export const extractIdsWithStatus = (reqArray, status) => {
  return reqArray.filter((req) => req.status == status).map((req) => req._id);
};

/**
 * Approves pending staff requests.
 *
 * This function takes a list of requests from the request body, checks if they are valid
 * and have a "Pending" status, and then updates their status to "Approved". It responds with
 * appropriate messages based on the outcome.
 *
 * @async
 * @function approveStaffRequests
 * @param {Object} req - The request object, containing the requests in the body.
 * @param {Object} req.body - The body of the request.
 * @param {Array} req.body.requests - An array of request objects.
 * @param {Object} res - The response object, used to send responses to the client.
 * @returns {Promise<void>} - Sends a response indicating success or failure of the operation.
 * @throws {Error} - If there's an internal server error while processing the requests.
 */
export const approveStaffRequests = async (req, res) => {
  const { requests } = req.body;

  if (!Array.isArray(requests) || requests.length === 0) {
    return responseUtils.handleBadRequest(
      res,
      "Please provide valid requests to approve"
    );
  }
  const cleanedRequestsId = extractIdsWithStatus(requests, "Pending");

  if (cleanedRequestsId.length == 0) {
    return responseUtils.handleBadRequest(
      res,
      "Please provide at least one pending request to approve"
    );
  }

  try {
    const previousRequests = await ArrangementRequest.find({
      _id: { $in: cleanedRequestsId },
    });

    const updatedRequests = await ArrangementRequest.updateMany(
      { _id: { $in: cleanedRequestsId } },
      {
        status: "Approved",
      }
    );
    console.log("this is previousRequests",previousRequests);
    console.log("this is previousRequests.status",previousRequests.status);
    if (updatedRequests.modifiedCount > 0) {
      for (const request of requests) {
        await createAuditEntry(
          previousRequests,
          request.manager_id,
          REQUEST_STATUS_PENDING,
          REQUEST_STATUS_APPROVED
        );
      };
    }

    return responseUtils.handleSuccessResponse(
      res,
      null,
      "Requests have been approved successfully!"
    );
  } catch (error) {
    return responseUtils.handleInternalServerError(
      res,
      "Internal server error"
    );
  }
};

/**
 * Rejects a list of staff arrangement requests by updating their status to "Rejected" and recording the manager's reason.
 *
 * @async
 * @function rejectStaffRequests
 * @param {Object} req - Express request object containing the request data.
 * @param {Array} req.body.requests - An array of arrangement requests to be rejected.
 * @param {string} req.body.reason - The reason provided by the manager for the rejection.
 * @param {Object} res - Express response object used to send the response back to the client.
 * @returns {Promise<void>} A promise that resolves when the rejection process is completed.
 * @throws {Error} Sends an appropriate HTTP response in case of validation failures or server errors.
 */
export const rejectStaffRequests = async (req, res) => {
  const { requests, reason } = req.body;

  if (!Array.isArray(requests) || requests.length === 0) {
    return responseUtils.handleBadRequest(
      res,
      "Please provide valid requests to reject"
    );
  }

  if (!reason || reason.trim() == "") {
    return responseUtils.handleBadRequest(
      res,
      "Please provide a reason for rejection"
    );
  }

  const cleanedRequestsId = extractIdsWithStatus(requests, "Pending");

  if (cleanedRequestsId.length == 0) {
    return responseUtils.handleBadRequest(
      res,
      "Please provide at least one pending request to reject"
    );
  }

  try {
    const previousRequests = await ArrangementRequest.find({
      _id: { $in: cleanedRequestsId },
    });

    const updatedRequests = await ArrangementRequest.updateMany(
      { _id: { $in: cleanedRequestsId } },
      {
        status: "Rejected",
        manager_reason: reason,
      }
    );

    if (updatedRequests.modifiedCount > 0) {
      for (const request of requests) {
        await createAuditEntry(
          previousRequests,
          request.manager_id,
          REQUEST_STATUS_PENDING,
          REQUEST_STATUS_REJECTED
        );
      };
    }

    return responseUtils.handleSuccessResponse(
      res,
      null,
      "Requests have been rejected successfully!"
    );
  } catch (error) {
    return responseUtils.handleInternalServerError(
      res,
      "Internal server error"
    );
  }
};

/**
 * Cancels staff arrangement requests based on request IDs provided in the request body.
 *
 * This function expects an array of request objects in the request body,
 * each containing an ID and a status. It filters out the IDs of requests
 * with a "Pending" status, and updates their status to "Cancelled".
 *
 * @async
 * @function cancelStaffRequests
 * @param {Object} req - Express request object.
 * @param {Object} req.body - Request body.
 * @param {Array} req.body.requests - Array of requests to be canceled.
 * @param {string} req.body.requests[].id - ID of the request.
 * @param {string} req.body.requests[].status - Status of the request.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} Sends a success or error response depending on the outcome.
 * @throws Will return an internal server error response if the database operation fails.
 */
export const cancelStaffRequests = async (req, res) => {
  const { requests } = req.body;

  if (!Array.isArray(requests) || requests.length === 0) {
    return responseUtils.handleBadRequest(
      res,
      "Please provide valid requests to cancel"
    );
  }
  const cleanedRequestsId = extractIdsWithStatus(requests, "Pending");

  if (cleanedRequestsId.length == 0) {
    return responseUtils.handleBadRequest(
      res,
      "Please provide at least one pending request to cancel"
    );
  }

  try {
    const previousRequests = await ArrangementRequest.find({
      _id: { $in: cleanedRequestsId },
    });

    const updatedRequests = await ArrangementRequest.updateMany(
      { _id: { $in: cleanedRequestsId } },
      {
        status: "Cancelled",
      }
    );

    if (updatedRequests.modifiedCount > 0) {
      for (const request of requests) {
        await createAuditEntry(
          previousRequests,
          request.staff_id,
          REQUEST_STATUS_PENDING,
          REQUEST_STATUS_CANCELLED
        );
      };
    }

    return responseUtils.handleSuccessResponse(
      res,
      null,
      "Requests have been cancelled successfully!"
    );
  } catch (error) {
    return responseUtils.handleInternalServerError(
      res,
      "Internal server error"
    );
  }
};

export const ApproveWithdrawalRequest = async (req, res) => {
  const { requests } = req.body;

  if (!Array.isArray(requests) || requests.length === 0) {
    return responseUtils.handleBadRequest(
      res,
      "Please provide valid requests to approve"
    );
  }
  const cleanedRequestsId = extractIdsWithStatus(requests, "Pending Withdrawal");

  if (cleanedRequestsId.length == 0){
    return responseUtils.handleBadRequest(res, "Please provide at least one pending withdrawal request to approve");
  }

  try {
    const previousRequests = await ArrangementRequest.find({
      _id: { $in: cleanedRequestsId },
    });

    const updatedRequests = await ArrangementRequest.updateMany(
      { _id: { $in: cleanedRequestsId } },
      {
        status: "Withdrawn",
      }
    );

    if (updatedRequests.modifiedCount > 0) {
      for (const request of requests) {
        await createAuditEntry(
          previousRequests,
          request.manager_id,
          REQUEST_STATUS_PENDING_WITHDRAWAL,
          REQUEST_STATUS_APPROVED
        );
      };
    }
    return responseUtils.handleSuccessResponse(
      res,
      null,
      "Withdrawal requests have been approved!"
    );
  } catch (error) {
    return responseUtils.handleInternalServerError(
      res,
      "Internal server error"
    );
  }
};

export const RejectWithdrawalRequest = async (req, res) => {
  const { requests } = req.body;

  if (!Array.isArray(requests) || requests.length === 0) {
    return responseUtils.handleBadRequest(
      res,
      "Please provide valid requests to reject"
    );
  }
  const cleanedRequestsId = extractIdsWithStatus(requests, "Pending Withdrawal");

  if (cleanedRequestsId.length == 0){
    return responseUtils.handleBadRequest(res, "Please provide at least one pending withdrawal request to reject");
  }

  try {
    const previousRequests = await ArrangementRequest.find({
      _id: { $in: cleanedRequestsId },
    });

    const updatedRequests = await ArrangementRequest.updateMany(
      { _id: { $in: cleanedRequestsId } },
      {
        status: "Approved",
      }
    );

    if (updatedRequests.modifiedCount > 0) {
      for (const request of requests) {
        await createAuditEntry(
          previousRequests,
          request.manager_id,
          REQUEST_STATUS_PENDING_WITHDRAWAL,
          REQUEST_STATUS_REJECTED
        );
      };
    }

    return responseUtils.handleSuccessResponse(
      res,
      null,
      "Requests have been rejected!"
    );
  } catch (error) {
    return responseUtils.handleInternalServerError(
      res,
      "Internal server error"
    );
  }
};

/**
 * Withdraws staff requests and updates their status to "Pending Withdrawal".
 *
 * This asynchronous function processes a withdrawal request for multiple arrangement requests.
 * It validates the input, extracts approved request IDs, and updates their status
 * in the database along with a withdrawal reason.
 *
 * @param {Object} req - The request object from the client, containing the body with requests and reason.
 * @param {Array<Object>} req.body.requests - An array of request objects to be withdrawn.
 * @param {string} req.body.reason - The reason for the withdrawal.
 * @param {Object} res - The response object to send the result back to the client.
 *
 * @returns {Promise<void>} A promise that resolves when the response is sent back to the client.
 */
export const withdrawStaffRequests = async (req, res) => {
  const { requests, reason } = req.body;

  if (!Array.isArray(requests) || requests.length === 0) {
    return responseUtils.handleBadRequest(
      res,
      "Please provide valid requests to withdraw"
    );
  }
  if (!reason || reason.trim() === "") {
    return responseUtils.handleBadRequest(
      res,
      "Please provide a valid reason to withdraw"
    );
  }
  const cleanedRequestsId = extractIdsWithStatus(requests, "Approved");

  if (cleanedRequestsId.length == 0) {
    return responseUtils.handleBadRequest(
      res,
      "Please provide at least one pending request to cancel"
    );
  }

  try {
    const previousRequests = await ArrangementRequest.find({
      _id: { $in: cleanedRequestsId },
    });

    const updatedRequests = await ArrangementRequest.updateMany(
      { _id: { $in: cleanedRequestsId } },
      {
        status: "Pending Withdrawal",
        withdraw_reason: reason,
      }
    );

    if (updatedRequests.modifiedCount > 0) {
      for (const request of requests) {
        await createAuditEntry(
          previousRequests,
          request.staff_id,
          REQUEST_STATUS_APPROVED,
          REQUEST_STATUS_PENDING_WITHDRAWAL
        );
      };
    }

    return responseUtils.handleSuccessResponse(
      res,
      null,
      "Requests have been withdrawed, pending manager approval"
    );
  } catch (error) {
    return responseUtils.handleInternalServerError(
      res,
      "Internal server error"
    );
  }
};

export const withdrawRequestsAsManager = async (req, res) => {
  const { requests, reason } = req.body;

  if (!Array.isArray(requests) || requests.length === 0) {
    return responseUtils.handleBadRequest(
      res,
      "Please provide valid requests to withdraw"
    );
  }
  if (!reason || reason.trim() === "") {
    return responseUtils.handleBadRequest(
      res,
      "Please provide a valid reason to withdraw"
    );
  }
  const cleanedRequestsId = extractIdsWithStatus(requests, "Approved");

  if (cleanedRequestsId.length == 0) {
    return responseUtils.handleBadRequest(
      res,
      "Please provide at least one pending request to cancel"
    );
  }

  try {
    const previousRequests = await ArrangementRequest.find({
      _id: { $in: cleanedRequestsId },
    });

    const updatedRequests = await ArrangementRequest.updateMany(
      { _id: { $in: cleanedRequestsId } },
      {
        status: "Withdrawn",
        withdraw_reason: reason,
      }
    );

    if (updatedRequests.modifiedCount > 0) {
      for (const request of requests) {
        await createAuditEntry(
          previousRequests,
          request.manager_id,
          REQUEST_STATUS_APPROVED,
          REQUEST_STATUS_PENDING_WITHDRAWAL
        );
      };
    }

    return responseUtils.handleSuccessResponse(
      res,
      null,
      "Requests have been withdrawn successfully!"
    );
  } catch (error) {
    return responseUtils.handleInternalServerError(
      res,
      "Internal server error"
    );
  }
};

export const updateIndividualRequestStatus = async (req, res) => {
  const { id } = req.params; // Extract the request ID from URL params
  const { status, withdraw_reason, manager_reason } = req.body; // Get the new status from the request body
  if (
    (!withdraw_reason || withdraw_reason.trim() === "") &&
    (!manager_reason || manager_reason.trim() === "")
  ) {
    return res.status(400).json({
      message: "Cancellation reason or manager reason cannot be empty",
    });
  }

  try {
    // Find the arrangement request by its ID and update its status
    const updateFields = {
      status: status,
    };
    if (withdraw_reason) {
      updateFields.withdraw_reason = withdraw_reason; // Add withdraw_reason if provided
    }
    if (manager_reason) {
      updateFields.manager_reason = manager_reason; // Add manager_reason if provided
    }

    const updatedRequest = await ArrangementRequest.findByIdAndUpdate(
      id, // MongoDB ID for the request
      updateFields, // Update the status to 'Pending Withdrawal'
      { new: true } // Return the updated document
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Return the updated request
    res.status(200).json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
