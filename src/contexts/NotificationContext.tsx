import React, { createContext, useContext, ReactNode } from 'react';
import { useNotification } from '../hooks/useNotification';

interface NotificationContextType {
  notifications: any[];
  addNotification: (notification: any) => void;
  removeNotification: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const notificationUtils = useNotification();

  return (
    <NotificationContext.Provider value={notificationUtils}>
      {children}
    </NotificationContext.Provider>
  );
}; 