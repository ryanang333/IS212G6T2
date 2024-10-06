import {
  handleSuccessResponse,
  handleCreatedResponse,
  handleNoContentResponse,
  handleBadRequest,
  handleUnauthorized,
  handleForbidden,
  handleNotFound,
  handleConflict,
  handleUnprocessableEntity,
  handleInternalServerError,
  handleServiceUnavailable,
} from "../../../api/utils/responseUtils.js"; 
import httpMocks from "node-mocks-http";

describe("Response Utility Functions", () => {
  let res;

  beforeEach(() => {
    res = httpMocks.createResponse();
  });

  test("handleSuccessResponse should return 200 with success message and data", () => {
    const data = { id: 1, name: "Test" };
    const message = "Operation successful";

    handleSuccessResponse(res, data, message);

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({ message, data });
  });

  test("handleCreatedResponse should return 201 with resource created message and data", () => {
    const data = { id: 1, name: "Test" };
    const msg = "Resource created successfully";

    handleCreatedResponse(res, data, msg);

    expect(res.statusCode).toBe(201);
    expect(JSON.parse(res._getData())).toEqual({ message: msg, data });
  });

  test("handleNoContentResponse should return 204 with no content", () => {
    handleNoContentResponse(res);

    expect(res.statusCode).toBe(204);
    expect(res._getData()).toBe(""); 
  });

  test("handleBadRequest should return 400 with bad request message", () => {
    const message = "Bad request";

    handleBadRequest(res, message);

    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ message });
  });

  test("handleUnauthorized should return 401 with unauthorized message", () => {
    const message = "Unauthorized";

    handleUnauthorized(res, message);

    expect(res.statusCode).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({ message });
  });

  test("handleForbidden should return 403 with forbidden message", () => {
    const message = "Forbidden";

    handleForbidden(res, message);

    expect(res.statusCode).toBe(403);
    expect(JSON.parse(res._getData())).toEqual({ message });
  });

  test("handleNotFound should return 404 with not found message", () => {
    const message = "Not found";

    handleNotFound(res, message);

    expect(res.statusCode).toBe(404);
    expect(JSON.parse(res._getData())).toEqual({ message });
  });

  test("handleConflict should return 409 with conflict message", () => {
    const message = "Conflict";

    handleConflict(res, message);

    expect(res.statusCode).toBe(409);
    expect(JSON.parse(res._getData())).toEqual({ message });
  });

  test("handleUnprocessableEntity should return 422 with unprocessable entity message", () => {
    const message = "Unprocessable entity";

    handleUnprocessableEntity(res, message);

    expect(res.statusCode).toBe(422);
    expect(JSON.parse(res._getData())).toEqual({ message });
  });

  test("handleInternalServerError should return 500 with internal server error message", () => {
    const message = "Internal server error";

    handleInternalServerError(res, message);

    expect(res.statusCode).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({ message });
  });

  test("handleServiceUnavailable should return 503 with service unavailable message", () => {
    const message = "Service unavailable";

    handleServiceUnavailable(res, message);

    expect(res.statusCode).toBe(503);
    expect(JSON.parse(res._getData())).toEqual({ message });
  });
});
