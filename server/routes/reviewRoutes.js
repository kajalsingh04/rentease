import { Router } from 'express';
import { createReview, listProductReviews, deleteReview } from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/product/:productId', listProductReviews); // public
router.post('/', protect, createReview);
router.delete('/:id', protect, deleteReview);

export default router;