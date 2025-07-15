import React from 'react';

interface RentalEvent {
  id: string;
  type: 'created' | 'payment' | 'adjustment' | 'renewal' | 'transfer' | 'termination' | 'extension';
  title: string;
  description: string;
  timestamp: string;
  amount?: number;
  currency?: string;
  status: 'completed' | 'pending' | 'failed';
  txHash?: string;
}

interface RentalHistoryProps {
  rentalId: string;
  events: RentalEvent[];
  className?: string;
}

const RentalHistory: React.FC<RentalHistoryProps> = ({ 
  rentalId, 
  events, 
  className = '' 
}) => {
  const getEventIcon = (type: RentalEvent['type']) => {
    switch (type) {
      case 'created':
        return '📋';
      case 'payment':
        return '💰';
      case 'adjustment':
        return '⚙️';
      case 'renewal':
        return '🔄';
      case 'transfer':
        return '🔄';
      case 'termination':
        return '❌';
      case 'extension':
        return '⏰';
      default:
        return '📝';
    }
  };

  const getEventColor = (type: RentalEvent['type']) => {
    switch (type) {
      case 'created':
        return 'bg-blue-100 text-blue-800';
      case 'payment':
        return 'bg-green-100 text-green-800';
      case 'adjustment':
        return 'bg-yellow-100 text-yellow-800';
      case 'renewal':
        return 'bg-purple-100 text-purple-800';
      case 'transfer':
        return 'bg-indigo-100 text-indigo-800';
      case 'termination':
        return 'bg-red-100 text-red-800';
      case 'extension':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: RentalEvent['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: RentalEvent['status']) => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'pending':
        return '處理中';
      case 'failed':
        return '失敗';
      default:
        return '未知';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-TW');
  };

  const formatAmount = (amount: number, currency: string) => {
    return `${amount.toLocaleString()} ${currency}`;
  };

  const shortenHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-6">租約歷史記錄</h3>
      
      {events.length === 0 ? (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-2 text-gray-500">還沒有歷史記錄</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={event.id} className="relative">
              {/* 時間線連接線 */}
              {index < events.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-200"></div>
              )}
              
              <div className="flex items-start space-x-4">
                {/* 事件圖標 */}
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${getEventColor(event.type)}`}>
                    {getEventIcon(event.type)}
                  </div>
                </div>
                
                {/* 事件內容 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">{event.title}</h4>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(event.status)}`}>
                        {getStatusText(event.status)}
                      </span>
                      <span className="text-xs text-gray-500">{formatDate(event.timestamp)}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                  
                  {/* 金額資訊 */}
                  {event.amount && event.currency && (
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        金額: {formatAmount(event.amount, event.currency)}
                      </span>
                    </div>
                  )}
                  
                  {/* 交易哈希 */}
                  {event.txHash && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">交易:</span>
                      <a
                        href={`https://solscan.io/tx/${event.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 font-mono"
                      >
                        {shortenHash(event.txHash)}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* 匯出歷史記錄 */}
      {events.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              共 {events.length} 筆記錄
            </span>
            <button className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
              匯出記錄
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalHistory; 