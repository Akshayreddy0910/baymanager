import api from './api.js';

// Service to handle all vehicle-related API calls
export const getAllVehicles = async () => {
  const response = await api.get('/vehicles');
  return response.data;
};

export const createVehicle = async (data) => {
  const response = await api.post('/vehicles', data);
  return response.data;
};

export const updateVehicle = async (id, data) => {
  const response = await api.put(`/vehicles/${id}`, data);
  return response.data;
};

export const deleteVehicle = async (id) => {
  const response = await api.delete(`/vehicles/${id}`);
  return response.data;
};
