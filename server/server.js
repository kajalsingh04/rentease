import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';

// Stop early if important settings are missing
if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is missing in .env');
  process.exit(1);
}
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  console.error('JWT_SECRET is missing or too short (use at least 16 characters)');
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

try {
  await connectDB();
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
} catch (err) {
  console.error('Could not start server:', err.message);
  process.exit(1);
}