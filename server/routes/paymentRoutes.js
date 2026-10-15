import express from 'express';
import { createCheckoutSession } from '../controllers/paymentController.js';
import { markAsPaid } from '../controllers/invoiceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/create-checkout-session', protect, authorizeRoles('customer'), createCheckoutSession);

router.patch('/mark-paid/:invoiceId', protect, markAsPaid);

export default router;
