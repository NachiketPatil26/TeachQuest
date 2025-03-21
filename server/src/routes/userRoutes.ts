import * as express from 'express';
import {
  loginUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getTeachers,
  getTeacherAllocations
} from '../controllers/userController';
import { protect, adminOnly, teacherOnly } from '../middleware/auth';

const router = express.Router();

// Public routes
router.route('/login')
  .post(loginUser as unknown as express.RequestHandler);

router.route('/register')
  .post(registerUser as express.RequestHandler);

// Protected routes
router.route('/profile')
  .get(protect as unknown as express.RequestHandler, getUserProfile as express.RequestHandler)
  .put(protect as unknown as express.RequestHandler, updateUserProfile as express.RequestHandler);

// Teacher routes
router.route('/teachers')
  .get(protect as unknown as express.RequestHandler, getTeachers as unknown as express.RequestHandler);

// Teacher allocations route
router.route('/teachers/:id/allocations')
  .get(protect as unknown as express.RequestHandler, getTeacherAllocations as unknown as express.RequestHandler);

// Current teacher's allocations
router.route('/allocations')
  .get(protect as unknown as express.RequestHandler, teacherOnly as unknown as express.RequestHandler, getTeacherAllocations as unknown as express.RequestHandler);

export default router;