import mongoose from 'mongoose';

const serviceAreaSchema = new mongoose.Schema(
    {
        city: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
    },
    { timestamps: true }
);

export default mongoose.model('ServiceArea', serviceAreaSchema);