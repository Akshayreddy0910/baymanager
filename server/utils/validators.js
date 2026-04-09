/**
 * Shared validation utilities for BayManager API
 * These helpers keep validation logic DRY and consistent across all controllers.
 */

// Valid service types the system accepts
export const VALID_SERVICE_TYPES = [
  'Oil Change',
  'Tyre Rotation',
  'Wheel Alignment',
  'Brake Inspection',
  'Engine Tune-up',
  'Battery Replacement',
  'AC Service',
  'Full Service',
  'General Inspection',
];

// Valid booking statuses
export const VALID_BOOKING_STATUSES = ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];

// Valid job card statuses
export const VALID_JOB_STATUSES = ['Open', 'In Progress', 'Completed'];

/**
 * Validates an email address format.
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates a vehicle registration number (alphanumeric, 3-15 chars).
 * @param {string} regNo
 * @returns {boolean}
 */
export const isValidRegistrationNumber = (regNo) => {
  const regRegex = /^[A-Z0-9\-]{3,15}$/;
  return regRegex.test(regNo.toUpperCase().trim());
};

/**
 * Validates that a given year is reasonable for a vehicle.
 * @param {number} year
 * @returns {boolean}
 */
export const isValidVehicleYear = (year) => {
  const num = Number(year);
  const currentYear = new Date().getFullYear();
  return Number.isInteger(num) && num >= 1900 && num <= currentYear + 1;
};

/**
 * Validates that a booking date is in the future.
 * @param {string|Date} date
 * @returns {boolean}
 */
export const isDateInFuture = (date) => {
  const bookingDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Compare by day, not exact time
  return bookingDate >= today;
};

/**
 * Validates that a cost value is a non-negative number.
 * @param {any} value
 * @returns {boolean}
 */
export const isValidCost = (value) => {
  const num = Number(value);
  return !isNaN(num) && num >= 0;
};

/**
 * Validates a MongoDB ObjectId format (24 hex chars).
 * @param {string} id
 * @returns {boolean}
 */
export const isValidObjectId = (id) => {
  return /^[a-fA-F0-9]{24}$/.test(id);
};
