import api from "./api.js";


export const submitFeedback = async (data) => {
  const response = await api.post("/feedback", data);
  return response.data;
};

export const getMyFeedback = async () => {
  const response = await api.get("/feedback/my");
  return response.data;
};

export const getAllFeedback = async () => {
  const response = await api.get("/feedback/all");
  return response.data;
};

export const getMechanicFeedback = async () => {
  const response = await api.get("/feedback/mechanic/me");
  return response.data;
};

export const getFeedbackStats = async () => {
  const response = await api.get("/feedback/stats");
  return response.data;
};

export const checkFeedbackExists = async (jobCardId) => {
  const response = await api.get(`/feedback/check/${jobCardId}`);
  return response.data;
};
