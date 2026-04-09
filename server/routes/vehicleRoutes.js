import express from 'express';
import {
  addVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle
} from '../controllers/vehicleController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Apply authentication protection to all routes
router.use(protect);

// 1. Adding and Listing Vehicles
// Both admins and customers can add vehicles and view lists (filtered by role in the controller)
router.post('/', authorizeRoles('admin', 'customer'), addVehicle);
router.get('/', authorizeRoles('admin', 'customer'), getAllVehicles);

// 2. Specific Vehicle Operations
// Operations on a single vehicle by ID
router.route('/:id')
  .get(authorizeRoles('admin', 'customer'), getVehicleById)
  .put(authorizeRoles('admin', 'customer'), updateVehicle)
  .delete(authorizeRoles('admin'), deleteVehicle); // Deletion restricted to Admin for safety

export default router;
