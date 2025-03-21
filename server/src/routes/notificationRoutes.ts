import * as express from 'express';
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification
} from '../controllers/notificationController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.route('/user/:userId')
  .get(protect as unknown as express.RequestHandler, getUserNotifications as express.RequestHandler);

router.route('/user/:userId/unread')
  .get(protect as  unknown as express.RequestHandler, getUnreadCount as express.RequestHandler);

router.route('/:id/user/:userId')
  .put(protect as unknown as express.RequestHandler, markAsRead as express.RequestHandler)
  .delete(protect as unknown as express.RequestHandler, deleteNotification as express.RequestHandler);

router.route('/user/:userId/mark-all-read')
  .put(protect as unknown as express.RequestHandler, markAllAsRead as express.RequestHandler);

// Route for creating a new notification
router.route('/')
  .post(protect as unknown as express.RequestHandler, createNotification as unknown as express.RequestHandler);

export default router;