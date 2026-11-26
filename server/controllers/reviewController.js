import { z } from 'zod';
import Product from '../models/Product.js';
import Rental from '../models/Rental.js';
import Review from '../models/Review.js';
import AppError from '../utils/AppError.js';

const reviewSchema = z.object({
  rentalId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id'),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(500).optional(),
});

// Save the average rating and the number of reviews inside the product, so product lists stay fast
const refreshRating = async (productId) => {
  const [result] = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  await Product.updateOne(
    { _id: productId },
    {
      ratingAverage: result ? Math.round(result.average * 10) / 10 : 0,
      ratingCount: result ? result.count : 0,
    }
  );
};

// "Asha Kumar" -> "Asha K." (we do not show the full name of a customer)
const shortName = (name = 'Customer') => {
  const [first, ...rest] = name.trim().split(/\s+/);
  return rest.length ? `${first} ${rest[rest.length - 1][0].toUpperCase()}.` : first;
};

// Customer: rate a product that I rent or rented. One review for each rental.
export const createReview = async (req, res) => {
  const { rentalId, rating, comment } = reviewSchema.parse(req.body);

  const rental = await Rental.findById(rentalId);
  if (!rental || !rental.user.equals(req.user._id)) throw new AppError('Rental not found', 404);
  if (!['active', 'return_requested', 'returned'].includes(rental.status)) {
    throw new AppError('You can rate a product after it is delivered', 400);
  }
  if (await Review.exists({ rental: rental._id })) throw new AppError('You already rated this rental', 409);

  const review = await Review.create({
    product: rental.product,
    rental: rental._id,
    user: req.user._id,
    rating,
    comment,
  });
  await refreshRating(rental.product);

  res.status(201).json(review);
};

// Public: the reviews of one product (newest first)
export const listProductReviews = async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('user', 'name');

  res.json(
    reviews.map((r) => ({
      _id: r._id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      userId: r.user?._id,
      name: shortName(r.user?.name),
    }))
  );
};

// The writer of a review, or an admin, can delete it
export const deleteReview = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new AppError('Review not found', 404);
  if (req.user.role !== 'admin' && !review.user.equals(req.user._id)) {
    throw new AppError('This is not your review', 403);
  }

  await review.deleteOne();
  await refreshRating(review.product);

  res.json({ message: 'Review deleted' });
};