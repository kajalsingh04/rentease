import { z } from 'zod';
import Product from '../models/Product.js';
import Rental from '../models/Rental.js';
import ServiceArea from '../models/ServiceArea.js';
import AppError from '../utils/AppError.js';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

const futureDate = (label) => z.coerce.date().refine((d) => d > new Date(), `${label} must be in the future`);

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
  deliveryDate: futureDate('Delivery date'),
  paymentMethod: z.enum(['pay_on_delivery']).default('pay_on_delivery'), // online payment comes later
});

const statusSchema = z.object({
  status: z.enum(['confirmed', 'active', 'returned', 'cancelled']),
  damageNote: z.string().trim().optional(),
  damageCharge: z.number().nonnegative().optional(),
  pickupDate: z.coerce.date().optional(),
});

const returnRequestSchema = z.object({
  pickupDate: futureDate('Pickup date'),
});

const scheduleSchema = z
  .object({
    deliveryDate: futureDate('Delivery date').optional(),
    pickupDate: futureDate('Pickup date').optional(),
  })
  .refine((d) => d.deliveryDate || d.pickupDate, 'Send a delivery date or a pickup date');

const extendSchema = z.object({
  months: z.number().int().min(1).max(12),
});

const decisionSchema = z.object({
  decision: z.enum(['approved', 'rejected']),
});

const paymentSchema = z.object({
  paymentStatus: z.enum(['paid', 'refunded']),
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

// indore -> Indore, new delhi -> New Delhi
const titleCase = (text) => text.replace(/\b\w/g, (c) => c.toUpperCase());

// Vendor/Admin: find the rental and check that it belongs to this vendor
const getRentalForVendor = async (req) => {
  const rental = await Rental.findById(req.params.id);
  if (!rental) throw new AppError('Rental not found', 404);
  if (req.user.role !== 'admin' && !rental.vendor.equals(req.user._id)) {
    throw new AppError('This is not your rental', 403);
  }
  return rental;
};

// Checkout: the cart items come from the frontend, one rental is created for each item
export const createRental = async (req, res) => {
  const { items, deliveryAddress, deliveryDate, paymentMethod } = checkoutSchema.parse(req.body);

  // We deliver only to the cities that the admin turned on
  const area = await ServiceArea.findOne({ city: deliveryAddress.city.toLowerCase(), isActive: true });
  if (!area) throw new AppError('We do not deliver to this city yet', 400);
  const address = { ...deliveryAddress, city: titleCase(area.city) };

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
        deliveryAddress: address,
        deliveryDate,
        paymentMethod,
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

// Customer: ask to return the product, with the day when it can be picked up
export const requestReturn = async (req, res) => {
  const { pickupDate } = returnRequestSchema.parse(req.body ?? {});

  const rental = await Rental.findById(req.params.id);
  if (!rental || !rental.user.equals(req.user._id)) throw new AppError('Rental not found', 404);
  if (rental.status !== 'active') throw new AppError('Only active rentals can be returned', 400);

  rental.status = 'return_requested';
  rental.pickupDate = pickupDate;
  await rental.save();

  res.json(rental);
};

// Customer: ask to keep the product for more months (the rent per month stays the same)
export const extendRental = async (req, res) => {
  const { months } = extendSchema.parse(req.body ?? {});

  const rental = await Rental.findById(req.params.id);
  if (!rental || !rental.user.equals(req.user._id)) throw new AppError('Rental not found', 404);
  if (rental.status !== 'active') throw new AppError('Only active rentals can be extended', 400);
  if (rental.extension?.status === 'pending') {
    throw new AppError('You already have an extension request that is waiting for the vendor', 400);
  }

  rental.extension = { months, status: 'pending', requestedAt: new Date() };
  await rental.save();

  res.json(rental);
};

// Vendor/Admin: move the rental to the next status
export const updateStatus = async (req, res) => {
  const data = statusSchema.parse(req.body);
  const rental = await getRentalForVendor(req);

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

// Vendor/Admin: change the delivery date (before delivery) or set the pickup date (while the product is rented)
export const updateSchedule = async (req, res) => {
  const data = scheduleSchema.parse(req.body);
  const rental = await getRentalForVendor(req);

  if (data.deliveryDate) {
    if (!['pending', 'confirmed'].includes(rental.status)) {
      throw new AppError('The delivery date can be changed only before delivery', 400);
    }
    rental.deliveryDate = data.deliveryDate;
  }

  if (data.pickupDate) {
    if (!['active', 'return_requested'].includes(rental.status)) {
      throw new AppError('The pickup date can be set only for an active rental', 400);
    }
    rental.pickupDate = data.pickupDate;
  }

  await rental.save();
  res.json(rental);
};

// Vendor/Admin: approve or reject the request to extend a rental
export const decideExtension = async (req, res) => {
  const { decision } = decisionSchema.parse(req.body);
  const rental = await getRentalForVendor(req);

  if (rental.extension?.status !== 'pending') {
    throw new AppError('There is no extension request to answer', 400);
  }

  if (decision === 'approved') {
    if (rental.status !== 'active') throw new AppError('The rental is not active, so it cannot be extended', 400);

    const end = new Date(rental.endDate);
    end.setMonth(end.getMonth() + rental.extension.months);
    rental.endDate = end;
    rental.tenureMonths += rental.extension.months;
  }

  rental.extension.status = decision;
  await rental.save();

  res.json(rental);
};

// Vendor/Admin: mark that the payment was received, or that the deposit was given back
export const updatePayment = async (req, res) => {
  const { paymentStatus } = paymentSchema.parse(req.body);
  const rental = await getRentalForVendor(req);

  if (paymentStatus === 'paid') {
    if (rental.paymentStatus !== 'pending') throw new AppError('The payment is already marked as received', 400);
    if (!['confirmed', 'active', 'return_requested', 'returned'].includes(rental.status)) {
      throw new AppError('Payment can be marked as received after the order is confirmed', 400);
    }
  }

  if (paymentStatus === 'refunded') {
    if (rental.paymentStatus !== 'paid') {
      throw new AppError('The deposit can be given back only after the payment was received', 400);
    }
    if (!['returned', 'cancelled'].includes(rental.status)) {
      throw new AppError('The deposit can be given back only after the product is returned', 400);
    }
  }

  rental.paymentStatus = paymentStatus;
  await rental.save();

  res.json(rental);
};