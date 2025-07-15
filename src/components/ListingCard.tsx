import React from 'react';
import { Link } from 'react-router-dom';

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    description: string;
    location: string;
    price: number;
    deposit: number;
    size: number;
    rooms: number;
    bathrooms: number;
    floor: number;
    totalFloors: number;
    amenities: string[];
    images: string[];
    owner: string;
    isAvailable: boolean;
    createdAt: string;
    rating?: number;
    reviewCount?: number;
  };
  showOwner?: boolean;
  className?: string;
}

const ListingCard: React.FC<ListingCardProps> = ({ 
  listing, 
  showOwner = false, 
  className = '' 
}) => {
  const formatPrice = (price: number) => {
    return price.toFixed(6);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW');
  };

  const getAmenityIcons = (amenities: string[]) => {
    const iconMap: { [key: string]: string } = {
      '冷氣': '❄️',
      '冰箱': '🧊',
      '洗衣機': '🧺',
      '網路': '📶',
      '電視': '📺',
      '停車位': '🚗',
      '健身房': '💪',
      '游泳池': '🏊',
      '管理員': '👨‍💼',
      '電梯': '🛗',
      '陽台': '🌿',
      '廚房': '🍳',
      '書桌': '📚',
      '衣櫃': '👕'
    };

    return amenities.slice(0, 4).map(amenity => ({
      name: amenity,
      icon: iconMap[amenity] || '🏠'
    }));
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 ${className}`}>
      {/* 圖片區域 */}
      <div className="relative h-48 bg-gray-200">
        {listing.images && listing.images.length > 0 ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        
        {/* 狀態標籤 */}
        <div className="absolute top-3 left-3">
          {listing.isAvailable ? (
            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              可租用
            </span>
          ) : (
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              已出租
            </span>
          )}
        </div>

        {/* 評分 */}
        {listing.rating && (
          <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
            ⭐ {listing.rating.toFixed(1)}
            {listing.reviewCount && ` (${listing.reviewCount})`}
          </div>
        )}
      </div>

      {/* 內容區域 */}
      <div className="p-4">
        {/* 標題和價格 */}
        <div className="flex justify-between items-start mb-2">
          <Link 
            to={`/listings/${listing.id}`}
            className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 flex-1 mr-2"
          >
            {listing.title}
          </Link>
          <div className="text-right">
            <div className="text-xl font-bold text-blue-600">
              {formatPrice(listing.price)} SOL
            </div>
            <div className="text-sm text-gray-500">
              押金 {formatPrice(listing.deposit)} SOL
            </div>
          </div>
        </div>

        {/* 位置 */}
        <div className="text-gray-600 mb-3 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm">{listing.location}</span>
        </div>

        {/* 房屋資訊 */}
        <div className="grid grid-cols-3 gap-4 mb-3 text-sm text-gray-600">
          <div className="flex items-center">
            <span className="mr-1">🏠</span>
            <span>{listing.size} 坪</span>
          </div>
          <div className="flex items-center">
            <span className="mr-1">🛏️</span>
            <span>{listing.rooms} 房</span>
          </div>
          <div className="flex items-center">
            <span className="mr-1">🚿</span>
            <span>{listing.bathrooms} 衛浴</span>
          </div>
        </div>

        {/* 樓層資訊 */}
        <div className="text-sm text-gray-500 mb-3">
          {listing.floor} / {listing.totalFloors} 樓
        </div>

        {/* 設施圖標 */}
        <div className="flex items-center mb-4">
          {getAmenityIcons(listing.amenities).map((amenity, index) => (
            <span key={index} className="mr-2 text-lg" title={amenity.name}>
              {amenity.icon}
            </span>
          ))}
          {listing.amenities.length > 4 && (
            <span className="text-sm text-gray-500">
              +{listing.amenities.length - 4} 更多
            </span>
          )}
        </div>

        {/* 房東資訊 */}
        {showOwner && (
          <div className="border-t pt-3 mb-3">
            <div className="text-sm text-gray-600">
              房東: {listing.owner.slice(0, 8)}...{listing.owner.slice(-6)}
            </div>
          </div>
        )}

        {/* 上架時間 */}
        <div className="text-xs text-gray-400 mb-4">
          上架時間: {formatDate(listing.createdAt)}
        </div>

        {/* 操作按鈕 */}
        <div className="flex gap-2">
          <Link
            to={`/listings/${listing.id}`}
            className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            查看詳情
          </Link>
          {listing.isAvailable && (
            <button className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
              立即租用
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingCard; 