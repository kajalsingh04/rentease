import mongoose from 'mongoose';

const rentalSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', required: true
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product', required: true
        },
        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', required: true
        },

        // Save price details at the time of order, so old orders do not change if the product price changes
        tenureMonths: {
            type: Number,
            required: true
        },
        monthlyRent: {
            type: Number,
            required: true
        },
        securityDeposit: {
            type: Number,
            required: true
        },

        deliveryAddress: {
            line1: {
                type: String,
                required: true
            },
            city: {
                type: String,
                required: true
            },
            pincode: {
                type: String,
                required: true
            },
        },
        deliveryDate: {
            type: Date,
            required: true
        },
        startDate: Date,
        endDate: Date,
        pickupDate: Date,

        status: {
            type: String,
            enum: ['pending', 'confirmed','active', 'return_requested', 'returned', 'cancelled'],
            default: 'pending',
        },

        // Filled by vendor when the product comes back
        damageNote: String,
        damageCharge: {
            type: Number,
            default: 0
        },
    },
    { timestamps: true }
);

export default mongoose.model('Rental', rentalSchema);