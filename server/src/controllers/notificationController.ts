import { Request, Response } from 'express';
import Notification from '../models/Notification';

// Get all notifications for a user
export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await Notification.find({ user: req.params.userId })
      .populate('exam', 'name subject date startTime')
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get unread notifications count
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const count = await Notification.countDocuments({
      user: req.params.userId,
      read: false
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark notification as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }

    if (notification.user.toString() !== req.params.userId) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    await Notification.updateMany(
      { user: req.params.userId, read: false },
      { read: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete notification
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }

    if (notification.user.toString() !== req.params.userId) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    await Notification.deleteOne({ _id: req.params.id });
    res.json({ message: 'Notification removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};