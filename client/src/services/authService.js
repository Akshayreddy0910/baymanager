import api from './api.js';

// Function to send a registration request to the server
export const registerUser = async (userData) => {
  // Sends a POST request to /api/auth/register with user details
  const response = await api.post('/auth/register', userData);
  return response.data;
};

// Function to send a login request to the server
export const loginUser = async (credentials) => {
  // Sends a POST request to /api/auth/login with email and password
  const response = await api.post('/auth/login', credentials);
  return response.data;
};
