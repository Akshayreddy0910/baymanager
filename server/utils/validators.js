
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

export const VALID_BOOKING_STATUSES = ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];

export const VALID_JOB_STATUSES = ['Open', 'In Progress', 'Completed'];

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidRegistrationNumber = (regNo) => {
  const regRegex = /^[A-Z0-9\-]{3,15}$/;
  return regRegex.test(regNo.toUpperCase().trim());
};

export const isValidVehicleYear = (year) => {
  const num = Number(year);
  const currentYear = new Date().getFullYear();
  return Number.isInteger(num) && num >= 1900 && num <= currentYear + 1;
};

export const isDateInFuture = (date) => {
  const bookingDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return bookingDate >= today;
};

export const isValidCost = (value) => {
  const num = Number(value);
  return !isNaN(num) && num >= 0;
};

export const isValidObjectId = (id) => {
  return /^[a-fA-F0-9]{24}$/.test(id);
};
