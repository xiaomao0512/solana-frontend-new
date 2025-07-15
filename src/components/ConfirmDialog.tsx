import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  type?: 'info' | 'warning' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  type = 'info',
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  if (!isOpen) return null;

  const typeClasses = {
    info: {
      icon: 'ℹ️',
      confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white'
    },
    warning: {
      icon: '⚠️',
      confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white'
    },
    danger: {
      icon: '🚨',
      confirmButton: 'bg-red-600 hover:bg-red-700 text-white'
    }
  };

  const currentType = typeClasses[type];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <span className="text-2xl mr-3">{currentType.icon}</span>
          <h3 className="text-xl font-semibold">{title}</h3>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700 whitespace-pre-line">{message}</p>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${currentType.confirmButton}`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" color="white" />
                <span className="ml-2">處理中...</span>
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog; 