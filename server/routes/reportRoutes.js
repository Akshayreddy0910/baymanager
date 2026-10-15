import express from 'express';
import { getRevenueStats } from '../controllers/invoiceController.js';
import { getServiceTypeDistribution } from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();


router.get('/revenue', protect, authorizeRoles('admin'), getRevenueStats);

router.get('/services', protect, authorizeRoles('admin'), getServiceTypeDistribution);

export default router;
