import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useWallet } from "../contexts/WalletContext";
import { useNotificationContext } from "../contexts/NotificationContext";
import { RentalContractClient, PaymentMethod, formatSol, formatDate, getRentalStatusText } from "../utils/contract";
import { PublicKey } from "@solana/web3.js";
import LoadingSpinner from "../components/LoadingSpinner";
import ConfirmDialog from "../components/ConfirmDialog";
import RentalManagement from "../components/RentalManagement";

// 模擬租約資料
const mockRentals = [
  {
    id: 1,
    type: "tenant", // tenant 或 landlord
    title: "台北信義區精緻套房",
    address: "台北市信義區信義路五段",
    price: 25000,
    deposit: 50000,
    status: "active", // active, pending, expired, terminated
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    nextPayment: "2024-02-01",
    contractAddress: "0xABC123...DEF456",
    landlord: "0x1234...5678",
    tenant: "0x8765...4321",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400",
    paymentMethod: "SOL" as PaymentMethod,
    isPaymentDue: true,
    daysUntilPayment: 3,
    totalPaid: 25000,
    remainingPayments: 11
  },
  {
    id: 2,
    type: "landlord",
    title: "台中七期豪華公寓",
    address: "台中市西屯區",
    price: 35000,
    deposit: 70000,
    status: "active",
    startDate: "2024-02-01",
    endDate: "2025-01-31",
    nextPayment: "2024-03-01",
    contractAddress: "0xDEF456...ABC123",
    landlord: "0x8765...4321",
    tenant: "0x9999...8888",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400",
    paymentMethod: "USDT" as PaymentMethod,
    isPaymentDue: false,
    daysUntilPayment: 15,
    totalPaid: 70000,
    remainingPayments: 11
  },
  {
    id: 3,
    type: "tenant",
    title: "高雄前金區溫馨雅房",
    address: "高雄市前金區",
    price: 12000,
    deposit: 24000,
    status: "expired",
    startDate: "2023-01-01",
    endDate: "2023-12-31",
    nextPayment: "2023-12-01",
    contractAddress: "0x999888...777666",
    landlord: "0x9999...8888",
    tenant: "0x1234...5678",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400",
    paymentMethod: "SOL" as PaymentMethod,
    isPaymentDue: false,
    daysUntilPayment: 0,
    totalPaid: 144000,
    remainingPayments: 0
  }
];

const MyRentals = () => {
  const { isConnected, walletAddress, balance } = useWallet();
  const { success, error: showError, info } = useNotificationContext();
  
  const [activeTab, setActiveTab] = useState("all");
  const [selectedRental, setSelectedRental] = useState<typeof mockRentals[0] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [contractClient, setContractClient] = useState<RentalContractClient | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showTerminateDialog, setShowTerminateDialog] = useState(false);
  const [showRentalManagement, setShowRentalManagement] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('SOL');

  const filteredRentals = mockRentals.filter(rental => {
    if (activeTab === "all") return true;
    if (activeTab === "tenant") return rental.type === "tenant";
    if (activeTab === "landlord") return rental.type === "landlord";
    return rental.status === activeTab;
  });

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

  const getTypeText = (type: string) => {
    return type === "tenant" ? "租客" : "房東";
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
  const checkBalance = (rental: typeof mockRentals[0]) => {
    if (selectedPaymentMethod === 'SOL') {
      return balance.SOL >= rental.price / 1000000000; // 轉換為 SOL
    } else {
      return balance.USDC >= rental.price;
    }
  };

  // 處理租金支付
  const handlePayment = async (rental: typeof mockRentals[0]) => {
    if (!isConnected) {
      showError('請先連接錢包');
      return;
    }

    setSelectedRental(rental);
    setSelectedPaymentMethod(rental.paymentMethod);
    setShowPaymentDialog(true);
  };

  // 確認支付
  const handlePaymentConfirm = async () => {
    if (!selectedRental || !contractClient) {
      showError('無法處理支付');
      return;
    }

    if (!checkBalance(selectedRental)) {
      showError('餘額不足', `您的${selectedPaymentMethod}餘額不足以支付租金`);
      return;
    }

    setIsLoading(true);
    try {
      // 這裡需要實現實際的支付邏輯
      // 暫時模擬支付過程
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      success('支付成功', `租金 ${selectedRental.price.toLocaleString()} ${selectedPaymentMethod} 已成功支付`);
      setShowPaymentDialog(false);
      setSelectedRental(null);
    } catch (err) {
      showError('支付失敗', err instanceof Error ? err.message : '請檢查錢包餘額和網路連接');
    } finally {
      setIsLoading(false);
    }
  };

  // 處理租約管理
  const handleRentalManagement = (rental: typeof mockRentals[0]) => {
    setSelectedRental(rental);
    setShowRentalManagement(true);
  };

  // 處理租約終止
  const handleTerminate = async (rental: typeof mockRentals[0]) => {
    setSelectedRental(rental);
    setShowTerminateDialog(true);
  };

  // 確認終止租約
  const handleTerminateConfirm = async () => {
    if (!selectedRental) {
      showError('無法終止租約');
      return;
    }

    setIsLoading(true);
    try {
      // 這裡需要實現實際的終止邏輯
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      success('租約已終止', '租約已成功終止，押金將根據合約條款處理');
      setShowTerminateDialog(false);
      setSelectedRental(null);
    } catch (err) {
      showError('終止失敗', err instanceof Error ? err.message : '請檢查網路連接');
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
        <h1 className="text-3xl font-bold mb-8">我的租約</h1>

        {/* 統計資訊 */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl font-bold text-blue-600">{filteredRentals.length}</div>
            <div className="text-gray-600">總租約數</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl font-bold text-green-600">
              {filteredRentals.filter(r => r.status === 'active').length}
            </div>
            <div className="text-gray-600">進行中</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {filteredRentals.filter(r => r.isPaymentDue).length}
            </div>
            <div className="text-gray-600">待付款</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl font-bold text-gray-600">
              ${filteredRentals.reduce((sum, r) => sum + r.totalPaid, 0).toLocaleString()}
            </div>
            <div className="text-gray-600">總支付金額</div>
          </div>
        </div>

        {/* 標籤頁 */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: "all", label: "全部" },
                { id: "tenant", label: "我的租屋" },
                { id: "landlord", label: "我的出租" },
                { id: "active", label: "進行中" },
                { id: "pending", label: "待處理" },
                { id: "expired", label: "已到期" }
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
        </div>

        {/* 租約列表 */}
        {filteredRentals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">沒有找到符合條件的租約</p>
            <Link
              to="/listings"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              瀏覽房源
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRentals.map((rental) => (
              <div key={rental.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={rental.image}
                    alt={rental.title}
                    className="w-full h-48 object-cover"
                  />
                  {rental.isPaymentDue && (
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full font-semibold">
                        待付款
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{rental.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(rental.status)}`}>
                      {getStatusText(rental.status)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-2">{rental.address}</p>
                  <p className="text-sm text-gray-500 mb-3">
                    {getTypeText(rental.type)} • {getPaymentMethodText(rental.paymentMethod)}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">月租金:</span>
                      <span className="font-semibold text-blue-600">${rental.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">押金:</span>
                      <span className="font-semibold text-blue-600">${rental.deposit.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">已支付:</span>
                      <span className="font-semibold text-green-600">${rental.totalPaid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">剩餘期數:</span>
                      <span className="font-semibold text-gray-900">{rental.remainingPayments} 期</span>
                    </div>
                  </div>

                  {/* 付款資訊 */}
                  {rental.status === 'active' && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">下次付款:</span>
                        <span className="text-sm font-semibold">{rental.nextPayment}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">剩餘天數:</span>
                        <span className={`text-sm font-semibold ${
                          rental.daysUntilPayment <= 3 ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {rental.daysUntilPayment} 天
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 操作按鈕 */}
                  <div className="flex space-x-2">
                    <Link
                      to={`/listings/${rental.id}`}
                      className="flex-1 bg-blue-600 text-white text-center py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      查看詳情
                    </Link>
                    
                    {rental.status === 'active' && (
                      <button
                        onClick={() => handleRentalManagement(rental)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                      >
                        管理租約
                      </button>
                    )}
                    
                    {rental.status === 'active' && rental.type === 'tenant' && rental.isPaymentDue && (
                      <button
                        onClick={() => handlePayment(rental)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        支付租金
                      </button>
                    )}
                    
                    {rental.status === 'active' && (
                      <button
                        onClick={() => handleTerminate(rental)}
                        className="px-4 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                      >
                        終止租約
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 支付對話框 */}
        {showPaymentDialog && selectedRental && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-6">支付租金</h2>
              
              {/* 租約資訊 */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">{selectedRental.title}</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>月租金: ${selectedRental.price.toLocaleString()}</p>
                  <p>支付方式: {getPaymentMethodText(selectedRental.paymentMethod)}</p>
                  <p>下次付款: {selectedRental.nextPayment}</p>
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
              {!checkBalance(selectedRental) && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">
                    餘額不足，請確保您的{selectedPaymentMethod}餘額足夠支付租金
                  </p>
                </div>
              )}

              {/* 按鈕 */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowPaymentDialog(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handlePaymentConfirm}
                  disabled={!checkBalance(selectedRental)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  確認支付
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 終止租約對話框 */}
        <ConfirmDialog
          isOpen={showTerminateDialog}
          title="終止租約"
          message={`確定要終止這個租約嗎？\n\n房源: ${selectedRental?.title}\n\n注意：終止租約可能會影響押金退還，請確認您了解相關條款。`}
          confirmText="確認終止"
          cancelText="取消"
          type="warning"
          onConfirm={handleTerminateConfirm}
          onCancel={() => setShowTerminateDialog(false)}
          isLoading={isLoading}
        />

        {/* 租約管理對話框 */}
        {showRentalManagement && selectedRental && (
          <RentalManagement
            rental={{
              id: selectedRental.id.toString(),
              title: selectedRental.title,
              address: selectedRental.address,
              price: selectedRental.price,
              deposit: selectedRental.deposit,
              status: selectedRental.status,
              startDate: selectedRental.startDate,
              endDate: selectedRental.endDate,
              nextPayment: selectedRental.nextPayment,
              contractAddress: selectedRental.contractAddress,
              landlord: selectedRental.landlord,
              tenant: selectedRental.tenant,
              paymentMethod: selectedRental.paymentMethod,
              type: selectedRental.type as 'tenant' | 'landlord'
            }}
            onClose={() => setShowRentalManagement(false)}
            onUpdate={() => {
              // 這裡可以重新載入租約資料
              setShowRentalManagement(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default MyRentals; 