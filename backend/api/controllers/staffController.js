import Staff from "../models/staffModel.js";
import * as responseUtils from "../utils/responseUtils.js";

const REGEX_NUM = /^[0-9]+$/;
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
  const staffId = req.query.staff_id;
  if (!REGEX_NUM.test(staffId)) {
    return responseUtils.handleBadRequest(
      res,
      "Uhh.. staffId is supposed to be numbers(??)"
    );
  }
  try {
    const staff = await getStaffDetails(staffId);
    if (!staff) {
      return responseUtils.handleNotFound(res, "Staff member not found");
    }
    return responseUtils.handleSuccessResponse(res, staff);
  } catch (error) {
    return responseUtils.handleInternalServerError(
      res,
      "Sorry something went wrong in the backend... :("
    );
  }
};

/**
 * Retrieves a distinct list of all departments from the Staff collection.
 *
 * @async
 * @function getAllDepartments
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Returns a success response with an array of departments or an error response in case of failure.
 * @throws {Error} - If an error occurs while retrieving the departments, it handles the internal server error.
 */
export const getAllDepartments = async (req, res) => {
  try {
    const departmentArray = await Staff.distinct("dept");
    return responseUtils.handleSuccessResponse(res, departmentArray);
  } catch (error) {
    return responseUtils.handleInternalServerError(res, error);
  }
};

/**
 * Retrieves a map of staff IDs to their full names based on the specified department.
 *
 * @async
 * @function getStaffIdsByDept
 * @param {string} department - The department to retrieve staff from. Must be a non-null, non-empty string.
 * @returns {Promise<Map<number, string>>} - A promise that resolves to a Map where keys are staff IDs and values are their full names.
 * @throws {Error} - Throws an error if the department is null, empty, or if staff could not be found.
 */
export const getStaffIdsByDept = async (department) => {
  if (!department || department == null || department.trim() === "") {
    throw new Error("Department should be a non null value");
  }
  try {
    const idToNameMap = new Map();
    const staffArray = await Staff.find({ dept: department });
    if (staffArray.length > 0) {
      for (let staff of staffArray) {
        idToNameMap.set(
          staff.staff_id,
          staff.staff_fname + " " + staff.staff_lname
        );
      }
    }
    return idToNameMap;
  } catch (error) {
    throw new Error("Unable to find staff by department given");
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
    const staff = await Staff.findOne({ staff_id: staffId });
    return staff;
  } catch (error) {
    throw error;
  }
};
