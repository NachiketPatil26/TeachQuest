import * as express from 'express';
import { protect, adminOnly } from '../middleware/auth';
import {
  getTeacherNotifications,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../controllers/notificationController';

const router = express.Router();

// Get notifications for the logged-in teacher
router.route('/')
  .get(protect as unknown as express.RequestHandler, getTeacherNotifications as unknown as express.RequestHandler)
  .post(protect as unknown as express.RequestHandler, adminOnly as express.RequestHandler, createNotification as unknown as express.RequestHandler);

// Mark all notifications as read
router.route('/mark-all-read')
  .put(protect as unknown as express.RequestHandler, markAllNotificationsAsRead as unknown as express.RequestHandler);

// Mark a specific notification as read
router.route('/:notificationId/read')
  .put(protect as unknown as express.RequestHandler, markNotificationAsRead as unknown as express.RequestHandler);

export default router;
