import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useWallet } from "../contexts/WalletContext";
import { useNotificationContext } from "../contexts/NotificationContext";
import { RentalContractClient } from "../utils/contract";
import { PublicKey } from "@solana/web3.js";
import LoadingSpinner from "../components/LoadingSpinner";
import SearchFilters, { SearchFilters as SearchFiltersType } from "../components/SearchFilters";
import ListingCard from "../components/ListingCard";

// 模擬房源資料
const mockListings = [
  {
    id: "1",
    title: "台北信義區精緻套房",
    description: "位於信義區精華地段，交通便利，生活機能完善，適合上班族居住。",
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
    createdAt: "2024-01-15",
    rating: 4.5,
    reviewCount: 12
  },
  {
    id: "2",
    title: "台中七期豪華公寓",
    description: "七期重劃區豪華公寓，擁有健身房、游泳池等完善設施，享受高品質生活。",
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
    createdAt: "2024-01-10",
    rating: 4.8,
    reviewCount: 8
  },
  {
    id: "3",
    title: "高雄前金區溫馨雅房",
    description: "前金區溫馨雅房，鄰近捷運站，生活便利，適合學生或上班族。",
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
    createdAt: "2024-01-20",
    rating: 4.2,
    reviewCount: 5
  },
  {
    id: "4",
    title: "新竹科學園區科技宅",
    description: "鄰近竹科，適合科技業從業人員，交通便利，環境清幽。",
    location: "新竹市東區",
    price: 0.028,
    deposit: 0.056,
    size: 35,
    rooms: 2,
    bathrooms: 1,
    floor: 12,
    totalFloors: 18,
    images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"],
    amenities: ["冷氣", "冰箱", "洗衣機", "網路", "電視", "停車位"],
    owner: "0x5555...6666",
    isAvailable: true,
    createdAt: "2024-01-12",
    rating: 4.6,
    reviewCount: 15
  },
  {
    id: "5",
    title: "台南安平區海景套房",
    description: "安平區海景套房，享受無敵海景，適合喜歡海邊生活的租客。",
    location: "台南市安平區",
    price: 0.018,
    deposit: 0.036,
    size: 28,
    rooms: 1,
    bathrooms: 1,
    floor: 6,
    totalFloors: 10,
    images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400"],
    amenities: ["冷氣", "冰箱", "網路", "電視", "海景"],
    owner: "0x7777...8888",
    isAvailable: false,
    createdAt: "2024-01-08",
    rating: 4.7,
    reviewCount: 9
  }
];

interface Listing {
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
  images: string[];
  amenities: string[];
  owner: string;
  isAvailable: boolean;
  createdAt: string;
  rating?: number;
  reviewCount?: number;
}

const Listings = () => {
  const { isConnected } = useWallet();
  const { info } = useNotificationContext();
  
  const [listings, setListings] = useState<Listing[]>(mockListings);
  const [filteredListings, setFilteredListings] = useState<Listing[]>(mockListings);
  const [isLoading, setIsLoading] = useState(false);
  const [contractClient, setContractClient] = useState<RentalContractClient | null>(null);
  const [filters, setFilters] = useState<SearchFiltersType>({
    searchTerm: '',
    minPrice: '',
    maxPrice: '',
    location: '',
    rooms: '',
    bathrooms: '',
    amenities: [],
    sortBy: 'date',
    sortOrder: 'desc'
  });

  // 初始化合約客戶端
  useEffect(() => {
    if (isConnected) {
      setContractClient(null);
    }
  }, [isConnected]);

  // 篩選和排序房源
  useEffect(() => {
    let filtered = listings.filter(listing => {
      // 搜尋條件
      const matchesSearch = !filters.searchTerm || 
        listing.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        listing.description.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      // 位置篩選
      const matchesLocation = !filters.location || 
        listing.location.toLowerCase().includes(filters.location.toLowerCase());
      
      // 價格篩選
      const minPrice = filters.minPrice ? parseFloat(filters.minPrice) : 0;
      const maxPrice = filters.maxPrice ? parseFloat(filters.maxPrice) : Infinity;
      const matchesPrice = listing.price >= minPrice && listing.price <= maxPrice;
      
      // 房間數篩選
      const matchesRooms = !filters.rooms || listing.rooms >= parseInt(filters.rooms);
      
      // 衛浴數篩選
      const matchesBathrooms = !filters.bathrooms || listing.bathrooms >= parseInt(filters.bathrooms);
      
      // 設施篩選
      const matchesAmenities = filters.amenities.length === 0 || 
        filters.amenities.every(amenity => listing.amenities.includes(amenity));
      
      return matchesSearch && matchesLocation && matchesPrice && 
             matchesRooms && matchesBathrooms && matchesAmenities;
    });

    // 排序
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filters.sortBy) {
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case 'date':
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
      }
      
      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredListings(filtered);
  }, [listings, filters]);

  // 處理篩選變更
  const handleFiltersChange = (newFilters: SearchFiltersType) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">房源列表</h1>
          <Link
            to="/add-listing"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            上架房源
          </Link>
        </div>

        {/* 搜尋和篩選區域 */}
        <SearchFilters 
          onFiltersChange={handleFiltersChange}
          className="mb-8"
        />

        {/* 房源列表 */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="載入房源中..." />
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-gray-600">找到 {filteredListings.length} 個房源</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  className=""
                />
              ))}
            </div>

            {filteredListings.length === 0 && (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">沒有找到符合條件的房源</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    嘗試調整搜尋條件或篩選器來找到更多房源。
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => setFilters({
                        searchTerm: '',
                        minPrice: '',
                        maxPrice: '',
                        location: '',
                        rooms: '',
                        bathrooms: '',
                        amenities: [],
                        sortBy: 'date',
                        sortOrder: 'desc'
                      })}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      清除篩選條件
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Listings; 