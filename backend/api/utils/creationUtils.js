import ArrangementRequest from "../models/arrangementRequestsModel.js";
import { createAuditEntry } from "../controllers/requestAuditController.js";
import { checkIfDatesOverlap } from "../utils/dateChecker.js";

export const REQUEST_STATUS_PENDING = "Pending";
export const REQUEST_STATUS_NONE = "N/A";
export const REQUEST_STATUS_APPROVED = "Approved";

/**
 * Approves arrangement request instantly if staff is CEO.
 * @param {string} staffId - The ID of the staff member.
 * @param {Array<Object>} arrangementRequests - The array of arrangement request objects.
 * @returns {Promise<Array|boolean>} - A promise that resolves to an array of approved requests or false if not the CEO.
 */

export const createNewCEORequests = async (arrangementRequests, staffId, managerId) => {
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
          status: "Approved",
          manager_id: managerId,
          request_time: req.time,
          group_id: req.group_id || null,
          reason: req.reason,
        }))
      );
  
      if (reqArr.length > 0) {
        try {
          await createAuditEntry(
            reqArr,
            staffId,
            REQUEST_STATUS_NONE,
            REQUEST_STATUS_PENDING
          );
        } catch (auditError) {
        };
    };
      
    } catch (error) {
      const msg = error.message.includes("Cannot apply - CEO")
        ? error.message
        : "Failed to create arrangement requests - CEO";
      throw new Error(msg);
    }
  };

/**
 * Creates new arrangement requests if there are no existing requests for the specified slots.
 * @param {Array<Object>} arrangementRequests - The array of arrangement request objects.
 * @param {number} staffId - The ID of the staff member.
 * @param {number} managerId - The ID of the staff member's manager.
 * @returns {Promise<Array|boolean>} - A promise that resolves to an array of created requests or false if requests already exist.
 */
export const createNewRequests = async (arrangementRequests, staffId, managerId) => {
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
        try {
          await createAuditEntry(
            reqArr,
            staffId,
            REQUEST_STATUS_NONE,
            REQUEST_STATUS_PENDING
          );
        } catch (auditError) {
        };
      };
    } catch (error) {
      const msg = error.message.includes("Cannot apply")
        ? error.message
        : "Failed to create arrangement requests";
      throw new Error(msg);
    }
};

/**
 * Check if the staff has more than 2 requests in the same week
 * @param {Array} arrangementRequests - The array of arrangement requests
 * @param {String} staffId - The ID of the staff member
 * @returns {Promise<Set>} - A Set of weeks where the staff has more than 2 requests
 */
export const checkWFHRequestsPerWeek = async (arrangementRequests, staffId) => {
    const weeksWithTooManyRequests = new Set();
  
    for (const request of arrangementRequests) {
      const { weekStart, weekEnd } = getWeekStartAndEnd(request.date);
  
      // Find all WFH requests for the staff in the current week (including the newly created ones)
      const existingRequests = await findExistingRequestsForPendingAndAccepted(staffId, weekStart, weekEnd);
  
      // If more than 2 requests exist, add the start of the week to the Set (to avoid duplicates)
      if (existingRequests.length > 2) {
        weeksWithTooManyRequests.add(weekStart.toDateString()); // Add only the start of the week
      }
    }
  
    return weeksWithTooManyRequests;
};
  
export const findExistingRequestsForPendingAndAccepted = async (staffId, weekStart, weekEnd) => {
    try {
        return await ArrangementRequest.find({
        staff_id: staffId,
        request_date: {
            $gte: weekStart,
            $lte: weekEnd,
        },
        status: { $in: ["Approved", "Pending"] }, // Include "Approved" & "Pending"
        });
        
    } catch (error) {
        console.log(error)
        throw new Error("Failed to fetch existing requests (Ryan's Function)");
    }
};
  
export const getWeekStartAndEnd = (requestDate) => {
    const currentDate = new Date(requestDate);
    const dayOfWeek = currentDate.getUTCDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
    // Calculate the start of the week (assuming Monday as start)
    const weekStart = new Date(currentDate);
    weekStart.setUTCDate(currentDate.getUTCDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Adjust for Monday start
    
    // Calculate the end of the week (Sunday)
    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
  
    // Ensure both dates are set to midnight for correct comparison
    weekStart.setUTCHours(0, 0, 0, 0);
    weekEnd.setUTCHours(23, 59, 59, 999);
  
    return { weekStart, weekEnd };
};

/**
 * Finds existing arrangement requests based on provided filters.
 * @param {Object} filters - The filters to apply.
 * @param {string} [filters.staff_id] - The ID of the staff member.
 * @param {Array<Object>} [filters.requestSlots] - An array of request slots, each containing date and time.
 * @returns {Promise<Array>} - A promise that resolves to an array of existing requests.
 */
export const findExistingRequests = async ({ staff_id, requestSlots }) => {
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

// export const approveIfCEO = async (staffId, arrangementRequests) => {
  //   try {
  //     if (staffId === 140001) { // Should replace this hardcoded value with smth else e.g. position?
  //       // Instantly approve the request if the staff is CEO
  //       const reqArr = await ArrangementRequest.insertMany(
  //         arrangementRequests.map((req) => ({
  //           staff_id: staffId,
  //           request_date: new Date(req.date),
  //           status: "Approved", // Instantly approve
  //           manager_id: staffId, // Use staffId dynamically
  //           request_time: req.time,
  //           group_id: req.group_id || null,
  //           reason: req.reason,
  //         }))
  //       );
  
  //       if (reqArr.length > 0) {
  //         await createAuditEntry(
  //           reqArr,
  //           staffId,
  //           REQUEST_STATUS_NONE,
  //           REQUEST_STATUS_APPROVED
  //         );
  //       }
        
  //       return true; // Return success
  //     }
  //     return false; // Not CEO, no instant approval
  
  //   } catch (error) {
  //     console.error("Error in approving CEO request: ", error);
  //     throw new Error("Failed to approve request for CEO"); // Optional: You can throw a more descriptive error
  //   }
  // };
  