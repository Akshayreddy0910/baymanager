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

const router = express.Router();

router.use(protect);

router.post('/', authorizeRoles('admin'), createInvoice);
router.get('/all', authorizeRoles('admin'), getAllInvoices);

router.get('/my', authorizeRoles('customer'), getMyInvoices);

router.get('/:id', authorizeRoles('admin', 'customer'), getInvoiceById);

router.put('/:id/pay', authorizeRoles('admin'), markAsPaid);

export default router;
