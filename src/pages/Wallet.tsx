import React, { useState } from "react";

const Wallet = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [balance, setBalance] = useState({
    SOL: 0,
    USDC: 0
  });
  const [isConnecting, setIsConnecting] = useState(false);

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
      supported: true
    },
    {
      id: "slope",
      name: "Slope",
      icon: "📱",
      description: "移動端優先的錢包",
      supported: true
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

  const connectWallet = async (walletId: string) => {
    setIsConnecting(true);
    setSelectedWallet(walletId);
    
    // 模擬連接過程
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 模擬連接成功
    setIsConnected(true);
    setWalletAddress("0x1234567890abcdef1234567890abcdef12345678");
    setBalance({
      SOL: 125.5,
      USDC: 2500.0
    });
    setIsConnecting(false);
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setSelectedWallet("");
    setWalletAddress("");
    setBalance({ SOL: 0, USDC: 0 });
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

            <div className="grid md:grid-cols-2 gap-6">
              {availableWallets.map((wallet) => (
                <div
                  key={wallet.id}
                  className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                    wallet.supported
                      ? "border-gray-200 hover:border-blue-500 hover:shadow-md"
                      : "border-gray-100 bg-gray-50 cursor-not-allowed"
                  }`}
                  onClick={() => wallet.supported && connectWallet(wallet.id)}
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
                      disabled={isConnecting && selectedWallet === wallet.id}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {isConnecting && selectedWallet === wallet.id ? "連接中..." : "連接"}
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
                  <p className="text-gray-600">已連接 {availableWallets.find(w => w.id === selectedWallet)?.name}</p>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="px-4 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                >
                  斷開連接
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">錢包地址</label>
                  <div className="flex items-center space-x-2">
                    <code className="bg-gray-100 px-3 py-2 rounded text-sm font-mono">
                      {walletAddress}
                    </code>
                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                      複製
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">網路</label>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Solana Mainnet</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 餘額 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">餘額</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm opacity-90">SOL 餘額</p>
                      <p className="text-2xl font-bold">{balance.SOL.toFixed(4)}</p>
                    </div>
                    <div className="text-3xl">◎</div>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm opacity-90">USDC 餘額</p>
                      <p className="text-2xl font-bold">{balance.USDC.toFixed(2)}</p>
                    </div>
                    <div className="text-3xl">💵</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 交易歷史 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">交易歷史</h3>
              <div className="space-y-4">
                {mockTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl">{getTransactionIcon(tx.type)}</span>
                      <div>
                        <p className="font-medium">{tx.description}</p>
                        <p className="text-sm text-gray-600">{tx.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${getTransactionColor(tx.type)}`}>
                        {tx.type === "rent_payment" || tx.type === "deposit" ? "-" : "+"}
                        {tx.amount} {tx.currency}
                      </p>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(tx.status)}`}>
                        {tx.status === "completed" ? "已完成" : tx.status === "pending" ? "處理中" : "失敗"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 快速操作 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">快速操作</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="text-2xl mb-2">💸</div>
                  <p className="font-medium">發送 SOL</p>
                </button>
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="text-2xl mb-2">📥</div>
                  <p className="font-medium">接收 SOL</p>
                </button>
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="text-2xl mb-2">📊</div>
                  <p className="font-medium">查看詳細</p>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet; 