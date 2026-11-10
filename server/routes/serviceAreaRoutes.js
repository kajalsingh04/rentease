import { Router } from 'express';
import {
  listServiceAreas,
  createServiceArea,
  updateServiceArea,
  deleteServiceArea,
} from '../controllers/serviceAreaController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', listServiceAreas); // public

router.post('/', protect, authorize('admin'), createServiceArea);
router.patch('/:id', protect, authorize('admin'), updateServiceArea);
router.delete('/:id', protect, authorize('admin'), deleteServiceArea);

export default router;