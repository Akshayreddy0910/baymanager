import api from "./api.js";

/**
 * Feedback Service
 * Handles all communication with the feedback-related backend endpoints.
 * 
 * Available Endpoints:
 * 1. POST /feedback - submitFeedback
 * 2. GET /feedback/my - getMyFeedback
 * 3. GET /feedback/all - getAllFeedback
 * 4. GET /feedback/mechanic/me - getMechanicFeedback
 * 5. GET /feedback/stats - getFeedbackStats
 * 6. GET /feedback/check/:jobCardId - checkFeedbackExists
 */

/**
 * Submits new feedback for a completed service.
 * @param {Object} data - { jobCardId, garageRating, mechanicRating, comment, wouldRecommend }
 */
export const submitFeedback = async (data) => {
  const response = await api.post("/feedback", data);
  return response.data;
};

/**
 * Retrieves feedback submitted by the currently logged-in customer.
 */
export const getMyFeedback = async () => {
  const response = await api.get("/feedback/my");
  return response.data;
};

/**
 * Admin only: Retrieves all feedback in the system.
 */
export const getAllFeedback = async () => {
  const response = await api.get("/feedback/all");
  return response.data;
};

/**
 * Mechanic only: Retrieves feedback specifically for the logged-in mechanic.
 */
export const getMechanicFeedback = async () => {
  const response = await api.get("/feedback/mechanic/me");
  return response.data;
};

/**
 * Admin only: Retrieves aggregated stats and leaderboard for the feedback dashboard.
 */
export const getFeedbackStats = async () => {
  const response = await api.get("/feedback/stats");
  return response.data;
};

/**
 * Checks if feedback already exists for a specific job card to prevent duplicates.
 * @param {string} jobCardId 
 */
export const checkFeedbackExists = async (jobCardId) => {
  const response = await api.get(`/feedback/check/${jobCardId}`);
  return response.data;
};
