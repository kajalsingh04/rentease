import { Router } from 'express';
import {
  createRental,
  myRentals,
  vendorRentals,
  cancelRental,
  requestReturn,
  updateStatus,
} from '../controllers/rentalController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

// Customer
router.post('/', protect, createRental);
router.get('/my', protect, myRentals);
router.post('/:id/cancel', protect, cancelRental);
router.post('/:id/request-return', protect, requestReturn);

// Vendor / Admin
router.get('/vendor', protect, authorize('vendor', 'admin'), vendorRentals);
router.patch('/:id/status', protect, authorize('vendor', 'admin'), updateStatus);

export default router;