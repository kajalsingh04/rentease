import { z } from 'zod';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Rental from '../models/Rental.js';
import MaintenanceRequest from '../models/MaintenanceRequest.js';
import AppError from '../utils/AppError.js';

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Users list. Filters: ?role=vendor  ?search=kajal  ?page=1&limit=20
export const listUsers = async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);

  const filter = {};
  if (req.query.role) filter.role = String(req.query.role);
  if (req.query.search) {
    const rx = { $regex: escapeRegex(String(req.query.search)), $options: 'i' };
    filter.$or = [{ name: rx }, { email: rx }];
  }

  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(filter),
  ]);

  res.json({ items, total, page, pages: Math.ceil(total / limit) });
};

// Change the role of a user (this is how you make an admin)
export const changeRole = async (req, res) => {
  const { role } = z.object({ role: z.enum(['user', 'vendor', 'admin']) }).parse(req.body);

  if (req.params.id === String(req.user._id)) {
    throw new AppError('You cannot change your own role', 400);
  }

  const result = await User.updateOne({ _id: req.params.id }, { role });
  if (result.matchedCount === 0) throw new AppError('User not found', 404);

  res.json({ message: `Role changed to ${role}` });
};

// Rentals that have a damage charge
export const damageClaims = async (req, res) => {
  const rentals = await Rental.find({ damageCharge: { $gt: 0 } })
    .populate('product', 'name')
    .populate('user', 'name email phone')
    .sort({ updatedAt: -1 });

  res.json(rentals);
};

// Admin can fix the damage charge when there is a dispute
export const updateDamage = async (req, res) => {
  const data = z
    .object({
      damageCharge: z.number().nonnegative(),
      damageNote: z.string().trim().optional(),
    })
    .parse(req.body);

  const rental = await Rental.findById(req.params.id);
  if (!rental) throw new AppError('Rental not found', 404);

  rental.damageCharge = data.damageCharge;
  if (data.damageNote !== undefined) rental.damageNote = data.damageNote;
  await rental.save();

  res.json(rental);
};

const round1 = (n) => Math.round(n * 10) / 10;

// Dashboard numbers (KPIs)
export const stats = async (req, res) => {
  const runningStatuses = ['active', 'return_requested']; // product is with the customer
  const heldStatuses = ['pending', 'confirmed', ...runningStatuses]; // product is not in stock

  const [totalUsers, totalProducts, byStatus, mrrData, stockData, repeatData, resolveData] =
    await Promise.all([
      User.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Rental.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Rental.aggregate([
        { $match: { status: { $in: runningStatuses } } },
        { $group: { _id: null, mrr: { $sum: '$monthlyRent' } } },
      ]),
      Product.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, inStock: { $sum: '$stock' } } },
      ]),
      Rental.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: '$user', orders: { $sum: 1 } } },
        {
          $group: {
            _id: null,
            customers: { $sum: 1 },
            repeat: { $sum: { $cond: [{ $gt: ['$orders', 1] }, 1, 0] } },
          },
        },
      ]),
      MaintenanceRequest.aggregate([
        { $match: { status: 'resolved', resolvedAt: { $exists: true } } },
        { $group: { _id: null, avgMs: { $avg: { $subtract: ['$resolvedAt', '$createdAt'] } } } },
      ]),
    ]);

  // Turn [{_id:'active',count:3}, ...] into {active:3, ...}
  const rentalsByStatus = Object.fromEntries(byStatus.map((s) => [s._id, s.count]));
  const countOf = (list) => list.reduce((sum, s) => sum + (rentalsByStatus[s] || 0), 0);

  const held = countOf(heldStatuses);
  const inStock = stockData[0]?.inStock ?? 0;
  const customers = repeatData[0]?.customers ?? 0;
  const repeat = repeatData[0]?.repeat ?? 0;

  res.json({
    totalUsers,
    totalProducts,
    rentalsByStatus,
    activeRentals: countOf(runningStatuses),
    monthlyRecurringRevenue: mrrData[0]?.mrr ?? 0,
    productUtilizationPercent: held + inStock ? round1((held / (held + inStock)) * 100) : 0,
    customerRetentionPercent: customers ? round1((repeat / customers) * 100) : 0,
    avgMaintenanceResolutionHours: resolveData[0] ? round1(resolveData[0].avgMs / 36e5) : null,
  });
};