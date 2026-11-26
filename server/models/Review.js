import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    rental: { type: mongoose.Schema.Types.ObjectId, ref: 'Rental', required: true, unique: true }, // one review for each rental
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

reviewSchema.index({ product: 1, createdAt: -1 });

export default mongoose.model('Review', reviewSchema);