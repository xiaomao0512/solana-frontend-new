import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useNotificationContext } from '../contexts/NotificationContext';
import { RentalContractClient, PaymentMethod } from '../utils/contract';
import { PublicKey } from '@solana/web3.js';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';

const RentalTest = () => {
  const { isConnected, walletAddress } = useWallet();
  const { success, error: showError, info } = useNotificationContext();
  
  const [isLoading, setIsLoading] = useState(false);
  const [contractClient, setContractClient] = useState<RentalContractClient | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('SOL');
  const [showRentDialog, setShowRentDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  // 模擬房源資料
  const mockListing = {
    id: '1',
    title: '台北信義區精緻套房',
    location: '台北市信義區信義路五段',
    price: 25000, // SOL (lamports)
    deposit: 50000, // SOL (lamports)
    description: '位於信義區的精緻套房，交通便利，設施完善。',
    rooms: 1,
    bathrooms: 1,
    size: 25,
    floor: 8,
    totalFloors: 12,
    contractLength: 12,
    amenities: ['冷氣', '冰箱', '洗衣機', '網路', '電視'],
    landlord: '11111111111111111111111111111111', // 模擬房東地址
    listingPda: '22222222222222222222222222222222', // 模擬房源 PDA
  };

  // 模擬租約資料
  const mockRental = {
    id: '1',
    price: 25000, // SOL (lamports)
    landlord: '11111111111111111111111111111111',
    rentalPda: '33333333333333333333333333333333',
  };

  // 初始化合約客戶端
  useEffect(() => {
    if (isConnected && walletAddress) {
      // 這裡需要從錢包適配器獲取錢包實例
      // 暫時使用模擬的合約客戶端
      setContractClient(null);
      info('錢包已連接', '可以開始測試租用和支付功能');
    }
  }, [isConnected, walletAddress, info]);

  // 處理租用確認
  const handleRentConfirm = async () => {
    if (!isConnected) {
      showError('請先連接錢包');
      return;
    }

    setIsLoading(true);
    try {
      // 模擬租用過程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      success('租用成功', `房源 "${mockListing.title}" 已成功租用，智能合約已部署`);
      setShowRentDialog(false);
    } catch (err) {
      showError('租用失敗', err instanceof Error ? err.message : '請檢查錢包餘額');
    } finally {
      setIsLoading(false);
    }
  };

  // 處理支付確認
  const handlePaymentConfirm = async () => {
    if (!isConnected) {
      showError('請先連接錢包');
      return;
    }

    setIsLoading(true);
    try {
      // 模擬支付過程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      success('支付成功', `租金 ${mockRental.price.toLocaleString()} lamports 已成功支付`);
      setShowPaymentDialog(false);
    } catch (err) {
      showError('支付失敗', err instanceof Error ? err.message : '請檢查錢包餘額');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">租用功能測試</h1>

        {!isConnected && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">請先連接錢包以測試功能</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* 租用測試 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">租用測試</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">房源資訊</h3>
                <p className="text-gray-600">{mockListing.title}</p>
                <p className="text-gray-600">{mockListing.location}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">費用明細</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>月租金:</span>
                    <span className="font-semibold">{mockListing.price.toLocaleString()} lamports</span>
                  </div>
                  <div className="flex justify-between">
                    <span>押金:</span>
                    <span className="font-semibold">{mockListing.deposit.toLocaleString()} lamports</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>總計:</span>
                      <span>{(mockListing.price + mockListing.deposit).toLocaleString()} lamports</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">支付方式</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="SOL"
                      checked={selectedPaymentMethod === 'SOL'}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value as PaymentMethod)}
                      className="mr-2"
                    />
                    SOL (Solana)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="USDT"
                      checked={selectedPaymentMethod === 'USDT'}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value as PaymentMethod)}
                      className="mr-2"
                    />
                    USDT (Tether)
                  </label>
                </div>
              </div>

              <button
                onClick={() => setShowRentDialog(true)}
                disabled={!isConnected}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                測試租用
              </button>
            </div>
          </div>

          {/* 支付測試 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">租金支付測試</h2>
            
            <div className="space-y-4">
                              <div>
                  <h3 className="font-semibold mb-2">租約資訊</h3>
                  <p className="text-gray-600">租約 ID: {mockRental.id}</p>
                  <p className="text-gray-600">房東: {mockRental.landlord.slice(0, 8)}...</p>
                </div>
              
              <div>
                <h3 className="font-semibold mb-2">支付金額</h3>
                <div className="text-2xl font-bold text-blue-600">
                  {mockRental.price.toLocaleString()} lamports
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">支付方式</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="SOL"
                      checked={selectedPaymentMethod === 'SOL'}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value as PaymentMethod)}
                      className="mr-2"
                    />
                    SOL (Solana)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="USDT"
                      checked={selectedPaymentMethod === 'USDT'}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value as PaymentMethod)}
                      className="mr-2"
                    />
                    USDT (Tether)
                  </label>
                </div>
              </div>

              <button
                onClick={() => setShowPaymentDialog(true)}
                disabled={!isConnected}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                測試支付
              </button>
            </div>
          </div>
        </div>

        {/* 功能說明 */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">功能說明</h2>
          <div className="space-y-2 text-blue-800">
            <p>• <strong>租用功能:</strong> 模擬租用房源的完整流程，包括智能合約部署和支付</p>
            <p>• <strong>支付功能:</strong> 支援 SOL 和 USDT 兩種支付方式</p>
            <p>• <strong>智能合約:</strong> 自動執行租約條款和租金支付</p>
            <p>• <strong>預言機驗證:</strong> 使用 Switchboard 驗證房源資訊</p>
            <p>• <strong>託管合約:</strong> 安全的押金管理機制</p>
          </div>
        </div>

        {/* 租用確認對話框 */}
        <ConfirmDialog
          isOpen={showRentDialog}
          title="確認租用"
          message={`確定要租用這個房源嗎？\n\n房源: ${mockListing.title}\n總費用: ${(mockListing.price + mockListing.deposit).toLocaleString()} lamports\n支付方式: ${selectedPaymentMethod}`}
          confirmText="確認租用"
          cancelText="取消"
          type="info"
          onConfirm={handleRentConfirm}
          onCancel={() => setShowRentDialog(false)}
          isLoading={isLoading}
        />

        {/* 支付確認對話框 */}
        <ConfirmDialog
          isOpen={showPaymentDialog}
          title="確認支付租金"
          message={`確定要支付租金嗎？\n\n租金金額: ${mockRental.price.toLocaleString()} lamports\n支付方式: ${selectedPaymentMethod}`}
          confirmText="確認支付"
          cancelText="取消"
          type="info"
          onConfirm={handlePaymentConfirm}
          onCancel={() => setShowPaymentDialog(false)}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default RentalTest; 