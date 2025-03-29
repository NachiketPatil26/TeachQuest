import * as express from 'express';
import {
  loginUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getTeachers,
  getTeacherAllocations,
  updateTeacherExpertise,
  updateTeacherPreferences,
  updateTeacher,
  createTeacher,
  deleteTeacher,
  getTeacherStats,
  getTeacherUpcomingDuties
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
  .get(protect as unknown as express.RequestHandler, getTeachers as unknown as express.RequestHandler)
  .post(protect as unknown as express.RequestHandler, adminOnly as unknown as express.RequestHandler, createTeacher as unknown as express.RequestHandler);

// Update teacher route
router.route('/teachers/:id')
  .put(protect as unknown as express.RequestHandler, adminOnly as unknown as express.RequestHandler, updateTeacher as unknown as express.RequestHandler)
  .delete(protect as unknown as express.RequestHandler, adminOnly as unknown as express.RequestHandler, deleteTeacher as unknown as express.RequestHandler);

// Teacher allocations route
router.route('/teachers/:id/allocations')
  .get(protect as unknown as express.RequestHandler, getTeacherAllocations as unknown as express.RequestHandler);

// Current teacher's allocations
router.route('/allocations')
  .get(protect as unknown as express.RequestHandler, teacherOnly as unknown as express.RequestHandler, getTeacherAllocations as unknown as express.RequestHandler);

// Teacher expertise routes
router.route('/teachers/:id/expertise')
  .put(protect as unknown as express.RequestHandler, updateTeacherExpertise as unknown as express.RequestHandler);

// Teacher preferences routes
router.route('/teachers/:id/preferences')
  .put(protect as unknown as express.RequestHandler, updateTeacherPreferences as unknown as express.RequestHandler);

// Current teacher's expertise
router.route('/expertise')
  .put(protect as unknown as express.RequestHandler, teacherOnly as unknown as express.RequestHandler, updateTeacherExpertise as unknown as express.RequestHandler);

// Current teacher's preferences
router.route('/preferences')
  .put(protect as unknown as express.RequestHandler, teacherOnly as unknown as express.RequestHandler, updateTeacherPreferences as unknown as express.RequestHandler);

// Current teacher's statistics
router.route('/teachers/me/stats')
  .get(protect as unknown as express.RequestHandler, teacherOnly as unknown as express.RequestHandler, getTeacherStats as unknown as express.RequestHandler);

// Current teacher's upcoming duties
router.route('/teachers/me/duties/upcoming')
  .get(protect as unknown as express.RequestHandler, teacherOnly as unknown as express.RequestHandler, getTeacherUpcomingDuties as unknown as express.RequestHandler);

// Specific teacher's upcoming duties
router.route('/teachers/:id/duties/upcoming')
  .get(protect as unknown as express.RequestHandler, getTeacherUpcomingDuties as unknown as express.RequestHandler);

export default router;