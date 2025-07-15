import { useState, useCallback } from 'react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export const useNotification = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message?: string,
    duration: number = 5000
  ) => {
    const id = Date.now().toString();
    const notification: Notification = {
      id,
      type,
      title,
      message,
      duration
    };

    setNotifications(prev => [...prev, notification]);

    // 自動移除通知
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // 便利方法
  const success = useCallback((title: string, message?: string) => {
    addNotification('success', title, message);
  }, [addNotification]);

  const error = useCallback((title: string, message?: string) => {
    addNotification('error', title, message);
  }, [addNotification]);

  const warning = useCallback((title: string, message?: string) => {
    addNotification('warning', title, message);
  }, [addNotification]);

  const info = useCallback((title: string, message?: string) => {
    addNotification('info', title, message);
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    success,
    error,
    warning,
    info
  };
}; 