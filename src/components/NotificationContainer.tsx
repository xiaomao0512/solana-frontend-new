import React from 'react';
import Notification from './Notification';

interface NotificationItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface NotificationContainerProps {
  notifications: NotificationItem[];
  onRemove: (id: string) => void;
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notifications,
  onRemove
}) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => onRemove(notification.id)}
        />
      ))}
    </div>
  );
};

export default NotificationContainer; 