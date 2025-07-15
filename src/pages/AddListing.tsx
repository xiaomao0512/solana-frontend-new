import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../contexts/WalletContext";
import { useNotificationContext } from "../contexts/NotificationContext";
import { RentalContractClient } from "../utils/contract";
import LoadingSpinner from "../components/LoadingSpinner";
import ConfirmDialog from "../components/ConfirmDialog";

interface ListingForm {
  title: string;
  description: string;
  location: string;
  price: string;
  deposit: string;
  size: string;
  rooms: string;
  bathrooms: string;
  floor: string;
  totalFloors: string;
  contractLength: string;
  moveInDate: string;
  amenities: string[];
  images: File[];
}

const availableAmenities = [
  "冷氣", "冰箱", "洗衣機", "網路", "電視", "停車位", "健身房", 
  "游泳池", "管理員", "電梯", "陽台", "廚房", "書桌", "衣櫃",
  "熱水器", "瓦斯爐", "微波爐", "烤箱", "洗碗機", "烘乾機"
];

const AddListing = () => {
  const navigate = useNavigate();
  const { isConnected, walletAddress } = useWallet();
  const { success, error: showError } = useNotificationContext();
  
  const [isLoading, setIsLoading] = useState(false);
  const [contractClient, setContractClient] = useState<RentalContractClient | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  const [formData, setFormData] = useState<ListingForm>({
    title: "",
    description: "",
    location: "",
    price: "",
    deposit: "",
    size: "",
    rooms: "",
    bathrooms: "",
    floor: "",
    totalFloors: "",
    contractLength: "",
    moveInDate: "",
    amenities: [],
    images: []
  });

  const [errors, setErrors] = useState<Partial<ListingForm>>({});
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  // 初始化合約客戶端
  useEffect(() => {
    if (isConnected && walletAddress) {
      setContractClient(null);
    }
  }, [isConnected, walletAddress]);

  // 驗證表單
  const validateForm = (): boolean => {
    const newErrors: Partial<ListingForm> = {};

    if (!formData.title.trim()) {
      newErrors.title = "請輸入房源標題";
    }

    if (!formData.description.trim()) {
      newErrors.description = "請輸入房源描述";
    }

    if (!formData.location.trim()) {
      newErrors.location = "請輸入房源地址";
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "請輸入有效的租金";
    }

    if (!formData.deposit || parseFloat(formData.deposit) <= 0) {
      newErrors.deposit = "請輸入有效的押金";
    }

    if (!formData.size || parseFloat(formData.size) <= 0) {
      newErrors.size = "請輸入有效的坪數";
    }

    if (!formData.rooms || parseInt(formData.rooms) <= 0) {
      newErrors.rooms = "請輸入房間數";
    }

    if (!formData.bathrooms || parseInt(formData.bathrooms) <= 0) {
      newErrors.bathrooms = "請輸入衛浴數";
    }

    if (!formData.floor || parseInt(formData.floor) <= 0) {
      newErrors.floor = "請輸入樓層";
    }

    if (!formData.totalFloors || parseInt(formData.totalFloors) <= 0) {
      newErrors.totalFloors = "請輸入總樓層";
    }

    if (!formData.contractLength || parseInt(formData.contractLength) <= 0) {
      newErrors.contractLength = "請輸入租期";
    }

    if (!formData.moveInDate) {
      newErrors.moveInDate = "請選擇入住日期";
    }

    if (formData.amenities.length === 0) {
      newErrors.amenities = "請至少選擇一項設施";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 處理表單輸入
  const handleInputChange = (field: keyof ListingForm, value: string | string[] | File[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 清除對應的錯誤
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // 處理文字輸入
  const handleTextInput = (field: keyof Omit<ListingForm, 'amenities' | 'images'>, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 清除對應的錯誤
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // 處理設施選擇
  const handleAmenityToggle = (amenity: string) => {
    const newAmenities = formData.amenities.includes(amenity)
      ? formData.amenities.filter(a => a !== amenity)
      : [...formData.amenities, amenity];
    
    handleInputChange('amenities', newAmenities);
  };

  // 處理圖片上傳
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // 驗證檔案類型
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // 5MB 限制
    );

    if (validFiles.length !== files.length) {
      showError('圖片上傳失敗', '請選擇有效的圖片檔案（JPG、PNG），大小不超過 5MB');
    }

    if (validFiles.length > 0) {
      setFormData(prev => ({ ...prev, images: [...prev.images, ...validFiles] }));
      
      // 創建預覽
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewImages(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // 移除圖片
  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  // 提交表單
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      showError('請先連接錢包');
      return;
    }

    if (!validateForm()) {
      showError('表單驗證失敗', '請檢查並修正所有錯誤');
      return;
    }

    setShowConfirmDialog(true);
  };

  // 確認上架
  const handleConfirmSubmit = async () => {
    setIsLoading(true);
    try {
      // 這裡需要實現實際的上架邏輯
      // 暫時模擬上架過程
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      success('房源上架成功', '您的房源已成功上架並等待預言機驗證');
      setShowConfirmDialog(false);
      navigate('/listings');
    } catch (err) {
      showError('房源上架失敗', err instanceof Error ? err.message : '請檢查網路連接');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">上架房源</h1>

          {!isConnected && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800">請先連接錢包以上架房源</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
            {/* 基本資訊 */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-6">基本資訊</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    房源標題 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleTextInput('title', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="例如：台北信義區精緻套房"
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    房源地址 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleTextInput('location', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.location ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="例如：台北市信義區信義路五段"
                  />
                  {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  房源描述 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleTextInput('description', e.target.value)}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="請詳細描述房源特色、周邊環境、交通便利性等..."
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>
            </div>

            {/* 價格資訊 */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-6">價格資訊</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    月租金 (SOL) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleTextInput('price', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="例如：25000"
                    min="0"
                    step="0.000001"
                  />
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    押金 (SOL) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.deposit}
                    onChange={(e) => handleTextInput('deposit', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.deposit ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="例如：50000"
                    min="0"
                    step="0.000001"
                  />
                  {errors.deposit && <p className="text-red-500 text-sm mt-1">{errors.deposit}</p>}
                </div>
              </div>
            </div>

            {/* 房屋資訊 */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-6">房屋資訊</h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    坪數 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.size}
                    onChange={(e) => handleTextInput('size', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.size ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="例如：25"
                    min="0"
                    step="0.1"
                  />
                  {errors.size && <p className="text-red-500 text-sm mt-1">{errors.size}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    房間數 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.rooms}
                    onChange={(e) => handleTextInput('rooms', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.rooms ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="例如：1"
                    min="1"
                  />
                  {errors.rooms && <p className="text-red-500 text-sm mt-1">{errors.rooms}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    衛浴數 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => handleTextInput('bathrooms', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.bathrooms ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="例如：1"
                    min="1"
                  />
                  {errors.bathrooms && <p className="text-red-500 text-sm mt-1">{errors.bathrooms}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    樓層 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.floor}
                    onChange={(e) => handleTextInput('floor', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.floor ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="例如：8"
                    min="1"
                  />
                  {errors.floor && <p className="text-red-500 text-sm mt-1">{errors.floor}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    總樓層 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.totalFloors}
                    onChange={(e) => handleTextInput('totalFloors', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.totalFloors ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="例如：12"
                    min="1"
                  />
                  {errors.totalFloors && <p className="text-red-500 text-sm mt-1">{errors.totalFloors}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    租期 (月) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.contractLength}
                    onChange={(e) => handleTextInput('contractLength', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.contractLength ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="例如：12"
                    min="1"
                  />
                  {errors.contractLength && <p className="text-red-500 text-sm mt-1">{errors.contractLength}</p>}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  入住日期 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.moveInDate}
                  onChange={(e) => handleTextInput('moveInDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.moveInDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.moveInDate && <p className="text-red-500 text-sm mt-1">{errors.moveInDate}</p>}
              </div>
            </div>

            {/* 設施配備 */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-6">設施配備</h2>
              
              <div className="grid md:grid-cols-4 gap-3">
                {availableAmenities.map((amenity) => (
                  <label key={amenity} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="mr-2"
                    />
                    {amenity}
                  </label>
                ))}
              </div>
              {errors.amenities && <p className="text-red-500 text-sm mt-2">{errors.amenities}</p>}
            </div>

            {/* 圖片上傳 */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-6">房源圖片</h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="text-gray-600">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-2">點擊上傳圖片</p>
                    <p className="text-sm text-gray-500">支援 JPG、PNG 格式，單檔不超過 5MB</p>
                  </div>
                </label>
              </div>

              {/* 圖片預覽 */}
              {previewImages.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">已上傳的圖片</h3>
                  <div className="grid md:grid-cols-4 gap-4">
                    {previewImages.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`預覽 ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 提交按鈕 */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/listings')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={!isConnected || isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? '上架中...' : '上架房源'}
              </button>
            </div>
          </form>
        </div>

        {/* 確認對話框 */}
        <ConfirmDialog
          isOpen={showConfirmDialog}
          title="確認上架房源"
          message={`確定要上架這個房源嗎？\n\n房源標題: ${formData.title}\n地址: ${formData.location}\n月租金: ${formData.price} SOL\n押金: ${formData.deposit} SOL`}
          confirmText="確認上架"
          cancelText="取消"
          type="info"
          onConfirm={handleConfirmSubmit}
          onCancel={() => setShowConfirmDialog(false)}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default AddListing; 