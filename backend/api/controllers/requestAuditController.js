import RequestAudit from "../models/requestAuditModel.js";

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
    console.error(error);
    console.error("Failed to create audit logs...");
  }
};
