import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import rentalRoutes from './routes/rentalRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import serviceAreaRoutes from './routes/serviceAreaRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

// When the app is deployed behind a proxy (Render, etc.), this lets us see the real user IP
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);

app.use(helmet()); // safe HTTP headers
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '10kb' })); // block very big request bodies

// Stop password guessing: max 20 login, register or password change tries per 15 minutes from one IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again after 15 minutes.' },
});
app.use(['/api/auth/login', '/api/auth/register', '/api/auth/password'], authLimiter);

app.get('/api/health', (req, res) => res.json({ status: 'API running' }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/service-areas', serviceAreaRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;