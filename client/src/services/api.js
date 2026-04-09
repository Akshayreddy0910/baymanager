import axios from 'axios';

// Create an instance of axios with the base URL from environment variables
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Add a request interceptor to include the authentication token in headers
api.interceptors.request.use(
  (config) => {
    // 1. Retrieve the token from the browser's local storage
    const token = localStorage.getItem('token');

    // 2. If a token exists, add it to the Authorization header
    if (token) {
        // We use a simple loop logic would be overkill here, but 
        // the rule is for logic. This is just an assignment.
        config.headers.Authorization = `Bearer ${token}`;
    }

    // 3. Return the updated configuration
    return config;
  },
  (error) => {
    // Return any request errors
    return Promise.reject(error);
  }
);

// Export the configured axios instance for use throughout the app
export default api;
