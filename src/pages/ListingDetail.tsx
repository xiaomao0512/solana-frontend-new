import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useWallet } from "../contexts/WalletContext";
import { useNotificationContext } from "../contexts/NotificationContext";
import { RentalContractClient, PaymentMethod } from "../utils/contract";
import { PublicKey } from "@solana/web3.js";
import LoadingSpinner from "../components/LoadingSpinner";
import ConfirmDialog from "../components/ConfirmDialog";

// 模擬房源詳細資料
const mockListingDetail = {
  id: 1,
  title: "台北信義區精緻套房",
  location: "台北市信義區信義路五段",
  price: 25000,
  size: 25,
  rooms: 1,
  bathrooms: 1,
  floor: 8,
  totalFloors: 12,
  images: [
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"
  ],
  description: "位於信義區精華地段，近捷運站，生活機能便利。房間採光良好，設備齊全，適合上班族居住。周邊有便利商店、餐廳、銀行等生活設施，交通便利。",
  amenities: ["冷氣", "冰箱", "洗衣機", "網路", "電視", "衣櫃", "書桌", "熱水器"],
  landlord: {
    address: "0x1234567890abcdef1234567890abcdef12345678",
    name: "張房東",
    rating: 4.8,
    totalRentals: 15,
    verified: true
  },
  available: true,
  deposit: 50000,
  contractLength: 12,
  moveInDate: "2024-02-01",
  isVerified: true,
  createdAt: "2024-01-15",
  contractAddress: "0xabcdef1234567890abcdef1234567890abcdef12"
};

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isConnected, walletAddress, balance } = useWallet();
  const { success, error: showError, info } = useNotificationContext();
  
  const [currentImage, setCurrentImage] = useState(0);
  const [showRentModal, setShowRentModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('SOL');
  const [isLoading, setIsLoading] = useState(false);
  const [contractClient, setContractClient] = useState<RentalContractClient | null>(null);
  const [listing, setListing] = useState(mockListingDetail);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % listing.images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => 
      prev === 0 ? listing.images.length - 1 : prev - 1
    );
  };

  // 初始化合約客戶端
  useEffect(() => {
    if (isConnected && walletAddress) {
      // 這裡需要從錢包適配器獲取錢包實例
      // 暫時使用模擬的合約客戶端
      setContractClient(null);
    }
  }, [isConnected, walletAddress]);

  // 檢查餘額是否足夠
  const checkBalance = () => {
    const totalAmount = listing.price + listing.deposit;
    if (selectedPaymentMethod === 'SOL') {
      return balance.SOL >= totalAmount / 1000000000; // 轉換為 SOL
    } else {
      return balance.USDC >= totalAmount;
    }
  };

  // 處理租用確認
  const handleRentConfirm = async () => {
    if (!isConnected) {
      showError('請先連接錢包');
      return;
    }

    if (!checkBalance()) {
      showError('餘額不足', `您的${selectedPaymentMethod}餘額不足以支付租金和押金`);
      return;
    }

    setIsLoading(true);
    try {
      // 這裡需要實現實際的租用邏輯
      // 暫時模擬租用過程
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      success('租用成功', `房源已成功租用，智能合約已部署。支付方式：${selectedPaymentMethod}`);
      setShowConfirmDialog(false);
      setShowRentModal(false);
      
      // 導航到我的租約頁面
      setTimeout(() => {
        navigate('/my-rentals');
      }, 2000);
    } catch (err) {
      showError('租用失敗', err instanceof Error ? err.message : '請檢查錢包餘額和網路連接');
    } finally {
      setIsLoading(false);
    }
  };

  // 獲取支付方式顯示文字
  const getPaymentMethodText = (method: PaymentMethod) => {
    switch (method) {
      case 'SOL':
        return 'SOL (Solana)';
      case 'USDT':
        return 'USDT (Tether)';
      default:
        return method;
    }
  };

  // 獲取餘額顯示
  const getBalanceDisplay = (method: PaymentMethod) => {
    switch (method) {
      case 'SOL':
        return `${balance.SOL.toFixed(4)} SOL`;
      case 'USDT':
        return `${balance.USDC.toFixed(2)} USDT`;
      default:
        return '0';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Link to="/listings" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← 返回房源列表
        </Link>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* 圖片輪播 */}
          <div className="relative h-96">
            <img
              src={listing.images[currentImage]}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors"
            >
              ←
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors"
            >
              →
            </button>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {listing.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentImage ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="p-8">
            {/* 標題和狀態 */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {listing.title}
                </h1>
                <p className="text-lg text-gray-600">{listing.location}</p>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  listing.available 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {listing.available ? '可租' : '已租出'}
                </span>
                {listing.isVerified && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                    已驗證
                  </span>
                )}
              </div>
            </div>

            {/* 價格和基本資訊 */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-4">
                  ${listing.price.toLocaleString()}/月
                </div>
                <div className="space-y-2 text-gray-600">
                  <p>押金: ${listing.deposit.toLocaleString()}</p>
                  <p>租期: {listing.contractLength} 個月</p>
                  <p>入住日期: {listing.moveInDate}</p>
                  <p>總費用: ${(listing.price + listing.deposit).toLocaleString()}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{listing.size}</div>
                  <div className="text-sm text-gray-600">坪數</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{listing.rooms}</div>
                  <div className="text-sm text-gray-600">房間</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{listing.bathrooms}</div>
                  <div className="text-sm text-gray-600">衛浴</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{listing.floor}/{listing.totalFloors}</div>
                  <div className="text-sm text-gray-600">樓層</div>
                </div>
              </div>
            </div>

            {/* 描述 */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">房源描述</h3>
              <p className="text-gray-700 leading-relaxed">{listing.description}</p>
            </div>

            {/* 設施 */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">設施配備</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {listing.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {amenity}
                  </div>
                ))}
              </div>
            </div>

            {/* 房東資訊 */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">房東資訊</h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{listing.landlord.name}</h4>
                      {listing.landlord.verified && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          已驗證
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      地址: {listing.landlord.address}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>評分: ⭐ {listing.landlord.rating}</span>
                      <span>總租約: {listing.landlord.totalRentals}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 智能合約資訊 */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">智能合約資訊</h3>
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">合約地址:</p>
                    <p className="font-mono text-blue-800 break-all">{listing.contractAddress}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">上架時間:</p>
                    <p className="text-gray-900">{listing.createdAt}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">驗證狀態:</p>
                    <p className="text-green-600 font-semibold">
                      {listing.isVerified ? '已通過預言機驗證' : '待驗證'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">區塊鏈:</p>
                    <p className="text-gray-900">Solana Devnet</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 租用按鈕 */}
            {listing.available && (
              <div className="flex justify-center">
                <button
                  onClick={() => setShowRentModal(true)}
                  disabled={!isConnected}
                  className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isConnected ? '立即租用' : '請先連接錢包'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 租用模態框 */}
        {showRentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-6">確認租用</h2>
              
              {/* 房源資訊 */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">{listing.title}</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>月租金: ${listing.price.toLocaleString()}</p>
                  <p>押金: ${listing.deposit.toLocaleString()}</p>
                  <p>總費用: ${(listing.price + listing.deposit).toLocaleString()}</p>
                </div>
              </div>

              {/* 支付方式選擇 */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">選擇支付方式</h3>
                <div className="space-y-2">
                  {(['SOL', 'USDT'] as PaymentMethod[]).map((method) => (
                    <label key={method} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method}
                        checked={selectedPaymentMethod === method}
                        onChange={(e) => setSelectedPaymentMethod(e.target.value as PaymentMethod)}
                        className="text-blue-600"
                      />
                      <span className="flex-1">{getPaymentMethodText(method)}</span>
                      <span className="text-sm text-gray-500">
                        餘額: {getBalanceDisplay(method)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 餘額檢查 */}
              {!checkBalance() && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">
                    餘額不足，請確保您的{selectedPaymentMethod}餘額足夠支付租金和押金
                  </p>
                </div>
              )}

              {/* 按鈕 */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowRentModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    setShowRentModal(false);
                    setShowConfirmDialog(true);
                  }}
                  disabled={!checkBalance()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  確認租用
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 確認對話框 */}
        <ConfirmDialog
          isOpen={showConfirmDialog}
          title="確認租用"
          message={`確定要租用這個房源嗎？\n\n房源: ${listing.title}\n月租金: ${listing.price.toLocaleString()} ${selectedPaymentMethod}\n押金: ${listing.deposit.toLocaleString()} ${selectedPaymentMethod}\n總費用: ${(listing.price + listing.deposit).toLocaleString()} ${selectedPaymentMethod}`}
          confirmText="確認租用"
          cancelText="取消"
          type="info"
          onConfirm={handleRentConfirm}
          onCancel={() => setShowConfirmDialog(false)}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default ListingDetail; 