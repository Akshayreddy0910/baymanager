import api from './api.js';

// Service to handle all job card-related API calls
export const getAllJobCards = async () => {
    // Fetches all job cards (Admin view)
    const response = await api.get('/jobcards/all');
    return response.data;
};

export const getMyJobCards = async () => {
    // Fetches job cards assigned to the logged-in mechanic
    const response = await api.get('/jobcards/my');
    return response.data;
};

export const createJobCard = async (data) => {
    const response = await api.post('/jobcards', data);
    return response.data;
};

export const updateJobCardStatus = async (id, data) => {
    const response = await api.put(`/jobcards/${id}`, data);
    return response.data;
};

export const deleteJobCard = async (id) => {
    const response = await api.delete(`/jobcards/${id}`);
    return response.data;
};
