import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';

const registerSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6),
  role: z.enum(['user', 'vendor']).default('user'), // admin cannot be created from register
  phone: z.string().trim().optional(),
  city: z.string().trim().optional(),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

const profileSchema = z.object({
  name: z.string().trim().min(2),
  phone: z.string().trim().optional(),
  city: z.string().trim().optional(),
  businessName: z.string().trim().max(80).optional(),
  servicesOffered: z.string().trim().max(300).optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const safeUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  phone: u.phone,
  city: u.city,
  businessName: u.businessName,
  servicesOffered: u.servicesOffered,
});

export const register = async (req, res) => {
  const data = registerSchema.parse(req.body);

  const exists = await User.findOne({ email: data.email });
  if (exists) throw new AppError('Email is already registered', 409);

  const hashed = await bcrypt.hash(data.password, 10);
  const user = await User.create({ ...data, password: hashed });

  res.status(201).json({ token: signToken(user._id), user: safeUser(user) });
};

export const login = async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await User.findOne({ email }).select('+password');
  const ok = user && (await bcrypt.compare(password, user.password));
  if (!ok) throw new AppError('Invalid email or password', 401);

  res.json({ token: signToken(user._id), user: safeUser(user) });
};

export const me = async (req, res) => {
  res.json({ user: safeUser(req.user) });
};

// Logged-in user: change my name, phone and city (a vendor can also change the business details)
export const updateMe = async (req, res) => {
  const data = profileSchema.parse(req.body);

  if (req.user.role !== 'vendor') {
    delete data.businessName;
    delete data.servicesOffered;
  }

  await User.updateOne({ _id: req.user._id }, data, { runValidators: true });
  const user = await User.findById(req.user._id);

  res.json({ user: safeUser(user) });
};

// Logged-in user: change my password
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = passwordSchema.parse(req.body);

  const user = await User.findById(req.user._id).select('+password');
  const ok = await bcrypt.compare(currentPassword, user.password);
  if (!ok) throw new AppError('Your current password is not correct', 400);
  if (currentPassword === newPassword) {
    throw new AppError('The new password must be different from the current one', 400);
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await User.updateOne({ _id: user._id }, { password: hashed });

  res.json({ message: 'Password changed' });
};