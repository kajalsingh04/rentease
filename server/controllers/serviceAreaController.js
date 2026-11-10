import { z } from 'zod';
import ServiceArea from '../models/ServiceArea.js';
import AppError from '../utils/AppError.js';

// Public: the website uses this to show which cities we serve
export const listServiceAreas = async (req, res) => {
  const areas = await ServiceArea.find({ isActive: true }).sort({ city: 1 });
  res.json(areas);
};

export const createServiceArea = async (req, res) => {
  const { city } = z.object({ city: z.string().trim().min(2) }).parse(req.body);
  const area = await ServiceArea.create({ city });
  res.status(201).json(area);
};

export const updateServiceArea = async (req, res) => {
  const { isActive } = z.object({ isActive: z.boolean() }).parse(req.body);

  const area = await ServiceArea.findById(req.params.id);
  if (!area) throw new AppError('Service area not found', 404);

  area.isActive = isActive;
  await area.save();
  res.json(area);
};

export const deleteServiceArea = async (req, res) => {
  const area = await ServiceArea.findById(req.params.id);
  if (!area) throw new AppError('Service area not found', 404);

  await area.deleteOne();
  res.json({ message: 'Service area deleted' });
};