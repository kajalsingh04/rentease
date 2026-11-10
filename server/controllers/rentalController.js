import { z } from 'zod';
import Product from '../models/Product.js';
import Rental from '../models/Rental.js';
import AppError from '../utils/AppError.js';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

const checkoutSchema = z.object({
    items: z
        .array(
            z.object({
                productId: objectId,
                tenureMonths: z.number().int().positive(),
            })
        )
        .min(1)
        .max(10),
    deliveryAddress: z.object({
        line1: z.string().trim().min(3),
        city: z.string().trim().min(2),
        pincode: z.string().trim().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
    }),
    deliveryDate: z.coerce.date().refine((d) => d > new Date(), 'Delivery date must be in the future'),
});

const statusSchema = z.object({
    status: z.enum(['confirmed', 'active', 'returned', 'cancelled']),
    damageNote: z.string().trim().optional(),
    damageCharge: z.number().nonnegative().optional(),
    pickupDate: z.coerce.date().optional(),
});

const returnRequestSchema = z.object({
    pickupDate: z.coerce.date().optional(),
});

// Which status can change to which status (used by vendor/admin)
const transitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['active', 'cancelled'],
    active: ['returned'],
    return_requested: ['returned'],
};

const restoreStock = (productId) =>
    Product.updateOne({ _id: productId }, { $inc: { stock: 1 } });

// Checkout: the cart items come from the frontend, one rental is created for each item
export const createRental = async (req, res) => {
    const { items, deliveryAddress, deliveryDate } = checkoutSchema.parse(req.body);

    const reserved = []; // product ids whose stock we already reduced
    const rentals = [];

    try {
        for (const item of items) {
            // Reduce stock only if stock is available.
            // This is safe even if two users order the same product at the same time.
            const product = await Product.findOneAndUpdate(
                { _id: item.productId, isActive: true, stock: { $gte: 1 } },
                { $inc: { stock: -1 } }
            );
            if (!product) throw new AppError('A product is not available or is out of stock', 409);
            reserved.push(product._id);

            // Take the price from the database, never from the frontend
            const option = product.tenureOptions.find((o) => o.months === item.tenureMonths);
            if (!option) throw new AppError(`${product.name}: this tenure is not available`, 400);

            rentals.push({
                user: req.user._id,
                product: product._id,
                vendor: product.vendor,
                tenureMonths: option.months,
                monthlyRent: option.monthlyRent,
                securityDeposit: product.securityDeposit,
                deliveryAddress,
                deliveryDate,
            });
        }

        const created = await Rental.insertMany(rentals);
        res.status(201).json(created);
    } catch (err) {
        // Something failed, so put the stock back
        for (const id of reserved) await restoreStock(id);
        throw err;
    }
};

// Customer: my rentals. Use ?status=active or ?status=returned to filter
export const myRentals = async (req, res) => {
    const filter = { user: req.user._id };
    if (req.query.status) filter.status = String(req.query.status);

    const rentals = await Rental.find(filter)
        .populate('product', 'name images category')
        .sort({ createdAt: -1 });

    res.json(rentals);
};

// Vendor: rentals of my products. Admin: all rentals
export const vendorRentals = async (req, res) => {
    const filter = req.user.role === 'admin' ? {} : { vendor: req.user._id };
    if (req.query.status) filter.status = String(req.query.status);

    const rentals = await Rental.find(filter)
        .populate('product', 'name category')
        .populate('user', 'name email phone city')
        .sort({ createdAt: -1 });

    res.json(rentals);
};

// Customer: cancel before the vendor confirms
export const cancelRental = async (req, res) => {
    const rental = await Rental.findById(req.params.id);
    if (!rental || !rental.user.equals(req.user._id)) throw new AppError('Rental not found', 404);
    if (rental.status !== 'pending') throw new AppError('Only pending rentals can be cancelled', 400);

    rental.status = 'cancelled';
    await rental.save();
    await restoreStock(rental.product);

    res.json(rental);
};

// Customer: ask to return the product
export const requestReturn = async (req, res) => {
    const { pickupDate } = returnRequestSchema.parse(req.body ?? {});

    const rental = await Rental.findById(req.params.id);
    if (!rental || !rental.user.equals(req.user._id)) throw new AppError('Rental not found', 404);
    if (rental.status !== 'active') throw new AppError('Only active rentals can be returned', 400);

    rental.status = 'return_requested';
    if (pickupDate) rental.pickupDate = pickupDate;
    await rental.save();

    res.json(rental);
};

// Vendor/Admin: move the rental to the next status
export const updateStatus = async (req, res) => {
    const data = statusSchema.parse(req.body);

    const rental = await Rental.findById(req.params.id);
    if (!rental) throw new AppError('Rental not found', 404);
    if (req.user.role !== 'admin' && !rental.vendor.equals(req.user._id)) {
        throw new AppError('This is not your rental', 403);
    }

    const allowed = transitions[rental.status] || [];
    if (!allowed.includes(data.status)) {
        throw new AppError(`Cannot change status from ${rental.status} to ${data.status}`, 400);
    }

    if (data.status === 'active') {
        // Delivered: the rental period starts now
        const start = new Date();
        const end = new Date(start);
        end.setMonth(end.getMonth() + rental.tenureMonths);
        rental.startDate = start;
        rental.endDate = end;
    }

    if (data.status === 'returned') {
        rental.damageNote = data.damageNote;
        rental.damageCharge = data.damageCharge ?? 0;
    }

    if (data.pickupDate) rental.pickupDate = data.pickupDate;

    rental.status = data.status;
    await rental.save();

    // Product comes back to stock when the rental is returned or cancelled
    if (data.status === 'returned' || data.status === 'cancelled') {
        await restoreStock(rental.product);
    }

    res.json(rental);
};