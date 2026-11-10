import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';

// Checks the token and puts the logged-in user in req.user
export const protect = async (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;
    if (!token) throw new AppError('Please login first', 401);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) throw new AppError('User no longer exists', 401);

    req.user = user;
    next();
};

// Allows only some roles. Example: authorize('vendor', 'admin')
export const authorize = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        throw new AppError('You are not allowed to do this', 403);
    }
    next();
};