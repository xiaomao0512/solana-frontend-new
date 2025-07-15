import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { useNotificationContext } from '../contexts/NotificationContext';
import { RentalContractClient } from '../utils/contract';
import { PublicKey } from '@solana/web3.js';
import LoadingSpinner from '../components/LoadingSpinner';

const CreateListing = () => {
  const navigate = useNavigate();
  const { isConnected, walletAddress } = useWallet();
  const { success, error: showError } = useNotificationContext();
  
  const [isLoading, setIsLoading] = useState(false);
  const [contractClient, setContractClient] = useState<RentalContractClient | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    price: '',
    deposit: '',
    size: '',
    rooms: '',
    bathrooms: '',
    floor: '',
    totalFloors: '',
    contractLength: '12',
    moveInDate: '',
    amenities: [] as string[]
  });

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // 可選設施
  const availableAmenities = [
    '冷氣', '熱水器', '洗衣機', '冰箱', '電視', '網路', '停車位',
    '電梯', '管理員', '健身房', '游泳池', '花園', '陽台', '廚房'
  ];

  // 初始化合約客戶端
  useEffect(() => {
    if (isConnected && walletAddress) {
      // 這裡需要從錢包適配器獲取錢包實例
      // 暫時使用模擬的合約客戶端
      setContractClient(null);
    }
  }, [isConnected, walletAddress]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      showError('請輸入房源標題');
      return false;
    }
    if (!formData.description.trim()) {
      showError('請輸入房源描述');
      return false;
    }
    if (!formData.location.trim()) {
      showError('請輸入房源地址');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      showError('請輸入有效的租金');
      return false;
    }
    if (!formData.deposit || parseFloat(formData.deposit) <= 0) {
      showError('請輸入有效的押金');
      return false;
    }
    if (!formData.size || parseFloat(formData.size) <= 0) {
      showError('請輸入有效的坪數');
      return false;
    }
    if (!formData.rooms || parseInt(formData.rooms) <= 0) {
      showError('請輸入有效的房間數');
      return false;
    }
    if (!formData.bathrooms || parseInt(formData.bathrooms) <= 0) {
      showError('請輸入有效的衛浴數');
      return false;
    }
    if (!formData.floor || parseInt(formData.floor) <= 0) {
      showError('請輸入有效的樓層');
      return false;
    }
    if (!formData.totalFloors || parseInt(formData.totalFloors) <= 0) {
      showError('請輸入有效的總樓層');
      return false;
    }
    if (!formData.moveInDate) {
      showError('請選擇入住日期');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      showError('請先連接錢包');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // 更新設施列表
      const updatedFormData = {
        ...formData,
        amenities: selectedAmenities
      };

      if (contractClient) {
        // 使用真實的合約方法
        const txHash = await contractClient.createListing({
          title: updatedFormData.title,
          description: updatedFormData.description,
          location: updatedFormData.location,
          price: parseFloat(updatedFormData.price) * 1000000000, // 轉換為 lamports
          deposit: parseFloat(updatedFormData.deposit) * 1000000000, // 轉換為 lamports
          size: parseFloat(updatedFormData.size),
          rooms: parseInt(updatedFormData.rooms),
          bathrooms: parseInt(updatedFormData.bathrooms),
          floor: parseInt(updatedFormData.floor),
          totalFloors: parseInt(updatedFormData.totalFloors),
          contractLength: parseInt(updatedFormData.contractLength),
          moveInDate: new Date(updatedFormData.moveInDate),
          amenities: updatedFormData.amenities
        });

        success('房源上架成功', `交易哈希: ${txHash.slice(0, 8)}...`);
        
        // 導航到房源列表頁面
        setTimeout(() => {
          navigate('/listings');
        }, 2000);
      } else {
        // 模擬上架過程
        await new Promise(resolve => setTimeout(resolve, 3000));
        success('房源上架成功', '房源已成功上架到區塊鏈');
        
        setTimeout(() => {
          navigate('/listings');
        }, 2000);
      }
    } catch (err) {
      showError('上架失敗', err instanceof Error ? err.message : '請檢查網路連接和錢包餘額');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">請先連接錢包</h2>
          <p className="text-gray-600">連接錢包後即可上架房源</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-8">上架房源</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 基本資訊 */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  房源標題 *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例如：台北信義區精緻套房"
                  maxLength={100}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  房源地址 *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例如：台北市信義區信義路五段"
                  maxLength={200}
                />
              </div>
            </div>

            {/* 房源描述 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                房源描述 *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="請詳細描述房源特色、周邊環境等..."
                maxLength={500}
              />
            </div>

            {/* 價格資訊 */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  月租金 (SOL) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.0"
                  step="0.1"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  押金 (SOL) *
                </label>
                <input
                  type="number"
                  name="deposit"
                  value={formData.deposit}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.0"
                  step="0.1"
                  min="0"
                />
              </div>
            </div>

            {/* 房源規格 */}
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  坪數 *
                </label>
                <input
                  type="number"
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  房間數 *
                </label>
                <input
                  type="number"
                  name="rooms"
                  value={formData.rooms}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="1"
                  max="10"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  衛浴數 *
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="1"
                  max="5"
                />
              </div>
            </div>

            {/* 樓層資訊 */}
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  樓層 *
                </label>
                <input
                  type="number"
                  name="floor"
                  value={formData.floor}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  總樓層 *
                </label>
                <input
                  type="number"
                  name="totalFloors"
                  value={formData.totalFloors}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  租期 (月) *
                </label>
                <select
                  name="contractLength"
                  value={formData.contractLength}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="6">6 個月</option>
                  <option value="12">12 個月</option>
                  <option value="18">18 個月</option>
                  <option value="24">24 個月</option>
                </select>
              </div>
            </div>

            {/* 入住日期 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                入住日期 *
              </label>
              <input
                type="date"
                name="moveInDate"
                value={formData.moveInDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* 設施配備 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                設施配備
              </label>
              <div className="grid md:grid-cols-4 gap-3">
                {availableAmenities.map((amenity) => (
                  <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 提交按鈕 */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/listings')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <LoadingSpinner size="sm" />
                    <span>上架中...</span>
                  </div>
                ) : (
                  '上架房源'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateListing; 