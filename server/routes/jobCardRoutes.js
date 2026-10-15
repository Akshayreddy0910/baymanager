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

const router = express.Router();

router.use(protect);

router.post('/', authorizeRoles('admin'), createJobCard);
router.get('/all', authorizeRoles('admin'), getAllJobCards);

router.get('/my', authorizeRoles('staff'), getMyJobCards);

router.put('/:id', authorizeRoles('admin', 'staff'), updateJobCardStatus);

router.delete('/:id', authorizeRoles('admin'), deleteJobCard);

export default router;
