import React, { useState } from "react";
import { Link } from "react-router-dom";

// 模擬租約資料
const mockRentals = [
  {
    id: 1,
    type: "tenant", // tenant 或 landlord
    title: "台北信義區精緻套房",
    address: "台北市信義區信義路五段",
    price: 25000,
    status: "active", // active, pending, expired, terminated
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    nextPayment: "2024-02-01",
    contractAddress: "0xABC123...DEF456",
    landlord: "0x1234...5678",
    tenant: "0x8765...4321",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"
  },
  {
    id: 2,
    type: "landlord",
    title: "台中七期豪華公寓",
    address: "台中市西屯區",
    price: 35000,
    status: "pending",
    startDate: "2024-02-01",
    endDate: "2025-01-31",
    nextPayment: "2024-03-01",
    contractAddress: "0xDEF456...ABC123",
    landlord: "0x8765...4321",
    tenant: "0x9999...8888",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400"
  },
  {
    id: 3,
    type: "tenant",
    title: "高雄前金區溫馨雅房",
    address: "高雄市前金區",
    price: 12000,
    status: "expired",
    startDate: "2023-01-01",
    endDate: "2023-12-31",
    nextPayment: "2023-12-01",
    contractAddress: "0x999888...777666",
    landlord: "0x9999...8888",
    tenant: "0x1234...5678",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400"
  }
];

const MyRentals = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedRental, setSelectedRental] = useState<typeof mockRentals[0] | null>(null);

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">我的租約</h1>

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
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRentals.map((rental) => (
            <div key={rental.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <img
                src={rental.image}
                alt={rental.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{rental.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(rental.status)}`}>
                    {getStatusText(rental.status)}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-2">{rental.address}</p>
                <p className="text-sm text-gray-500 mb-3">
                  {getTypeText(rental.type)} • 合約地址: {rental.contractAddress}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">月租金:</span>
                    <span className="font-semibold text-blue-600">${rental.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">租期:</span>
                    <span className="text-sm">{rental.startDate} ~ {rental.endDate}</span>
                  </div>
                  {rental.status === "active" && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">下次付款:</span>
                      <span className="text-sm text-orange-600">{rental.nextPayment}</span>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedRental(rental)}
                    className="flex-1 bg-blue-600 text-white text-center py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    查看詳情
                  </button>
                  {rental.status === "active" && (
                    <button className="px-4 py-2 border border-green-600 text-green-600 rounded-md hover:bg-green-50 transition-colors">
                      付款
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRentals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">沒有找到符合條件的租約</p>
            <Link
              to="/listings"
              className="mt-4 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              瀏覽房源
            </Link>
          </div>
        )}

        {/* 租約詳情 Modal */}
        {selectedRental && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-semibold">租約詳情</h3>
                <button
                  onClick={() => setSelectedRental(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <img
                    src={selectedRental.image}
                    alt={selectedRental.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">{selectedRental.title}</h4>
                  <p className="text-gray-600 mb-4">{selectedRental.address}</p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-semibold">狀態:</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedRental.status)}`}>
                        {getStatusText(selectedRental.status)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">角色:</span>
                      <span>{getTypeText(selectedRental.type)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">月租金:</span>
                      <span className="text-blue-600">${selectedRental.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">租期:</span>
                      <span>{selectedRental.startDate} ~ {selectedRental.endDate}</span>
                    </div>
                    {selectedRental.status === "active" && (
                      <div className="flex justify-between">
                        <span className="font-semibold">下次付款:</span>
                        <span className="text-orange-600">{selectedRental.nextPayment}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 智能合約資訊 */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h5 className="font-semibold text-blue-900 mb-3">智能合約資訊</h5>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">合約地址:</span> {selectedRental.contractAddress}</p>
                  <p><span className="font-semibold">房東錢包:</span> {selectedRental.landlord}</p>
                  <p><span className="font-semibold">租客錢包:</span> {selectedRental.tenant}</p>
                  <p><span className="font-semibold">預言機驗證:</span> Switchboard ✓</p>
                </div>
              </div>

              {/* 操作按鈕 */}
              <div className="mt-6 flex space-x-4">
                {selectedRental.status === "active" && (
                  <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                    支付租金
                  </button>
                )}
                {selectedRental.status === "pending" && selectedRental.type === "landlord" && (
                  <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    確認租約
                  </button>
                )}
                <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                  查看合約
                </button>
                <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                  聯絡對方
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRentals; 