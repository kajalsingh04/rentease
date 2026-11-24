import { Router } from 'express';
import {
  createRental,
  myRentals,
  vendorRentals,
  cancelRental,
  requestReturn,
  extendRental,
  updateStatus,
  updateSchedule,
  decideExtension,
  updatePayment,
} from '../controllers/rentalController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

// Customer
router.post('/', protect, createRental);
router.get('/my', protect, myRentals);
router.post('/:id/cancel', protect, cancelRental);
router.post('/:id/request-return', protect, requestReturn);
router.post('/:id/extend', protect, extendRental);

// Vendor / Admin
router.get('/vendor', protect, authorize('vendor', 'admin'), vendorRentals);
router.patch('/:id/status', protect, authorize('vendor', 'admin'), updateStatus);
router.patch('/:id/schedule', protect, authorize('vendor', 'admin'), updateSchedule);
router.patch('/:id/extension', protect, authorize('vendor', 'admin'), decideExtension);
router.patch('/:id/payment', protect, authorize('vendor', 'admin'), updatePayment);

export default router;