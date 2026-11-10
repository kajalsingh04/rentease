import { z } from 'zod';
import MaintenanceRequest from '../models/MaintenanceRequest.js';
import Rental from '../models/Rental.js';
import AppError from '../utils/AppError.js';

const createSchema = z.object({
  rentalId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id'),
  issue: z.string().trim().min(5, 'Please describe the problem (at least 5 letters)'),
});

const statusSchema = z.object({
  status: z.enum(['in_progress', 'resolved']),
});

const transitions = {
  open: ['in_progress', 'resolved'],
  in_progress: ['resolved'],
};

// Customer: report a problem with a rented product
export const createRequest = async (req, res) => {
  const { rentalId, issue } = createSchema.parse(req.body);

  const rental = await Rental.findById(rentalId);
  if (!rental || !rental.user.equals(req.user._id)) throw new AppError('Rental not found', 404);
  if (!['active', 'return_requested'].includes(rental.status)) {
    throw new AppError('You can ask for maintenance only for an active rental', 400);
  }

  const request = await MaintenanceRequest.create({
    rental: rental._id,
    user: req.user._id,
    vendor: rental.vendor,
    issue,
  });

  res.status(201).json(request);
};

// Customer: my requests
export const myRequests = async (req, res) => {
  const requests = await MaintenanceRequest.find({ user: req.user._id })
    .populate({ path: 'rental', select: 'product status', populate: { path: 'product', select: 'name' } })
    .sort({ createdAt: -1 });

  res.json(requests);
};

// Vendor: requests for my products. Admin: all requests
export const vendorRequests = async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { vendor: req.user._id };
  if (req.query.status) filter.status = String(req.query.status);

  const requests = await MaintenanceRequest.find(filter)
    .populate('user', 'name phone city')
    .populate({ path: 'rental', select: 'product deliveryAddress', populate: { path: 'product', select: 'name' } })
    .sort({ createdAt: -1 });

  res.json(requests);
};

// Vendor/Admin: update the status of a request
export const updateStatus = async (req, res) => {
  const { status } = statusSchema.parse(req.body);

  const request = await MaintenanceRequest.findById(req.params.id);
  if (!request) throw new AppError('Request not found', 404);
  if (req.user.role !== 'admin' && !request.vendor.equals(req.user._id)) {
    throw new AppError('This is not your request', 403);
  }

  const allowed = transitions[request.status] || [];
  if (!allowed.includes(status)) {
    throw new AppError(`Cannot change status from ${request.status} to ${status}`, 400);
  }

  request.status = status;
  if (status === 'resolved') request.resolvedAt = new Date();
  await request.save();

  res.json(request);
};