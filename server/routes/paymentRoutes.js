import express from 'express';
import { createCheckoutSession } from '../controllers/paymentController.js';
import { markAsPaid } from '../controllers/invoiceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

// Create a new router instance for payment-related operations
const router = express.Router();

// 1. Route to initialize a checkout session
// Only customers can start a payment for their own invoices
router.post('/create-checkout-session', protect, authorizeRoles('customer'), createCheckoutSession);

// 2. Route to manually mark an invoice as paid (used after successful payment redirect)
// In a real production app, this would be done via a Stripe Webhook for maximum security
router.patch('/mark-paid/:invoiceId', protect, markAsPaid);

// Export the router for server integration
export default router;
