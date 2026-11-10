import { Router } from 'express';
import {
  createRequest,
  myRequests,
  vendorRequests,
  updateStatus,
} from '../controllers/maintenanceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

// Customer
router.post('/', protect, createRequest);
router.get('/my', protect, myRequests);

// Vendor / Admin
router.get('/vendor', protect, authorize('vendor', 'admin'), vendorRequests);
router.patch('/:id/status', protect, authorize('vendor', 'admin'), updateStatus);

export default router;