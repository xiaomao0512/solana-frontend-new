import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useNotificationContext } from '../contexts/NotificationContext';
import ConfirmDialog from './ConfirmDialog';
import RentalHistory from './RentalHistory';
import RentalNotifications from './RentalNotifications';
import { PublicKey } from '@solana/web3.js';

interface RentalManagementProps {
  rental: {
    id: string;
    title: string;
    address: string;
    price: number;
    deposit: number;
    status: string;
    startDate: string;
    endDate: string;
    nextPayment: string;
    contractAddress: string;
    landlord: string;
    tenant: string;
    paymentMethod: 'SOL' | 'USDT';
    type: 'tenant' | 'landlord';
  };
  onClose: () => void;
  onUpdate: () => void;
}

const RentalManagement: React.FC<RentalManagementProps> = ({
  rental,
  onClose,
  onUpdate
}) => {
  const { isConnected, walletAddress } = useWallet();
  const { success, error: showError } = useNotificationContext();
  
  const [activeTab, setActiveTab] = useState('details');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<string>('');
  const [confirmMessage, setConfirmMessage] = useState<string>('');
  const [contractClient, setContractClient] = useState<any>(null);

  // 租約調整狀態
  const [adjustmentData, setAdjustmentData] = useState({
    newPrice: rental.price,
    newEndDate: rental.endDate,
    reason: ''
  });

  // 續約狀態
  const [renewalData, setRenewalData] = useState({
    months: 12,
    newPrice: rental.price,
    autoRenew: false
  });

  // 轉讓狀態
  const [transferData, setTransferData] = useState({
    newTenantAddress: '',
    transferFee: 0,
    reason: ''
  });

  // 模擬歷史記錄資料
  const mockHistoryEvents = [
    {
      id: '1',
      type: 'created' as const,
      title: '租約建立',
      description: '租約已成功建立並開始生效',
      timestamp: '2024-01-01T10:00:00Z',
      status: 'completed' as const,
      txHash: '0x1234567890abcdef'
    },
    {
      id: '2',
      type: 'payment' as const,
      title: '租金支付',
      description: '成功支付月租金',
      timestamp: '2024-02-01T09:30:00Z',
      amount: 25000,
      currency: 'SOL',
      status: 'completed' as const,
      txHash: '0xabcdef1234567890'
    },
    {
      id: '3',
      type: 'adjustment' as const,
      title: '租約調整',
      description: '租金調整申請已提交，等待房東確認',
      timestamp: '2024-02-15T14:20:00Z',
      status: 'pending' as const
    }
  ];

  // 模擬通知設定
  const mockNotificationSettings = [
    {
      id: '1',
      type: 'payment_due' as const,
      title: '租金到期提醒',
      description: '在租金到期前提醒您支付',
      enabled: true,
      daysInAdvance: 7,
      channels: ['email', 'push'] as ('email' | 'push' | 'sms')[]
    },
    {
      id: '2',
      type: 'contract_expiry' as const,
      title: '租約到期提醒',
      description: '在租約到期前提醒您續約或搬遷',
      enabled: true,
      daysInAdvance: 30,
      channels: ['email', 'push', 'sms'] as ('email' | 'push' | 'sms')[]
    },
    {
      id: '3',
      type: 'rental_adjustment' as const,
      title: '租約調整通知',
      description: '當租約條款發生變更時通知您',
      enabled: true,
      daysInAdvance: 1,
      channels: ['email', 'push'] as ('email' | 'push' | 'sms')[]
    },
    {
      id: '4',
      type: 'maintenance' as const,
      title: '維修通知',
      description: '當有維修安排時通知您',
      enabled: false,
      daysInAdvance: 3,
      channels: ['email'] as ('email' | 'push' | 'sms')[]
    },
    {
      id: '5',
      type: 'security_deposit' as const,
      title: '押金處理通知',
      description: '當押金退還或扣除時通知您',
      enabled: true,
      daysInAdvance: 1,
      channels: ['email', 'push'] as ('email' | 'push' | 'sms')[]
    }
  ];

  const handleAction = (action: string, message: string) => {
    setConfirmAction(action);
    setConfirmMessage(message);
    setShowConfirmDialog(true);
  };

  const executeAction = async () => {
    if (!contractClient) {
      showError('合約客戶端未初始化');
      return;
    }

    setIsLoading(true);
    try {
      let txHash = '';
      
      switch (confirmAction) {
        case 'terminate':
          txHash = await handleTerminate();
          break;
        case 'renew':
          txHash = await handleRenew();
          break;
        case 'transfer':
          txHash = await handleTransfer();
          break;
        case 'adjust':
          txHash = await handleAdjust();
          break;
        case 'extend':
          txHash = await handleExtend();
          break;
        default:
          break;
      }
      
      success('操作成功', `租約已成功更新。交易哈希: ${txHash.slice(0, 8)}...`);
      onUpdate();
      onClose();
    } catch (err) {
      showError('操作失敗', err instanceof Error ? err.message : '請稍後再試');
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const handleTerminate = async (): Promise<string> => {
    if (!contractClient) {
      throw new Error('合約客戶端未初始化');
    }
    // 這裡需要實現真實的終止租約邏輯
    // 暫時模擬
    await new Promise(resolve => setTimeout(resolve, 2000));
    return '0x' + Math.random().toString(16).substr(2, 64);
  };

  const handleRenew = async (): Promise<string> => {
    if (!contractClient) {
      throw new Error('合約客戶端未初始化');
    }
    // 使用真實的續約合約方法
    return await contractClient.renewRental(
      new PublicKey(rental.contractAddress),
      renewalData.months,
      renewalData.newPrice,
      renewalData.autoRenew
    );
  };

  const handleTransfer = async (): Promise<string> => {
    if (!contractClient) {
      throw new Error('合約客戶端未初始化');
    }
    // 使用真實的轉讓合約方法
    return await contractClient.transferRental(
      new PublicKey(rental.contractAddress),
      new PublicKey(transferData.newTenantAddress),
      transferData.transferFee
    );
  };

  const handleAdjust = async (): Promise<string> => {
    if (!contractClient) {
      throw new Error('合約客戶端未初始化');
    }
    // 使用真實的調整合約方法
    return await contractClient.adjustRental(
      new PublicKey(rental.contractAddress),
      adjustmentData.newPrice,
      new Date(adjustmentData.newEndDate),
      adjustmentData.reason
    );
  };

  const handleExtend = async (): Promise<string> => {
    if (!contractClient) {
      throw new Error('合約客戶端未初始化');
    }
    // 使用真實的延期合約方法
    return await contractClient.extendRental(
      new PublicKey(rental.contractAddress),
      7, // 暫時固定為7天
      '延期申請' // 暫時固定原因
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW');
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "expired": return "bg-red-100 text-red-800";
      case "terminated": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "租約中";
      case "pending": return "待確認";
      case "expired": return "已到期";
      case "terminated": return "已終止";
      default: return "未知";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* 標題欄 */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold">租約管理 - {rental.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 標籤頁 */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'details', label: '租約詳情' },
              { id: 'adjust', label: '租約調整' },
              { id: 'renew', label: '續約' },
              { id: 'transfer', label: '轉讓' },
              { id: 'extend', label: '延期' },
              { id: 'history', label: '歷史記錄' },
              { id: 'notifications', label: '通知設定' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* 內容區域 */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* 租約詳情 */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">基本資訊</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">房源標題:</span>
                      <span className="font-medium">{rental.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">地址:</span>
                      <span className="font-medium">{rental.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">狀態:</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(rental.status)}`}>
                        {getStatusText(rental.status)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">您的角色:</span>
                      <span className="font-medium">{rental.type === 'tenant' ? '租客' : '房東'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">財務資訊</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">月租金:</span>
                      <span className="font-medium">${formatPrice(rental.price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">押金:</span>
                      <span className="font-medium">${formatPrice(rental.deposit)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">支付方式:</span>
                      <span className="font-medium">{rental.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">下次付款:</span>
                      <span className="font-medium">{formatDate(rental.nextPayment)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">租期資訊</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">開始日期:</span>
                      <span className="font-medium">{formatDate(rental.startDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">結束日期:</span>
                      <span className="font-medium">{formatDate(rental.endDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">合約地址:</span>
                      <span className="font-medium text-sm">{rental.contractAddress}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">操作選項</h3>
                  <div className="space-y-3">
                    {rental.status === 'active' && (
                      <>
                        <button
                          onClick={() => handleAction('terminate', '確定要終止這個租約嗎？此操作不可逆轉。')}
                          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          終止租約
                        </button>
                        <button
                          onClick={() => setActiveTab('adjust')}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          調整租約
                        </button>
                        <button
                          onClick={() => setActiveTab('renew')}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          續約
                        </button>
                        {rental.type === 'tenant' && (
                          <button
                            onClick={() => setActiveTab('transfer')}
                            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            轉讓租約
                          </button>
                        )}
                        <button
                          onClick={() => setActiveTab('extend')}
                          className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                        >
                          延期
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 租約調整 */}
          {activeTab === 'adjust' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">調整租約條款</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    新租金 (${rental.paymentMethod})
                  </label>
                  <input
                    type="number"
                    value={adjustmentData.newPrice}
                    onChange={(e) => setAdjustmentData({
                      ...adjustmentData,
                      newPrice: parseInt(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    新結束日期
                  </label>
                  <input
                    type="date"
                    value={adjustmentData.newEndDate}
                    onChange={(e) => setAdjustmentData({
                      ...adjustmentData,
                      newEndDate: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  調整原因
                </label>
                <textarea
                  value={adjustmentData.reason}
                  onChange={(e) => setAdjustmentData({
                    ...adjustmentData,
                    reason: e.target.value
                  })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="請說明調整租約的原因..."
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setActiveTab('details')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => handleAction('adjust', '確定要調整租約條款嗎？此操作需要雙方同意。')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  提交調整
                </button>
              </div>
            </div>
          )}

          {/* 續約 */}
          {activeTab === 'renew' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">續約設定</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    續約期數 (月)
                  </label>
                  <select
                    value={renewalData.months}
                    onChange={(e) => setRenewalData({
                      ...renewalData,
                      months: parseInt(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={6}>6 個月</option>
                    <option value={12}>12 個月</option>
                    <option value={18}>18 個月</option>
                    <option value={24}>24 個月</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    新租金 (${rental.paymentMethod})
                  </label>
                  <input
                    type="number"
                    value={renewalData.newPrice}
                    onChange={(e) => setRenewalData({
                      ...renewalData,
                      newPrice: parseInt(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoRenew"
                  checked={renewalData.autoRenew}
                  onChange={(e) => setRenewalData({
                    ...renewalData,
                    autoRenew: e.target.checked
                  })}
                  className="mr-2"
                />
                <label htmlFor="autoRenew" className="text-sm text-gray-700">
                  啟用自動續約
                </label>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setActiveTab('details')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => handleAction('renew', '確定要續約嗎？新租約將從原租約結束後開始。')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  確認續約
                </button>
              </div>
            </div>
          )}

          {/* 轉讓 */}
          {activeTab === 'transfer' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">轉讓租約</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    新租客錢包地址
                  </label>
                  <input
                    type="text"
                    value={transferData.newTenantAddress}
                    onChange={(e) => setTransferData({
                      ...transferData,
                      newTenantAddress: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="輸入新租客的 Solana 錢包地址"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    轉讓費用 (${rental.paymentMethod})
                  </label>
                  <input
                    type="number"
                    value={transferData.transferFee}
                    onChange={(e) => setTransferData({
                      ...transferData,
                      transferFee: parseInt(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    轉讓原因
                  </label>
                  <textarea
                    value={transferData.reason}
                    onChange={(e) => setTransferData({
                      ...transferData,
                      reason: e.target.value
                    })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="請說明轉讓租約的原因..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setActiveTab('details')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => handleAction('transfer', '確定要轉讓租約嗎？此操作需要房東同意。')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  提交轉讓
                </button>
              </div>
            </div>
          )}

          {/* 延期 */}
          {activeTab === 'extend' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">延期申請</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  延期功能允許您在租約到期前申請延長租期，通常用於特殊情況如搬家困難等。
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    延期天數
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value={7}>7 天</option>
                    <option value={14}>14 天</option>
                    <option value={30}>30 天</option>
                    <option value={60}>60 天</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    延期原因
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">請選擇原因</option>
                    <option value="moving">搬家困難</option>
                    <option value="work">工作變動</option>
                    <option value="personal">個人原因</option>
                    <option value="other">其他</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  詳細說明
                </label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="請詳細說明需要延期的原因..."
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setActiveTab('details')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => handleAction('extend', '確定要申請延期嗎？此申請需要房東同意。')}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  提交申請
                </button>
              </div>
            </div>
          )}

          {/* 歷史記錄 */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">租約歷史記錄</h3>
              <RentalHistory
                rentalId={rental.id}
                events={mockHistoryEvents}
                className=""
              />
            </div>
          )}

          {/* 通知設定 */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">通知設定</h3>
              <RentalNotifications
                rentalId={rental.id}
                settings={mockNotificationSettings}
                onSettingsChange={(newSettings) => {
                  // 這裡可以處理設定變更
                  console.log('Settings updated:', newSettings);
                }}
                className=""
              />
            </div>
          )}
        </div>

        {/* 確認對話框 */}
        <ConfirmDialog
          isOpen={showConfirmDialog}
          title="確認操作"
          message={confirmMessage}
          confirmText="確認"
          cancelText="取消"
          type="warning"
          onConfirm={executeAction}
          onCancel={() => setShowConfirmDialog(false)}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default RentalManagement; 