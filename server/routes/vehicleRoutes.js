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

router.use(protect);

router.post('/', authorizeRoles('admin', 'customer'), addVehicle);
router.get('/', authorizeRoles('admin', 'customer'), getAllVehicles);

router.route('/:id')
  .get(authorizeRoles('admin', 'customer'), getVehicleById)
  .put(authorizeRoles('admin', 'customer'), updateVehicle)
  .delete(authorizeRoles('admin'), deleteVehicle);

export default router;
