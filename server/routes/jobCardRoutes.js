import express from 'express';
import {
  createJobCard,
  getAllJobCards,
  getMyJobCards,
  updateJobCardStatus,
  deleteJobCard
} from '../controllers/jobCardController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

// Create a new router instance for work management
const router = express.Router();

// Apply base protection to all routes
router.use(protect);

// Admin-only: Create and view all job cards
router.post('/', authorizeRoles('admin'), createJobCard);
router.get('/all', authorizeRoles('admin'), getAllJobCards);

// Staff-only: View personal assignments
router.get('/my', authorizeRoles('staff'), getMyJobCards);

// Shared access: Mechanics or Admin can update status
router.put('/:id', authorizeRoles('admin', 'staff'), updateJobCardStatus);

// Admin-only: Delete operations
router.delete('/:id', authorizeRoles('admin'), deleteJobCard);

// Export router for server mounting
export default router;
