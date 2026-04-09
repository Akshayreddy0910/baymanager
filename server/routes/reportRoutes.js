import express from 'express';
import { getRevenueStats } from '../controllers/invoiceController.js';
import { getServiceTypeDistribution } from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

// Initialize router for analytical report endpoints
const router = express.Router();

/**
 * All reporting routes are sensitive of business data.
 * Access is restricted to users with the 'admin' role only.
 */

// 1. Endpoint to fetch financial revenue summaries
router.get('/revenue', protect, authorizeRoles('admin'), getRevenueStats);

// 2. Endpoint to fetch service type breakdown
router.get('/services', protect, authorizeRoles('admin'), getServiceTypeDistribution);

export default router;
