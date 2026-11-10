import { Router } from 'express';
import {
  listUsers,
  changeRole,
  damageClaims,
  updateDamage,
  stats,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

// Every route in this file is for admin only
router.use(protect, authorize('admin'));

router.get('/users', listUsers);
router.patch('/users/:id/role', changeRole);
router.get('/stats', stats);
router.get('/damage-claims', damageClaims);
router.patch('/rentals/:id/damage', updateDamage);

export default router;