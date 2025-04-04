// import { Request, Response } from 'express';
// import Notification from '../models/Notification';
// import Exam from '../models/Exam';
// import { UserPayload } from '../middleware/auth';

// interface AuthenticatedRequest extends Request {
//   user?: UserPayload;
// }

// // Get all notifications for a user
// export const getUserNotifications = async (req: Request, res: Response) => {
//   try {
//     const notifications = await Notification.find({ user: req.params.userId })
//       .populate('exam', 'name subject date startTime')
//       .sort({ createdAt: -1 });
//     res.json(notifications);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Get unread notifications count
// export const getUnreadCount = async (req: Request, res: Response) => {
//   try {
//     const count = await Notification.countDocuments({
//       user: req.params.userId,
//       read: false
//     });
//     res.json({ count });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Mark notification as read
// export const markAsRead = async (req: Request, res: Response) => {
//   try {
//     const notification = await Notification.findById(req.params.id);
//     if (!notification) {
//       res.status(404).json({ message: 'Notification not found' });
//       return;
//     }

//     if (notification.user.toString() !== req.params.userId) {
//       res.status(403).json({ message: 'Not authorized' });
//       return;
//     }

//     notification.read = true;
//     await notification.save();

//     res.json(notification);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Mark all notifications as read
// export const markAllAsRead = async (req: Request, res: Response) => {
//   try {
//     await Notification.updateMany(
//       { user: req.params.userId, read: false },
//       { read: true }
//     );
//     res.json({ message: 'All notifications marked as read' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Delete notification
// export const deleteNotification = async (req: Request, res: Response) => {
//   try {
//     const notification = await Notification.findById(req.params.id);
//     if (!notification) {
//       res.status(404).json({ message: 'Notification not found' });
//       return;
//     }

//     if (notification.user.toString() !== req.params.userId) {
//       res.status(403).json({ message: 'Not authorized' });
//       return;
//     }

//     await Notification.deleteOne({ _id: req.params.id });
//     res.json({ message: 'Notification removed' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Create a new notification
// export const createNotification = async (req: Request, res: Response) => {
//   try {
//     const { user, title, message, type, relatedTo } = req.body;
    
//     if (!user || !title || !message) {
//       return res.status(400).json({ message: 'User, title, and message are required fields' });
//     }

//     const notification = new Notification({
//       user,
//       title,
//       message,
//       type: type || 'info',
//       relatedTo
//     });

//     const savedNotification = await notification.save();
//     res.status(201).json(savedNotification);
//   } catch (error) {
//     console.error('Error creating notification:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Get notifications for a teacher
// export const getTeacherNotifications = async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const teacherId = req.user?.id;
    
//     if (!teacherId) {
//       return res.status(401).json({ message: 'Unauthorized' });
//     }

//     const notifications = await Notification.find({ teacherId })
//       .populate('examId', 'subject date startTime endTime')
//       .sort({ createdAt: -1 });

//     res.json(notifications);
//   } catch (error) {
//     console.error('Get notifications error:', error);
//     res.status(500).json({ message: 'Failed to fetch notifications' });
//   }
// };

// // Mark notification as read
// export const markNotificationAsRead = async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const { notificationId } = req.params;
//     const teacherId = req.user?.id;

//     if (!teacherId) {
//       return res.status(401).json({ message: 'Unauthorized' });
//     }

//     const notification = await Notification.findOne({
//       _id: notificationId,
//       teacherId
//     });

//     if (!notification) {
//       return res.status(404).json({ message: 'Notification not found' });
//     }

//     notification.read = true;
//     await notification.save();

//     res.json(notification);
//   } catch (error) {
//     console.error('Mark notification as read error:', error);
//     res.status(500).json({ message: 'Failed to update notification' });
//   }
// };

// // Mark all notifications as read
// export const markAllNotificationsAsRead = async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const teacherId = req.user?.id;

//     if (!teacherId) {
//       return res.status(401).json({ message: 'Unauthorized' });
//     }

//     await Notification.updateMany(
//       { teacherId, read: false },
//       { read: true }
//     );

//     res.json({ message: 'All notifications marked as read' });
//   } catch (error) {
//     console.error('Mark all notifications as read error:', error);
//     res.status(500).json({ message: 'Failed to update notifications' });
//   }
// };