import express from 'express';
import {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  getMyInvoices,
  markAsPaid
} from '../controllers/invoiceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

// Create a new router instance for billing management
const router = express.Router();

// All routes require authentication
router.use(protect);

// Admin-only: Create an invoice and view all system invoices
router.post('/', authorizeRoles('admin'), createInvoice);
router.get('/all', authorizeRoles('admin'), getAllInvoices);

// Customer-only: View personal bills
router.get('/my', authorizeRoles('customer'), getMyInvoices);

// Shared: Specific invoice details
router.get('/:id', authorizeRoles('admin', 'customer'), getInvoiceById);

// Admin-only: Update payment status manually
router.put('/:id/pay', authorizeRoles('admin'), markAsPaid);

// Export router for server application
export default router;
