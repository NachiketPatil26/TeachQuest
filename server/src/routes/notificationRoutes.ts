import express from 'express';
import { protect } from '../middleware/authMiddleware';
// import {
//   getTeacherNotifications,
//   markNotificationAsRead,
//   markAllNotificationsAsRead
// } from '../controllers/notificationController';

const router = express.Router();

// // All routes are protected and require authentication
// router.use(protect);

// // Get notifications for the logged-in teacher
// router.get('/', getTeacherNotifications);

// // Mark a specific notification as read
// router.patch('/:notificationId/read', markNotificationAsRead);

// // Mark all notifications as read
// router.patch('/mark-all-read', markAllNotificationsAsRead);

export default router;