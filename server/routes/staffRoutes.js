import express from 'express';
import { 
    getAllStaff, 
    addStaff, 
    updateStaff, 
    deleteStaff 
} from '../controllers/staffController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Only Admins can manage the staff team
router.use(protect);
router.use(authorizeRoles('admin'));

router.get('/', getAllStaff);
router.post('/', addStaff);
router.put('/:id', updateStaff);
router.delete('/:id', deleteStaff);

export default router;
