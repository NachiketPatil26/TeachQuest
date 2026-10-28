import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Notification from '../models/Notification';

const NOTIFICATION_TYPES = ['exam_allocation', 'exam_update', 'exam_cancellation'];

// Get notifications for the logged-in teacher
export const getTeacherNotifications = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;

    if (!teacherId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const notifications = await Notification.find({ teacherId })
      .populate('examId', 'subject date startTime endTime')
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

// Create a notification for a teacher (used by admin while allocating)
export const createNotification = async (req: Request, res: Response) => {
  try {
    const { user, title, message, type, relatedTo } = req.body;
    const examId = relatedTo?.id;

    if (!user || !title || !message || !examId) {
      return res.status(400).json({ message: 'User, title, message and exam are required fields' });
    }

    if (!mongoose.Types.ObjectId.isValid(user) || !mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({ message: 'Invalid user or exam ID' });
    }

    const notification = await Notification.create({
      teacherId: user,
      examId,
      title,
      message,
      type: NOTIFICATION_TYPES.includes(type) ? type : 'exam_allocation'
    });

    res.status(201).json(notification);
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ message: 'Failed to create notification' });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    const teacherId = req.user?.id;

    const notification = await Notification.findOne({
      _id: notificationId,
      teacherId
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ message: 'Failed to update notification' });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;

    await Notification.updateMany(
      { teacherId, read: false },
      { read: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ message: 'Failed to update notifications' });
  }
};
