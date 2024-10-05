import {
  checkDatesValidity,
  checkIfDatesOverlap,
} from "../../api/utils/dateChecker";

describe("checkDatesValidity", () => {
  beforeEach(() => {
    const date = new Date("2024-10-03");
    jest.useFakeTimers().setSystemTime(date);
  });
  afterEach(() => {
    jest.useRealTimers();
  });
  test("should return invalid for date which is tomorrow", () => {
    const result = checkDatesValidity(["2024-10-04"]);
    expect(result.isValid).toEqual(false);
    expect(result.invalidDates.length).toEqual(1);
    expect(result.invalidDates[0].reason).toEqual("Cannot apply for tomorrow");
  });

  test("should return invalid for weekend date", () => {
    const result = checkDatesValidity(["2024-10-05"]);
    expect(result.isValid).toEqual(false);
    expect(result.invalidDates.length).toEqual(1);
    expect(result.invalidDates[0].reason).toEqual(
      "Cannot apply for weekend dates"
    );
  });

  test("should return invalid for past dates", () => {
    const result = checkDatesValidity(["2024-09-30"]);
    expect(result).toEqual({
      isValid: false,
      invalidDates: [
        {
          date: "2024-09-30",
          isValid: false,
          reason: "Cannot apply for a date that has passed",
        },
      ],
    });
  });

  test("should return invalid for today's date", () => {
    const result = checkDatesValidity(["2024-10-03"]);
    expect(result).toEqual({
      isValid: false,
      invalidDates: [
        {
          date: "2024-10-03",
          isValid: false,
          reason: "Cannot apply for today",
        },
      ],
    });
  });

  test("should return invalid for the following Monday after a Friday", () => {
    const date = new Date("2024-10-04");
    jest.useFakeTimers().setSystemTime(date);
    const result = checkDatesValidity(["2024-10-07"]);
    expect(result).toEqual({
      isValid: false,
      invalidDates: [
        {
          date: "2024-10-07",
          isValid: false,
          reason:
            "Cannot apply for the following Monday on a Friday or Weekend",
        },
      ],
    });
  });

  test("should return valid for a future date not violating rules", () => {
    const result = checkDatesValidity(["2024-10-08"]);
    expect(result).toEqual({
      isValid: true,
      invalidDates: [],
    });
  });

  test("should return invalid for multiple invalid dates", () => {
    const result = checkDatesValidity([
      "2024-10-05",
      "2024-09-30",
      "2024-10-04",
    ]);
    expect(result).toEqual({
      isValid: false,
      invalidDates: [
        {
          date: "2024-10-05",
          isValid: false,
          reason: "Cannot apply for weekend dates",
        },
        {
          date: "2024-09-30",
          isValid: false,
          reason: "Cannot apply for a date that has passed",
        },
        {
          date: "2024-10-04",
          isValid: false,
          reason: "Cannot apply for tomorrow",
        },
      ],
    });
  });
});

describe("checkIfDatesOverlap", () => {
  test("should throw an error for overlapping full day requests", () => {
    const existingRequests = [
      { request_date: new Date("2024-10-03"), request_time: "Full Day" },
    ];
    const newRequests = [{ date: "2024-10-03", time: "Full Day" }];

    expect(() => checkIfDatesOverlap(existingRequests, newRequests)).toThrow(
      "Cannot apply for a Full Day request when a requests exist for the same date!"
    );
  });

  test("should throw an error for overlapping AM requests", () => {
    const existingRequests = [
      { request_date: new Date("2024-10-03"), request_time: "Full Day" },
    ];
    const newRequests = [{ date: "2024-10-03", time: "AM" }];

    expect(() => checkIfDatesOverlap(existingRequests, newRequests)).toThrow(
      "Cannot apply for AM request when a Full Day or AM request exists for the same date!"
    );
  });

  test("should throw an error for overlapping PM requests", () => {
    const existingRequests = [
      { request_date: new Date("2024-10-03"), request_time: "Full Day" },
    ];
    const newRequests = [{ date: "2024-10-03", time: "PM" }];

    expect(() => checkIfDatesOverlap(existingRequests, newRequests)).toThrow(
      "Cannot apply for AM/PM request when a Full Day request exists for the same date!"
    );
  });

  test("should not throw an error for non-overlapping requests", () => {
    const existingRequests = [
      { request_date: new Date("2024-10-03"), request_time: "AM" },
    ];
    const newRequests = [{ date: "2024-10-04", time: "Full Day" }];

    expect(() =>
      checkIfDatesOverlap(existingRequests, newRequests)
    ).not.toThrow();
  });

  test("should throw an error for overlapping AM requests on the same day", () => {
    const existingRequests = [
      { request_date: new Date("2024-10-03"), request_time: "AM" },
    ];
    const newRequests = [{ date: "2024-10-03", time: "AM" }];

    expect(() => checkIfDatesOverlap(existingRequests, newRequests)).toThrow(
      "Cannot apply for AM request when a Full Day or AM request exists for the same date!"
    );
  });

  test("should add new date to the map if not already present", () => {
    const existingRequests = [
      { request_date: new Date("2024-10-02"), request_time: "AM" },
    ];
    const newRequests = [{ date: "2024-10-03", time: "Full Day" }];

    expect(() =>
      checkIfDatesOverlap(existingRequests, newRequests)
    ).not.toThrow(); 
  });

  test("should throw an error for overlapping PM request when Full Day exists", () => {
    const existingRequests = [
      { request_date: new Date("2024-10-03"), request_time: "Full Day" },
    ];
    const newRequests = [{ date: "2024-10-03", time: "PM" }]; 

    expect(() => checkIfDatesOverlap(existingRequests, newRequests)).toThrow(
      "Cannot apply for AM/PM request when a Full Day request exists for the same date!"
    );
  });

  test("should throw an error for overlapping PM requests when another PM exists", () => {
    const existingRequests = [
      { request_date: new Date("2024-10-03"), request_time: "PM" },
    ];
    const newRequests = [{ date: "2024-10-03", time: "PM" }]; 

    expect(() => checkIfDatesOverlap(existingRequests, newRequests)).toThrow(
      "Cannot apply for AM/PM request when a Full Day request exists for the same date!"
    );
  });
});
