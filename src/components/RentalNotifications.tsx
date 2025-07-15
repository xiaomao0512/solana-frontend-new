import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useNotificationContext } from '../contexts/NotificationContext';

interface NotificationSetting {
  id: string;
  type: 'payment_due' | 'contract_expiry' | 'rental_adjustment' | 'maintenance' | 'security_deposit';
  title: string;
  description: string;
  enabled: boolean;
  daysInAdvance: number;
  channels: ('email' | 'push' | 'sms')[];
}

interface RentalNotificationsProps {
  rentalId: string;
  settings: NotificationSetting[];
  onSettingsChange: (settings: NotificationSetting[]) => void;
  className?: string;
}

const RentalNotifications: React.FC<RentalNotificationsProps> = ({
  rentalId,
  settings,
  onSettingsChange,
  className = ''
}) => {
  const { isConnected } = useWallet();
  const { success, error: showError } = useNotificationContext();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showTestNotification, setShowTestNotification] = useState(false);

  const getNotificationIcon = (type: NotificationSetting['type']) => {
    switch (type) {
      case 'payment_due':
        return '💰';
      case 'contract_expiry':
        return '📅';
      case 'rental_adjustment':
        return '⚙️';
      case 'maintenance':
        return '🔧';
      case 'security_deposit':
        return '🔒';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type: NotificationSetting['type']) => {
    switch (type) {
      case 'payment_due':
        return 'bg-red-100 text-red-800';
      case 'contract_expiry':
        return 'bg-orange-100 text-orange-800';
      case 'rental_adjustment':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'security_deposit':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleToggleSetting = (settingId: string) => {
    const updatedSettings = settings.map(setting => 
      setting.id === settingId 
        ? { ...setting, enabled: !setting.enabled }
        : setting
    );
    onSettingsChange(updatedSettings);
  };

  const handleDaysChange = (settingId: string, days: number) => {
    const updatedSettings = settings.map(setting => 
      setting.id === settingId 
        ? { ...setting, daysInAdvance: days }
        : setting
    );
    onSettingsChange(updatedSettings);
  };

  const handleChannelToggle = (settingId: string, channel: 'email' | 'push' | 'sms') => {
    const updatedSettings = settings.map(setting => {
      if (setting.id === settingId) {
        const channels = setting.channels.includes(channel)
          ? setting.channels.filter(c => c !== channel)
          : [...setting.channels, channel];
        return { ...setting, channels };
      }
      return setting;
    });
    onSettingsChange(updatedSettings);
  };

  const handleSaveSettings = async () => {
    if (!isConnected) {
      showError('請先連接錢包');
      return;
    }

    setIsLoading(true);
    try {
      // 模擬保存設定
      await new Promise(resolve => setTimeout(resolve, 1000));
      success('設定已保存', '通知設定已成功更新');
    } catch (err) {
      showError('保存失敗', err instanceof Error ? err.message : '請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    if (!isConnected) {
      showError('請先連接錢包');
      return;
    }

    setIsLoading(true);
    try {
      // 模擬發送測試通知
      await new Promise(resolve => setTimeout(resolve, 1000));
      success('測試通知已發送', '請檢查您的通知設定是否正常');
      setShowTestNotification(false);
    } catch (err) {
      showError('發送失敗', err instanceof Error ? err.message : '請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return '📧';
      case 'push':
        return '📱';
      case 'sms':
        return '📞';
      default:
        return '📢';
    }
  };

  const getChannelText = (channel: string) => {
    switch (channel) {
      case 'email':
        return '電子郵件';
      case 'push':
        return '推播通知';
      case 'sms':
        return '簡訊';
      default:
        return channel;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">通知設定</h3>
        <button
          onClick={() => setShowTestNotification(true)}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          發送測試通知
        </button>
      </div>

      <div className="space-y-6">
        {settings.map((setting) => (
          <div key={setting.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${getNotificationColor(setting.type)}`}>
                  {getNotificationIcon(setting.type)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{setting.title}</h4>
                  <p className="text-sm text-gray-600">{setting.description}</p>
                </div>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={setting.enabled}
                  onChange={() => handleToggleSetting(setting.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
            </div>

            {setting.enabled && (
              <div className="space-y-4">
                {/* 提前天數設定 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    提前通知天數
                  </label>
                  <select
                    value={setting.daysInAdvance}
                    onChange={(e) => handleDaysChange(setting.id, parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>1 天前</option>
                    <option value={3}>3 天前</option>
                    <option value={7}>7 天前</option>
                    <option value={14}>14 天前</option>
                    <option value={30}>30 天前</option>
                  </select>
                </div>

                {/* 通知管道設定 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    通知管道
                  </label>
                  <div className="space-y-2">
                    {(['email', 'push', 'sms'] as const).map((channel) => (
                      <label key={channel} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={setting.channels.includes(channel)}
                          onChange={() => handleChannelToggle(setting.id, channel)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-lg">{getChannelIcon(channel)}</span>
                        <span className="text-sm text-gray-700">{getChannelText(channel)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 保存按鈕 */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={handleSaveSettings}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? '保存中...' : '保存設定'}
        </button>
      </div>

      {/* 測試通知對話框 */}
      {showTestNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">發送測試通知</h3>
            <p className="text-gray-600 mb-6">
              這將向您發送一個測試通知，以確認您的通知設定是否正常運作。
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowTestNotification(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleTestNotification}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? '發送中...' : '發送測試'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalNotifications; 