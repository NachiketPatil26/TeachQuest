import React, { useState, useEffect } from 'react';
import { Bell, Check, Clock, Calendar } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  createdAt: string;
  relatedTo?: {
    model: string;
    id: string;
  };
}

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetch(`/api/notifications/${user?.id}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch notifications');
        }
        setNotifications(data);
      } catch (err) {
        setError('Failed to load notifications');
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id]);

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Bell className="h-6 w-6 text-blue-500" />;
      case 'success':
        return <Check className="h-6 w-6 text-green-500" />;
      case 'warning':
        return <Clock className="h-6 w-6 text-yellow-500" />;
      default:
        return <Calendar className="h-6 w-6 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9FC0AE]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
            <p className="mt-1 text-sm text-gray-500">
              Stay updated with your exam duty assignments and other important information
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-8" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
          {notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
              <p className="mt-1 text-sm text-gray-500">You're all caught up!</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-6 ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
                onClick={() => !notification.read && markAsRead(notification._id)}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {notification.message}
                    </p>
                    <div className="mt-2 text-xs text-gray-400">
                      {new Date(notification.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  {!notification.read && (
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                        New
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
