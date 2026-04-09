import express from 'express';
import {
  createBooking,
  getAllBookings,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

// Allow customers to fetch their own bookings
router.get('/my', authorizeRoles('customer'), getMyBookings);

router.post('/', authorizeRoles('customer', 'admin'), createBooking);

// Administrators only for global list
router.get('/', authorizeRoles('admin'), getAllBookings);

router.get('/:id', authorizeRoles('admin', 'customer'), getBookingById);
router.put('/:id/status', authorizeRoles('admin'), updateBookingStatus);
router.delete('/:id', authorizeRoles('admin'), deleteBooking);

export default router;
