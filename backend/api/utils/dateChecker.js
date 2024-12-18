/**
 * Check the validity of a list of dates based on several business rules.
 * @param {string[]} dates - Array of date strings (e.g., '2024-09-28').
 * @returns {Object} - An object containing the validity status and the details of each date.
 *                     { isValid: boolean, invalidDates: Array<Object> }
 */
export const checkDatesValidity = (dates) => {
  const today = normalizeDate(new Date());
  const results = dates.map((dateStr) => {
    const date = normalizeDate(new Date(dateStr));

    if (isWeekend(date)) {
      return {
        date: dateStr,
        isValid: false,
        reason: "Cannot apply for weekend dates",
      };
    }

    if (isDateInPast(today, date)) {
      return {
        date: dateStr,
        isValid: false,
        reason: "Cannot apply for a date that has passed",
      };
    }

    if (isToday(today, date)) {
      return {
        date: dateStr,
        isValid: false,
        reason: "Cannot apply for today",
      };
    }

    if (isNextDay(today, date)) {
      return {
        date: dateStr,
        isValid: false,
        reason: "Cannot apply for tomorrow",
      };
    }

    if (isFollowingMondayAfterFriday(today, date)) {
      return {
        date: dateStr,
        isValid: false,
        reason: "Cannot apply for the following Monday on a Friday or Weekend",
      };
    }

    return { date: dateStr, isValid: true };
  });

  const invalidDates = results.filter((result) => !result.isValid);

  return {
    isValid: invalidDates.length === 0, // True if no invalid dates
    invalidDates, // Array of invalid dates with reasons
  };
};

/**
 * Normalize a date by setting the time to midnight to compare only the date.
 * @param {Date} date - The date to normalize.
 * @returns {Date} - A new date object with the time set to midnight.
 */
const normalizeDate = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

/**
 * Check if the date has passed.
 * @param {Date} today - The current date (normalized).
 * @param {Date} date - The date to check.
 * @returns {boolean} - True if the date is in the past, false otherwise.
 */
const isDateInPast = (today, date) => {
  return date < today;
};

/**
 * Check if the date is today.
 * @param {Date} today - The current date (normalized).
 * @param {Date} date - The date to check.
 * @returns {boolean} - True if the date is today, false otherwise.
 */
const isToday = (today, date) => {
  return today.getTime() === date.getTime();
};

/**
 * Check if the date is tomorrow.
 * @param {Date} today - The current date (normalized).
 * @param {Date} date - The date to check.
 * @returns {boolean} - True if the date is tomorrow, false otherwise.
 */
const isNextDay = (today, date) => {
  today = normalizeDate(today);
  date = normalizeDate(date);

  const timeDiff = date - today;
  const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
  return daysDiff === 1;
};

/**
 * Check if the date falls on a weekend (Saturday or Sunday).
 * @param {Date} date - The date to check.
 * @returns {boolean} - True if the date is a weekend, false otherwise.
 */
const isWeekend = (date) => {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 6 || dayOfWeek === 0;
};

/**
 * Check if today is Friday or Weekend and the date is the following Monday.
 * @param {Date} today - The current date (normalized).
 * @param {Date} date - The date to check.
 * @returns {boolean} - True if today is Friday and the date is the following Monday, false otherwise.
 */
const isFollowingMondayAfterFriday = (today, date) => {
  today = normalizeDate(today)
  date = normalizeDate(date)

  const todayDay = today.getDay()
  const timeDiff = date - today
  const daysDiff = timeDiff / (1000 * 60 * 60 * 24)
  return (todayDay >= 5) && daysDiff <= 3 && date.getDay() === 1
}

/**
 * Checks if the provided arrangement requests overlap with existing requests for the same dates.
 * Throws an error if any new requests conflict with existing requests based on predefined rules:
 * - A "Full Day" request cannot coexist with any other requests on the same date.
 * - An "AM" request cannot coexist with another "AM" or a "Full Day" request on the same date.
 * - A "PM" request cannot coexist with another "PM" or a "Full Day" request on the same date.
 *
 * @param {Array<Object>} existingRequests - An array of existing arrangement request objects.
 * @param {Array<Object>} arrangementRequests - An array of new arrangement request objects to validate.
 * @throws {Error} Throws an error if any of the new requests conflict with existing requests.
 */
export const checkIfDatesOverlap = (existingRequests, arrangementRequests) => {
  const existingRequestsMap = new Map();
  existingRequests.forEach((existing) => {
    const dateStr = existing.request_date.toDateString();
    if (!existingRequestsMap.has(dateStr)) {
      existingRequestsMap.set(dateStr, new Set());
    }
    existingRequestsMap.get(dateStr).add(existing.request_time);
  });

  for (const req of arrangementRequests) {
    const dateStr = new Date(req.date).toDateString();
    const requestTime = req.time;

    if (existingRequestsMap.has(dateStr)) {
      const existingTimes = existingRequestsMap.get(dateStr);

      if (
        requestTime === "Full Day" &&
        (existingTimes.has("AM") ||
          existingTimes.has("PM") ||
          existingTimes.has("Full Day"))
      ) {
        throw new Error(
          "Cannot apply for a Full Day request when a requests exist for the same date!"
        );
      }

      if (
        requestTime === "AM" &&
        (existingTimes.has("AM") || existingTimes.has("Full Day"))
      ) {
        throw new Error(
          "Cannot apply for AM request when a Full Day or AM request exists for the same date!"
        );
      }
      if (
        requestTime === "PM" &&
        (existingTimes.has("Full Day") || existingTimes.has("PM"))
      ) {
        throw new Error(
          "Cannot apply for AM/PM request when a Full Day request exists for the same date!"
        );
      }
    }
  }
};
