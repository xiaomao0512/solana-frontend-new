import React, { useState } from "react";
import { useWallet } from "../contexts/WalletContext";
import { useNotification } from "../hooks/useNotification";
import LoadingSpinner from "../components/LoadingSpinner";

const Wallet = () => {
  const { 
    isConnected, 
    walletAddress, 
    balance, 
    connectWallet, 
    disconnectWallet, 
    isLoading, 
    error,
    refreshBalance 
  } = useWallet();
  
  const { success, error: showError } = useNotification();

  const availableWallets = [
    {
      id: "phantom",
      name: "Phantom",
      icon: "👻",
      description: "最受歡迎的 Solana 錢包",
      supported: true
    },
    {
      id: "solflare",
      name: "Solflare",
      icon: "🔥",
      description: "功能強大的 Solana 錢包",
      supported: false
    },
    {
      id: "slope",
      name: "Slope",
      icon: "📱",
      description: "移動端優先的錢包",
      supported: false
    },
    {
      id: "backpack",
      name: "Backpack",
      icon: "🎒",
      description: "開發者友好的錢包",
      supported: false
    }
  ];

  const mockTransactions = [
    {
      id: 1,
      type: "rent_payment",
      amount: 25.5,
      currency: "SOL",
      date: "2024-01-15",
      status: "completed",
      description: "台北信義區套房租金"
    },
    {
      id: 2,
      type: "deposit",
      amount: 50.0,
      currency: "SOL",
      date: "2024-01-01",
      status: "completed",
      description: "押金支付"
    },
    {
      id: 3,
      type: "refund",
      amount: 25.5,
      currency: "SOL",
      date: "2023-12-15",
      status: "pending",
      description: "租金退款"
    }
  ];

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      success('錢包連接成功', 'Phantom 錢包已成功連接');
    } catch (err) {
      showError('錢包連接失敗', err instanceof Error ? err.message : '請檢查是否安裝了 Phantom 錢包');
    }
  };

  const handleDisconnectWallet = () => {
    try {
      disconnectWallet();
      success('錢包已斷開連接');
    } catch (err) {
      showError('斷開連接失敗', '無法斷開錢包連接');
    }
  };

  const handleRefreshBalance = async () => {
    try {
      await refreshBalance();
      success('餘額已更新');
    } catch (err) {
      showError('更新餘額失敗', '無法獲取最新餘額');
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "rent_payment": return "🏠";
      case "deposit": return "💰";
      case "refund": return "↩️";
      default: return "💸";
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "rent_payment": return "text-red-600";
      case "deposit": return "text-blue-600";
      case "refund": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">連接錢包</h1>

        {!isConnected ? (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-4">選擇您的 Solana 錢包</h2>
              <p className="text-gray-600">連接錢包以使用區塊鏈租屋功能</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {availableWallets.map((wallet) => (
                <div
                  key={wallet.id}
                  className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                    wallet.supported
                      ? "border-gray-200 hover:border-blue-500 hover:shadow-md"
                      : "border-gray-100 bg-gray-50 cursor-not-allowed"
                  }`}
                  onClick={() => wallet.supported && handleConnectWallet()}
                >
                  <div className="flex items-center mb-4">
                    <span className="text-3xl mr-3">{wallet.icon}</span>
                    <div>
                      <h3 className="text-lg font-semibold">{wallet.name}</h3>
                      <p className="text-sm text-gray-600">{wallet.description}</p>
                    </div>
                  </div>
                  
                  {wallet.supported ? (
                    <button
                      disabled={isLoading}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <LoadingSpinner size="sm" color="white" />
                          <span className="ml-2">連接中...</span>
                        </div>
                      ) : (
                        "連接"
                      )}
                    </button>
                  ) : (
                    <div className="text-center text-gray-500">
                      <p className="text-sm">即將支援</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">為什麼需要連接錢包？</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• 安全地管理您的租金支付和押金</li>
                <li>• 透過智能合約自動執行租約條款</li>
                <li>• 透明的交易記錄和歷史</li>
                <li>• 支援 SOL 和 USDC 支付</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 錢包資訊 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">錢包資訊</h2>
                  <p className="text-gray-600">已連接 Phantom 錢包</p>
                </div>
                <button
                  onClick={handleDisconnectWallet}
                  className="px-4 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                >
                  斷開連接
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">錢包地址</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-mono break-all">{walletAddress}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">餘額</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">SOL:</span>
                      <span className="font-semibold">{balance.SOL.toFixed(4)} SOL</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">USDC:</span>
                      <span className="font-semibold">{balance.USDC.toFixed(2)} USDC</span>
                    </div>
                    <button
                      onClick={handleRefreshBalance}
                      disabled={isLoading}
                      className="w-full mt-2 px-3 py-1 bg-blue-100 text-blue-600 rounded text-sm hover:bg-blue-200 disabled:opacity-50"
                    >
                      更新餘額
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 交易歷史 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-6">交易歷史</h2>
              <div className="space-y-4">
                {mockTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{getTransactionIcon(transaction.type)}</span>
                      <div>
                        <p className="font-semibold">{transaction.description}</p>
                        <p className="text-sm text-gray-600">{transaction.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                        {transaction.amount} {transaction.currency}
                      </p>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(transaction.status)}`}>
                        {transaction.status === 'completed' ? '已完成' : 
                         transaction.status === 'pending' ? '處理中' : '失敗'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet; 