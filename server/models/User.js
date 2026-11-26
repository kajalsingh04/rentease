import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            select: false
        }, // hidden by default
        role: {
            type: String,
            enum: ['user', 'vendor', 'admin'],
            default: 'user'
        },
        phone: {
            type: String,
            trim: true
        },
        city: {
            type: String,
            trim: true
        },
        // Only for vendors
        businessName: {
            type: String,
            trim: true
        },
        servicesOffered: {
            type: String,
            trim: true
        },
    },
    { timestamps: true }
);

export default mongoose.model('User', userSchema);