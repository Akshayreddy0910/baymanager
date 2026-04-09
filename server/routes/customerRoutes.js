import express from 'express';
import {
  addCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer
} from '../controllers/customerController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

// Create a new router for customer-related endpoints
const router = express.Router();

// Apply auth protection and admin role restriction to ALL routes in this file
// Only logged-in administrators can manage customers
router.use(protect);
router.use(authorizeRoles('admin'));

// Route for adding a new customer and getting all customers
router.route('/')
  .post(addCustomer)
  .get(getAllCustomers);

// Route for operations on a specific customer by their ID
router.route('/:id')
  .get(getCustomerById)
  .put(updateCustomer)
  .delete(deleteCustomer);

// Export the router for use in server.js
export default router;
