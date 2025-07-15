import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useWallet } from "../contexts/WalletContext";
import { useNotificationContext } from "../contexts/NotificationContext";
import LoadingSpinner from "../components/LoadingSpinner";
import StatsDashboard from "../components/StatsDashboard";
import ListingCard from "../components/ListingCard";

// 模擬平台統計資料
const mockStats = {
  totalListings: 1250,
  activeRentals: 890,
  totalUsers: 3200,
  totalRevenue: 45.5,
  averageRating: 4.7,
  monthlyGrowth: 12.5
};

// 模擬最新房源
const mockLatestListings = [
  {
    id: "1",
    title: "台北信義區精緻套房",
    description: "位於信義區精華地段，交通便利，生活機能完善。",
    location: "台北市信義區信義路五段",
    price: 0.025,
    deposit: 0.05,
    size: 25,
    rooms: 1,
    bathrooms: 1,
    floor: 8,
    totalFloors: 12,
    images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"],
    amenities: ["冷氣", "冰箱", "洗衣機", "網路", "電視"],
    owner: "0x1234...5678",
    isAvailable: true,
    createdAt: "2024-01-20",
    rating: 4.5,
    reviewCount: 12
  },
  {
    id: "2",
    title: "台中七期豪華公寓",
    description: "七期重劃區豪華公寓，擁有健身房、游泳池等完善設施。",
    location: "台中市西屯區",
    price: 0.035,
    deposit: 0.07,
    size: 45,
    rooms: 2,
    bathrooms: 2,
    floor: 15,
    totalFloors: 20,
    images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400"],
    amenities: ["冷氣", "冰箱", "洗衣機", "網路", "電視", "健身房", "游泳池"],
    owner: "0x8765...4321",
    isAvailable: true,
    createdAt: "2024-01-19",
    rating: 4.8,
    reviewCount: 8
  },
  {
    id: "3",
    title: "高雄前金區溫馨雅房",
    description: "前金區溫馨雅房，鄰近捷運站，生活便利。",
    location: "高雄市前金區",
    price: 0.012,
    deposit: 0.024,
    size: 15,
    rooms: 1,
    bathrooms: 1,
    floor: 3,
    totalFloors: 8,
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400"],
    amenities: ["冷氣", "冰箱", "網路"],
    owner: "0x9999...8888",
    isAvailable: true,
    createdAt: "2024-01-18",
    rating: 4.2,
    reviewCount: 5
  }
];

// 模擬用戶活動
const mockActivities = [
  {
    id: 1,
    type: "rental_created",
    message: "張小明 租用了 台北信義區精緻套房",
    time: "2 小時前",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40"
  },
  {
    id: 2,
    type: "payment_success",
    message: "李美玲 成功支付租金 $25,000",
    time: "4 小時前",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40"
  },
  {
    id: 3,
    type: "listing_verified",
    message: "台中七期豪華公寓 通過預言機驗證",
    time: "6 小時前",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40"
  },
  {
    id: 4,
    type: "contract_deployed",
    message: "新智能合約已部署到 Solana 網路",
    time: "8 小時前",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=40"
  }
];

const Home = () => {
  const { isConnected, walletAddress, balance } = useWallet();
  const { info } = useNotificationContext();
  
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState(mockStats);
  const [latestListings, setLatestListings] = useState(mockLatestListings);
  const [activities, setActivities] = useState(mockActivities);

  useEffect(() => {
    if (isConnected) {
      info('歡迎回來！', '您的錢包已連接，可以開始瀏覽和租用房源');
    }
  }, [isConnected, info]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "rental_created":
        return "🏠";
      case "payment_success":
        return "💰";
      case "listing_verified":
        return "✅";
      case "contract_deployed":
        return "🔗";
      default:
        return "📝";
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "rental_created":
        return "text-green-600";
      case "payment_success":
        return "text-blue-600";
      case "listing_verified":
        return "text-purple-600";
      case "contract_deployed":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              去中心化租屋平台
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              基於 Solana 區塊鏈技術，安全、透明、高效的租屋體驗
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/listings"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                瀏覽房源
              </Link>
              <Link
                to="/add-listing"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                上架房源
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 統計資訊 */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-12">平台統計</h2>
        <StatsDashboard stats={stats} />
      </div>

      {/* 主要功能區域 */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* 最新房源 */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">最新房源</h3>
              <Link
                to="/listings"
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                查看全部 →
              </Link>
            </div>
            <div className="grid gap-4">
              {latestListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  className=""
                />
              ))}
            </div>
          </div>

          {/* 用戶活動 */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">平台活動</h3>
              <span className="text-sm text-gray-500">即時更新</span>
            </div>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="bg-white rounded-lg shadow-md p-4 flex space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                      {getActivityIcon(activity.type)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${getActivityColor(activity.type)}`}>
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 特色功能 */}
      <div className="bg-white py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">平台特色</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">智能合約保障</h3>
              <p className="text-gray-600">
                所有租約都通過 Solana 智能合約執行，確保資金安全和交易透明
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">預言機驗證</h3>
              <p className="text-gray-600">
                使用 Switchboard 預言機驗證房源資訊，確保資料真實性
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💳</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">多幣種支付</h3>
              <p className="text-gray-600">
                支援 SOL 和 USDT 支付，提供靈活的支付選擇
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 快速操作 */}
      {isConnected && (
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold text-center mb-8">快速操作</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <Link
              to="/listings"
              className="bg-blue-600 text-white p-6 rounded-lg text-center hover:bg-blue-700 transition-colors"
            >
              <div className="text-2xl mb-2">🏠</div>
              <h3 className="font-semibold mb-2">瀏覽房源</h3>
              <p className="text-sm opacity-90">查看所有可租房源</p>
            </Link>
            <Link
              to="/add-listing"
              className="bg-green-600 text-white p-6 rounded-lg text-center hover:bg-green-700 transition-colors"
            >
              <div className="text-2xl mb-2">📝</div>
              <h3 className="font-semibold mb-2">上架房源</h3>
              <p className="text-sm opacity-90">發布您的房源</p>
            </Link>
            <Link
              to="/my-rentals"
              className="bg-purple-600 text-white p-6 rounded-lg text-center hover:bg-purple-700 transition-colors"
            >
              <div className="text-2xl mb-2">📋</div>
              <h3 className="font-semibold mb-2">我的租約</h3>
              <p className="text-sm opacity-90">管理您的租約</p>
            </Link>
            <Link
              to="/wallet"
              className="bg-orange-600 text-white p-6 rounded-lg text-center hover:bg-orange-700 transition-colors"
            >
              <div className="text-2xl mb-2">💼</div>
              <h3 className="font-semibold mb-2">錢包管理</h3>
              <p className="text-sm opacity-90">查看餘額和交易</p>
            </Link>
          </div>
        </div>
      )}

      {/* 錢包連接提示 */}
      {!isConnected && (
        <div className="container mx-auto px-4 py-12">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold text-blue-900 mb-4">開始使用平台</h3>
            <p className="text-blue-700 mb-6">
              連接您的錢包以開始瀏覽房源、上架房源或管理租約
            </p>
            <Link
              to="/wallet"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              連接錢包
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home; 