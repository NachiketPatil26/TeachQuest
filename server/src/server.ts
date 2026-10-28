import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';

import { connectDB } from './config/db';
import { protect, teacherOnly } from './middleware/auth';
import examRoutes from './routes/examRoutes';
import branchRoutes from './routes/branchRoutes';
import userRoutes from './routes/userRoutes';
import notificationRoutes from './routes/notificationRoutes';
import User from './models/User';
import aiRoutes from './routes/aiRoutes';
import analyticsRoutes from './routes/analyticsRoutes';

// Error handling interface
interface ErrorWithStatus extends Error {
  status?: number;
  statusCode?: number;
}

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set. Add it to your environment variables.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map(origin => origin.trim().replace(/\/$/, ''));

app.use(cors({
  origin: (origin, callback) => {
    // Allow tools like curl/Postman (no origin) and the configured frontend(s)
    callback(null, !origin || allowedOrigins.includes(origin));
  }
}));
app.use(express.json());

// Request logging middleware
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check (used by Render)
app.get('/api/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'ok' });
});

app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

// Teacher Routes
app.use('/api/teacher', protect as unknown as express.RequestHandler, teacherOnly as express.RequestHandler);
app.get('/api/remuneration', protect as unknown as express.RequestHandler, (async (req: express.Request, res: express.Response) => {
  try {
    const user = await User.findById((req as any).user?.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.status(200).json({ remuneration: user.remuneration || 0 });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}) as express.RequestHandler);

// Global error handling middleware
app.use((err: ErrorWithStatus, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
});