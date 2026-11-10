import { z } from 'zod';
import Product from '../models/Product.js';
import AppError from '../utils/AppError.js';

const productSchema = z.object({
    name: z.string().trim().min(2),
    description: z.string().trim().optional(),
    category: z.enum(['furniture', 'appliance']),
    subCategory: z.string().trim().optional(),
    brand: z.string().trim().optional(),
    images: z.array(z.string()).optional(),
    tenureOptions: z
        .array(
            z.object({
                months: z.number().int().positive(),
                monthlyRent: z.number().nonnegative(),
            })
        )
        .min(1),
    securityDeposit: z.number().nonnegative(),
    stock: z.number().int().nonnegative().optional(),
    isActive: z.boolean().optional(),
});

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Only the owner vendor or an admin can change a product
const checkOwner = (product, user) => {
    if (user.role !== 'admin' && !product.vendor.equals(user._id)) {
        throw new AppError('This is not your product', 403);
    }
};

export const listProducts = async (req, res) => {
    const { category, subCategory, search } = req.query;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 12, 50);

    const filter = { isActive: true };
    if (category) filter.category = String(category);
    if (subCategory) filter.subCategory = String(subCategory).toLowerCase();
    if (search) filter.name = { $regex: escapeRegex(String(search)), $options: 'i' };

    const [items, total] = await Promise.all([
        Product.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
        Product.countDocuments(filter),
    ]);

    res.json({ items, total, page, pages: Math.ceil(total / limit) });
};

export const getProduct = async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) throw new AppError('Product not found', 404);
    res.json(product);
};

export const createProduct = async (req, res) => {
    const data = productSchema.parse(req.body);
    const product = await Product.create({ ...data, vendor: req.user._id });
    res.status(201).json(product);
};

export const updateProduct = async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) throw new AppError('Product not found', 404);
    checkOwner(product, req.user);

    Object.assign(product, productSchema.partial().parse(req.body));
    await product.save();
    res.json(product);
};

export const deleteProduct = async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) throw new AppError('Product not found', 404);
    checkOwner(product, req.user);

    await product.deleteOne();
    res.json({ message: 'Product deleted' });
};