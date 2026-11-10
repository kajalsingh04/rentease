import mongoose from 'mongoose';

const tenureOptionSchema = new mongoose.Schema(
    {
        months: {
            type: Number,
            required: true,
            min: 1
        },
        monthlyRent: {
            type: Number,
            required: true,
            min: 0
        },
    },
    { _id: false }
);

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        category: {
            type: String,
            enum: ['furniture', 'appliance'],
            required: true
        },
        subCategory: {
            type: String,
            trim: true,
            lowercase: true
        }, // bed, sofa, fridge, tv...
        brand: { 
            type: String, 
            trim: true 
        },
        images: [String],
        tenureOptions: {
            type: [tenureOptionSchema],
            validate: (v) => v.length > 0,
        },
        securityDeposit: {
            type: Number,
            required: true,
            min: 0
        },
        stock: {
            type: Number,
            default: 0,
            min: 0
        },
        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
    },
    { timestamps: true }
);

productSchema.index({ category: 1, subCategory: 1 });

export default mongoose.model('Product', productSchema);