import React from 'react';

interface NotificationProps {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ type, title, message, onClose }) => {
  const typeClasses = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-400',
      title: 'text-green-800',
      message: 'text-green-700'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-400',
      title: 'text-red-800',
      message: 'text-red-700'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-400',
      title: 'text-blue-800',
      message: 'text-blue-700'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-400',
      title: 'text-yellow-800',
      message: 'text-yellow-700'
    }
  };

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠'
  };

  const currentType = typeClasses[type];

  return (
    <div className={`p-4 border rounded-lg ${currentType.bg} ${currentType.border} shadow-lg`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <span className={`text-lg ${currentType.icon}`}>{icons[type]}</span>
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${currentType.title}`}>{title}</h3>
          {message && (
            <p className={`mt-1 text-sm ${currentType.message}`}>{message}</p>
          )}
        </div>
        <div className="ml-auto pl-3">
          <button
            onClick={onClose}
            className={`inline-flex text-sm font-medium ${currentType.title} hover:opacity-75`}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notification; 