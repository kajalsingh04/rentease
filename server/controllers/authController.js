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

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const safeUser = (u) => ({
    id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    phone: u.phone,
    city: u.city,
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