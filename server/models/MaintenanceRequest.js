import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema(
    {
        rental: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Rental',
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        issue: {
            type: String,
            required: true,
            trim: true
        },
        status: {
            type: String,
            enum: ['open', 'in_progress', 'resolved'],
            default: 'open'
        },
        resolvedAt: Date,
    },
    { timestamps: true }
);

export default mongoose.model('MaintenanceRequest', maintenanceSchema);