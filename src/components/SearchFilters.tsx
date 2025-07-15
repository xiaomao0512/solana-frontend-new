import React, { useState } from 'react';

interface SearchFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void;
  className?: string;
}

export interface SearchFilters {
  searchTerm: string;
  minPrice: string;
  maxPrice: string;
  location: string;
  rooms: string;
  bathrooms: string;
  amenities: string[];
  sortBy: 'price' | 'date' | 'rating';
  sortOrder: 'asc' | 'desc';
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ onFiltersChange, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
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

  const availableAmenities = [
    "冷氣", "冰箱", "洗衣機", "網路", "電視", "停車位", "健身房", 
    "游泳池", "管理員", "電梯", "陽台", "廚房", "書桌", "衣櫃"
  ];

  const handleFilterChange = (field: keyof SearchFilters, value: string | string[]) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleAmenityToggle = (amenity: string) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity];
    
    handleFilterChange('amenities', newAmenities);
  };

  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      searchTerm: '',
      minPrice: '',
      maxPrice: '',
      location: '',
      rooms: '',
      bathrooms: '',
      amenities: [],
      sortBy: 'date',
      sortOrder: 'desc'
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* 基本搜尋 */}
      <div className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="搜尋房源標題或描述..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="搜尋地址..."
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {isExpanded ? '收起篩選' : '更多篩選'}
          </button>
        </div>
      </div>

      {/* 展開的篩選選項 */}
      {isExpanded && (
        <div className="border-t pt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 價格範圍 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">價格範圍 (SOL)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="最低"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.000001"
                />
                <span className="text-gray-500 self-center">-</span>
                <input
                  type="number"
                  placeholder="最高"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.000001"
                />
              </div>
            </div>

            {/* 房間數 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">房間數</label>
              <select
                value={filters.rooms}
                onChange={(e) => handleFilterChange('rooms', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">不限</option>
                <option value="1">1 房</option>
                <option value="2">2 房</option>
                <option value="3">3 房</option>
                <option value="4">4 房以上</option>
              </select>
            </div>

            {/* 衛浴數 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">衛浴數</label>
              <select
                value={filters.bathrooms}
                onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">不限</option>
                <option value="1">1 衛浴</option>
                <option value="2">2 衛浴</option>
                <option value="3">3 衛浴以上</option>
              </select>
            </div>

            {/* 排序 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">排序方式</label>
              <div className="flex gap-2">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value as 'price' | 'date' | 'rating')}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date">上架時間</option>
                  <option value="price">價格</option>
                  <option value="rating">評分</option>
                </select>
                <button
                  onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  {filters.sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>

          {/* 設施篩選 */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">設施配備</label>
            <div className="grid md:grid-cols-4 gap-3">
              {availableAmenities.map((amenity) => (
                <label key={amenity} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.amenities.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="mr-2"
                  />
                  <span className="text-sm">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 清除篩選 */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              清除所有篩選
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters; 