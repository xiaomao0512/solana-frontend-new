import React, { useState } from "react";
import { Link } from "react-router-dom";

// 模擬房源資料
const mockListings = [
  {
    id: 1,
    title: "台北信義區精緻套房",
    location: "台北市信義區",
    price: 25000,
    size: 15,
    rooms: 1,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400",
    description: "近捷運站，生活機能便利，適合上班族",
    landlord: "0x1234...5678",
    available: true
  },
  {
    id: 2,
    title: "台中七期豪華公寓",
    location: "台中市西屯區",
    price: 35000,
    size: 25,
    rooms: 2,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400",
    description: "高樓層景觀佳，設備齊全，附停車位",
    landlord: "0x8765...4321",
    available: true
  },
  {
    id: 3,
    title: "高雄前金區溫馨雅房",
    location: "高雄市前金區",
    price: 12000,
    size: 8,
    rooms: 1,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400",
    description: "學生首選，價格實惠，包水電網路",
    landlord: "0x9999...8888",
    available: false
  }
];

const Listings = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [location, setLocation] = useState("");

  const filteredListings = mockListings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrice = priceRange === "" || 
                        (priceRange === "low" && listing.price < 15000) ||
                        (priceRange === "medium" && listing.price >= 15000 && listing.price < 30000) ||
                        (priceRange === "high" && listing.price >= 30000);
    const matchesLocation = location === "" || listing.location.includes(location);
    
    return matchesSearch && matchesPrice && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">房源列表</h1>
        
        {/* 搜尋和篩選 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">搜尋</label>
              <input
                type="text"
                placeholder="搜尋房源標題或描述..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">價格範圍</label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全部價格</option>
                <option value="low">低於 15,000</option>
                <option value="medium">15,000 - 30,000</option>
                <option value="high">高於 30,000</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">地區</label>
              <input
                type="text"
                placeholder="輸入地區..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                篩選
              </button>
            </div>
          </div>
        </div>

        {/* 房源列表 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <div key={listing.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <img
                src={listing.image}
                alt={listing.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{listing.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    listing.available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {listing.available ? '可租' : '已租出'}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">{listing.location}</p>
                <p className="text-gray-700 mb-4">{listing.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <div className="text-2xl font-bold text-blue-600">${listing.price.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">
                    {listing.size}坪 • {listing.rooms}房
                  </div>
                </div>
                <div className="text-xs text-gray-500 mb-4">
                  房東: {listing.landlord}
                </div>
                <Link
                  to={`/listings/${listing.id}`}
                  className="block w-full bg-blue-600 text-white text-center py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  查看詳情
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredListings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">沒有找到符合條件的房源</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Listings; 