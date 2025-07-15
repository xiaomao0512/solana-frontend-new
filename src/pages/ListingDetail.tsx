import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";

// 模擬房源詳細資料
const mockListingDetail = {
  id: 1,
  title: "台北信義區精緻套房",
  location: "台北市信義區信義路五段",
  price: 25000,
  size: 15,
  rooms: 1,
  bathrooms: 1,
  floor: 12,
  totalFloors: 20,
  images: [
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"
  ],
  description: "位於信義區精華地段，近捷運站，生活機能便利。房間採光良好，設備齊全，適合上班族居住。",
  amenities: ["冷氣", "冰箱", "洗衣機", "網路", "電視", "衣櫃"],
  landlord: {
    address: "0x1234567890abcdef1234567890abcdef12345678",
    name: "張房東",
    rating: 4.8,
    totalRentals: 15
  },
  available: true,
  deposit: 50000,
  contractLength: 12,
  moveInDate: "2024-02-01"
};

const ListingDetail = () => {
  const { id } = useParams();
  const [currentImage, setCurrentImage] = useState(0);
  const [showRentModal, setShowRentModal] = useState(false);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % mockListingDetail.images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => 
      prev === 0 ? mockListingDetail.images.length - 1 : prev - 1
    );
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
              src={mockListingDetail.images[currentImage]}
              alt={mockListingDetail.title}
              className="w-full h-full object-cover"
            />
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
            >
              ←
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
            >
              →
            </button>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {mockListingDetail.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`w-3 h-3 rounded-full ${
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
                  {mockListingDetail.title}
                </h1>
                <p className="text-lg text-gray-600">{mockListingDetail.location}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                mockListingDetail.available 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {mockListingDetail.available ? '可租' : '已租出'}
              </span>
            </div>

            {/* 價格和基本資訊 */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-4">
                  ${mockListingDetail.price.toLocaleString()}/月
                </div>
                <div className="space-y-2 text-gray-600">
                  <p>押金: ${mockListingDetail.deposit.toLocaleString()}</p>
                  <p>租期: {mockListingDetail.contractLength} 個月</p>
                  <p>入住日期: {mockListingDetail.moveInDate}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{mockListingDetail.size}</div>
                  <div className="text-sm text-gray-600">坪數</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{mockListingDetail.rooms}</div>
                  <div className="text-sm text-gray-600">房間</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{mockListingDetail.bathrooms}</div>
                  <div className="text-sm text-gray-600">衛浴</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{mockListingDetail.floor}/{mockListingDetail.totalFloors}</div>
                  <div className="text-sm text-gray-600">樓層</div>
                </div>
              </div>
            </div>

            {/* 描述 */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">房源描述</h3>
              <p className="text-gray-700 leading-relaxed">{mockListingDetail.description}</p>
            </div>

            {/* 設施 */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">設施配備</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {mockListingDetail.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    {amenity}
                  </div>
                ))}
              </div>
            </div>

            {/* 房東資訊 */}
            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">房東資訊</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{mockListingDetail.landlord.name}</p>
                  <p className="text-sm text-gray-600">錢包地址: {mockListingDetail.landlord.address}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-yellow-500 mr-1">★</span>
                    <span className="text-sm">{mockListingDetail.landlord.rating} ({mockListingDetail.landlord.totalRentals} 筆租約)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 智能合約資訊 */}
            <div className="mb-8 p-6 bg-blue-50 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-blue-900">區塊鏈資訊</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-semibold">智能合約地址:</span> 0xABC123...DEF456</p>
                <p><span className="font-semibold">預言機驗證:</span> Switchboard ✓</p>
                <p><span className="font-semibold">租金支付:</span> SOL / USDC</p>
              </div>
            </div>

            {/* 操作按鈕 */}
            <div className="flex space-x-4">
              <button
                onClick={() => setShowRentModal(true)}
                disabled={!mockListingDetail.available}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {mockListingDetail.available ? '立即租用' : '已租出'}
              </button>
              <button className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50">
                聯絡房東
              </button>
            </div>
          </div>
        </div>

        {/* 租用確認 Modal */}
        {showRentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold mb-4">確認租用</h3>
              <div className="space-y-4 mb-6">
                <p>您確定要租用這個房源嗎？</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><span className="font-semibold">月租金:</span> ${mockListingDetail.price.toLocaleString()}</p>
                  <p><span className="font-semibold">押金:</span> ${mockListingDetail.deposit.toLocaleString()}</p>
                  <p><span className="font-semibold">租期:</span> {mockListingDetail.contractLength} 個月</p>
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowRentModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  確認租用
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingDetail; 