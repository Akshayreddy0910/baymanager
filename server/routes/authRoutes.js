import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';

// Create a new router instance for authentication routes
const router = express.Router();

// Define the route for user registration
// Calls the registerUser function from the auth controller
router.post('/register', registerUser);

// Define the route for user login
// Calls the loginUser function from the auth controller
router.post('/login', loginUser);

// Export the router to be mounted in the main server file
export default router;
