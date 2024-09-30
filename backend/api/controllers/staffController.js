import Staff from "../models/staffModel.js";
import * as responseUtils from '../utils/responseUtils.js';
/**
 * Get staff details by staff ID.
 *
 * @param {Object} req - Express request object.
 * @param {Object} req.params - Request parameters.
 * @param {string} req.params.staff_id - The ID of the staff member to retrieve.
 * @param {Object} res - Express response object.
 *
 * @returns {Promise<void>} - Sends the staff member data in JSON format if found, otherwise sends an error message.
 */
export const getStaff = async (req, res) => {
  try {
    const staff = await getStaffDetails(req.query.staff_id);
    if (!staff) {
      return responseUtils.handleNotFound(res, "Staff member not found");
    }
    return responseUtils.handleSuccessResponse(res, staff);
  } catch (error) {
    return responseUtils.handleInternalServerError(res, 'Sorry something went wrong in the backend... :(');
  }
};

/**
 * Retrieve staff details by staff ID.
 *
 * @param {string} staffId - The ID of the staff member to retrieve.
 *
 * @returns {Promise<Object|null>} - Returns the staff member object if found, or null if not found.
 *
 * @throws {Error} - Throws an error if a problem occurs while fetching the staff details.
 */
export const getStaffDetails = async (staffId) => {
  try {
    const staff = await Staff.findOne({ staff_id: staffId })
      .populate("manager")
      .populate("subordinates");
    return staff;
  } catch (error) {
    console.error("Error fetching staff details:", error);
    throw error;
  }
};
