import { useState, useCallback, useRef } from 'react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

export const useNotification = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const counterRef = useRef(0);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    // 使用時間戳 + 計數器確保唯一性
    const id = `${Date.now()}-${++counterRef.current}`;
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);

    // 自動移除通知
    const duration = notification.duration || 5000;
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const success = useCallback((title: string, message?: string) => {
    addNotification({ type: 'success', title, message });
  }, [addNotification]);

  const error = useCallback((title: string, message?: string) => {
    addNotification({ type: 'error', title, message, duration: 8000 });
  }, [addNotification]);

  const info = useCallback((title: string, message?: string) => {
    addNotification({ type: 'info', title, message });
  }, [addNotification]);

  const warning = useCallback((title: string, message?: string) => {
    addNotification({ type: 'warning', title, message });
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    info,
    warning
  };
}; 