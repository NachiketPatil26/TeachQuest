import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';

import { connectDB } from './config/db';
import { protect, adminOnly, teacherOnly } from './middleware/auth';
import * as userController from './controllers/userController';
import * as examController from './controllers/examController';
import * as notificationController from './controllers/notificationController';
import * as branchController from './controllers/branchController';
import User from './models/User';
import teacherRoutes from './routes/teacherRoutes';

// Error handling interface
interface ErrorWithStatus extends Error {
  status?: number;
  statusCode?: number;
}

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

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

// Request logging middleware
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Auth Routes
// Auth Routes
app.post('/api/users/login', userController.loginUser as unknown as express.RequestHandler);
app.post('/api/users/register', userController.registerUser as express.RequestHandler);

// Protected Routes
app.use('/api/users', protect as unknown as express.RequestHandler);
app.get('/api/users/profile', userController.getUserProfile as express.RequestHandler);
app.put('/api/users/profile', userController.updateUserProfile as express.RequestHandler);

// Teacher Routes
app.get('/api/users/teachers', protect as unknown as express.RequestHandler, userController.getTeachers as unknown as express.RequestHandler);

// Admin Routes
app.use('/api/admin', protect as unknown as express.RequestHandler, adminOnly as unknown as express.RequestHandler);

// Exam Routes
app.post('/api/exams', examController.createExam as unknown as express.RequestHandler);
app.get('/api/exams/:branch', examController.getExamsByBranch as unknown as express.RequestHandler);
app.put('/api/exams/:id', examController.updateExam as unknown as express.RequestHandler);
app.delete('/api/exams/:id', examController.deleteExam as unknown as express.RequestHandler);
app.post('/api/exams/:id/allocate', examController.allocateTeachers as unknown as express.RequestHandler);

// Branch Routes
app.get('/api/branches', protect as unknown as express.RequestHandler, async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
  try {
    await branchController.getBranches(req, res);
  } catch (error) {
    next(error);
  }
}) as express.RequestHandler;
app.post('/api/branches', protect as unknown as express.RequestHandler, adminOnly as express.RequestHandler, async (req, res, next) => {
  try {
    await branchController.createBranch(req, res);
  } catch (error) {
    next(error);
  }
}) as express.RequestHandler;
app.get('/api/branches/:id', protect as unknown as express.RequestHandler, async (req, res, next) => {
  try {
    await branchController.getBranchById(req, res);
  } catch (error) {
    next(error);
  }
}) as express.RequestHandler;
app.put('/api/branches/:id', protect as unknown as express.RequestHandler, adminOnly as express.RequestHandler, async (req, res, next) => {
  try {
    await branchController.updateBranch(req, res);
  } catch (error) {
    next(error);
  }
}) as express.RequestHandler;
app.post('/api/branches/:id/teachers', protect as unknown as express.RequestHandler, adminOnly as express.RequestHandler, async (req, res, next) => {
  try {
    await branchController.addTeacherToBranch(req, res);
  } catch (error) {
    next(error);
  }
}) as express.RequestHandler;
app.delete('/api/branches/:id/teachers', protect as unknown as express.RequestHandler, adminOnly as express.RequestHandler, async (req, res, next) => {
  try {
    await branchController.removeTeacherFromBranch(req, res);
  } catch (error) {
    next(error);
  }
}) as express.RequestHandler;

// Teacher Routes
app.use('/api/teacher', protect as unknown as express.RequestHandler, teacherOnly as express.RequestHandler);
app.get('/api/exams/:branch', (examController.getExams as unknown as express.RequestHandler));
app.post('/api/exams/:id/blocks/:blockNumber/complete', (examController.completeBlock as unknown as express.RequestHandler));
app.get('/api/notifications', (notificationController.getUserNotifications as unknown as express.RequestHandler));
app.put('/api/notifications/:id/read', (notificationController.markAsRead as unknown as express.RequestHandler));
app.get('/api/remuneration', (async (req: express.Request, res: express.Response) => {
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