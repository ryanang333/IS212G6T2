import {
  getStaff,
  getStaffIdsByDept,
  getStaffDetails,
} from "../../../../api/controllers/staffController.js";
import Staff from "../../../../api/models/staffModel.js";
import httpMocks from "node-mocks-http";
import {
  mockStaff,
  mockStaffByDept,
} from "../../../mock/testHelper.js";
jest.mock("../../../../api/models/staffModel.js");

describe("Staff Controller Unit Tests", () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
  });

  afterEach(() => {
    jest.resetAllMocks();
  })

  describe("getStaff", () => {
    test("should return 400 if staff_id is not numeric", async () => {
      req.query.staff_id = "ABC123";
      await getStaff(req, res);
      expect(res.statusCode).toBe(400);
    });

    test("should return 404 if staff member not found", async () => {
      req.query.staff_id = "123";
      Staff.findOne.mockResolvedValue(null);
      await getStaff(req, res);
      expect(res.statusCode).toBe(404);
    });

    test("should return 200 with staff data if staff member is found", async () => {
      req.query.staff_id = "140001";
      Staff.findOne.mockResolvedValue(mockStaff);
      await getStaff(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().data.staff_id).toEqual(mockStaff.staff_id);
    });

    test("should return 500 if an error occurs", async () => {
      req.query.staff_id = "140001";
      Staff.findOne.mockRejectedValue(new Error("Database error"));
      await getStaff(req, res);
      expect(res.statusCode).toBe(500);
    });
  });

  describe("getStaffIdsByDept", () => {
    test("should throw an error if department is null or empty", async () => {
      await expect(getStaffIdsByDept(null)).rejects.toThrow(
        "Department should be a non null value"
      );
      await expect(getStaffIdsByDept("")).rejects.toThrow(
        "Department should be a non null value"
      );
    });

    test("should return an empty map if no staff found in department", async () => {
      Staff.find.mockResolvedValue([]);
      const result = await getStaffIdsByDept("Sales");
      expect(result.size).toBe(0);
    });

    test("should return a map with staff IDs and names if staff are found", async () => {
      Staff.find.mockResolvedValue(mockStaffByDept);
      const result = await getStaffIdsByDept("Sales");
      expect(result.size).toBe(10);
      expect(result).toEqual(
        new Map([
          [140903, "Amara Singh"],
          [140904, "Srey Mao"],
          [140905, "Phuc Le"],
          [140908, "Arifin Saputra"],
          [140909, "Siti Salleh"],
          [140944, "Yee Lim"],
          [140923, "Ngoc Trinh"],
          [140924, "Manoj Kumar"],
          [140925, "Anh Pham"],
          [140926, "Somsak Somsri"],
        ])
      );
    });

    test("should throw an error if an issue occurs while retrieving staff", async () => {
      Staff.find.mockRejectedValue(new Error("Database error"));
      await expect(getStaffIdsByDept("Sales")).rejects.toThrow(
        "Unable to find staff by department given"
      );
    });
  });

  describe("getStaffDetails", () => {
    test("should return the staff details if staff is found", async () => {
      Staff.findOne.mockResolvedValue(mockStaff);
      const result = await getStaffDetails("140001");
      expect(result).toEqual(mockStaff);
    });

    test("should return null if no staff is found", async () => {
      Staff.findOne.mockResolvedValue(null);
      const result = await getStaffDetails("123");
      expect(result).toBeNull();
    });

    test("should throw an error if an issue occurs while fetching staff details", async () => {
      Staff.findOne.mockRejectedValue(new Error("Database error"));
      await expect(getStaffDetails("123")).rejects.toThrow("Database error");
    });
  });
});
