import api from './api.js';

// Service to handle all booking-related API calls
export const getAllBookings = async () => {
  // Global list for administrators
  const response = await api.get('/bookings');
  return response.data;
};

export const getMyBookings = async () => {
  // Specific list for the logged-in customer
  const response = await api.get('/bookings/my');
  return response.data;
};

export const createBooking = async (data) => {
  const response = await api.post('/bookings', data);
  return response.data;
};

export const updateBookingStatus = async (id, status) => {
  const response = await api.put(`/bookings/${id}/status`, { status });
  return response.data;
};

export const deleteBooking = async (id) => {
  const response = await api.delete(`/bookings/${id}`);
  return response.data;
};
