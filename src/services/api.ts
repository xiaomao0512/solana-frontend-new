// API 基礎配置
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// 請求攔截器
const request = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API 請求失敗:', error);
    throw error;
  }
};

// API 方法
export const api = {
  // 房源相關
  listings: {
    getAll: () => request('/listings'),
    getById: (id: string) => request(`/listings/${id}`),
    create: (data: any) => request('/listings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => request(`/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => request(`/listings/${id}`, {
      method: 'DELETE',
    }),
    search: (params: any) => {
      const searchParams = new URLSearchParams(params);
      return request(`/listings/search?${searchParams}`);
    },
  },

  // 租約相關
  rentals: {
    getAll: () => request('/rentals'),
    getById: (id: string) => request(`/rentals/${id}`),
    create: (data: any) => request('/rentals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => request(`/rentals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    getUserRentals: (userId: string) => request(`/rentals/user/${userId}`),
    payRent: (rentalId: string, data: any) => request(`/rentals/${rentalId}/pay`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },

  // 用戶相關
  users: {
    getProfile: (userId: string) => request(`/users/${userId}`),
    updateProfile: (userId: string, data: any) => request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    getWalletInfo: (userId: string) => request(`/users/${userId}/wallet`),
  },

  // 區塊鏈相關
  blockchain: {
    getTransactionStatus: (txHash: string) => request(`/blockchain/transaction/${txHash}`),
    getNetworkStatus: () => request('/blockchain/status'),
    verifyListing: (listingId: string) => request(`/blockchain/verify/${listingId}`, {
      method: 'POST',
    }),
  },

  // 檔案上傳
  upload: {
    image: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      
      return request('/upload/image', {
        method: 'POST',
        headers: {
          // 移除 Content-Type，讓瀏覽器自動設定
        },
        body: formData,
      });
    },
  },
};

// 錯誤處理
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 響應類型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 分頁響應
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
} 