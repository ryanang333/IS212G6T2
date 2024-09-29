/**
 * Handles a successful response with a 200 status code.
 *
 * @param {Object} res - The response object from the Express framework.
 * @param {Object} data - The data to be sent in the response.
 * @param {string} [message="Success"] - The success message.
 * @returns {Object} The response object with a JSON payload.
 */
export const handleSuccessResponse = (res, data, message = "Success") => {
  return res.status(200).json({ message, data });
};

/**
 * Handles a successful resource creation with a 201 status code.
 *
 * @param {Object} res - The response object from the Express framework.
 * @param {Object} data - The data of the newly created resource.
 * @returns {Object} The response object with a JSON payload.
 */
export const handleCreatedResponse = (res, data, msg = "Resource created successfully") => {
  return res
    .status(201)
    .json({ message: msg, data });
};

/**
 * Handles a response with a 204 status code indicating no content.
 *
 * @param {Object} res - The response object from the Express framework.
 * @returns {Object} The response object with no content.
 */
export const handleNoContentResponse = (res) => {
  return res.status(204).send();
};

/**
 * Handles a bad request response with a 400 status code.
 *
 * @param {Object} res - The response object from the Express framework.
 * @param {string} [message="Bad request"] - The error message.
 * @returns {Object} The response object with a JSON payload.
 */
export const handleBadRequest = (res, message = "Bad request") => {
  return res.status(400).json({ message });
};

/**
 * Handles an unauthorized response with a 401 status code.
 *
 * @param {Object} res - The response object from the Express framework.
 * @param {string} [message="Unauthorized"] - The error message.
 * @returns {Object} The response object with a JSON payload.
 */
export const handleUnauthorized = (res, message = "Unauthorized") => {
  return res.status(401).json({ message });
};

/**
 * Handles a forbidden response with a 403 status code.
 *
 * @param {Object} res - The response object from the Express framework.
 * @param {string} [message="Forbidden"] - The error message.
 * @returns {Object} The response object with a JSON payload.
 */
export const handleForbidden = (res, message = "Forbidden") => {
  return res.status(403).json({ message });
};

/**
 * Handles a not found response with a 404 status code.
 *
 * @param {Object} res - The response object from the Express framework.
 * @param {string} [message="Not found"] - The error message.
 * @returns {Object} The response object with a JSON payload.
 */
export const handleNotFound = (res, message = "Not found") => {
  return res.status(404).json({ message });
};

/**
 * Handles a conflict response with a 409 status code.
 *
 * @param {Object} res - The response object from the Express framework.
 * @param {string} [message="Conflict"] - The error message.
 * @returns {Object} The response object with a JSON payload.
 */
export const handleConflict = (res, message = "Conflict") => {
  return res.status(409).json({ message });
};

/**
 * Handles an unprocessable entity response with a 422 status code.
 *
 * @param {Object} res - The response object from the Express framework.
 * @param {string} [message="Unprocessable entity"] - The error message.
 * @returns {Object} The response object with a JSON payload.
 */
export const handleUnprocessableEntity = (
  res,
  message = "Unprocessable entity"
) => {
  return res.status(422).json({ message });
};

/**
 * Handles an internal server error response with a 500 status code.
 *
 * @param {Object} res - The response object from the Express framework.
 * @param {string} [message="Internal server error"] - The error message.
 * @returns {Object} The response object with a JSON payload.
 */
export const handleInternalServerError = (
  res,
  message = "Internal server error"
) => {
  return res.status(500).json({ message });
};

/**
 * Handles a service unavailable response with a 503 status code.
 *
 * @param {Object} res - The response object from the Express framework.
 * @param {string} [message="Service unavailable"] - The error message.
 * @returns {Object} The response object with a JSON payload.
 */
export const handleServiceUnavailable = (
  res,
  message = "Service unavailable"
) => {
  return res.status(503).json({ message });
};
