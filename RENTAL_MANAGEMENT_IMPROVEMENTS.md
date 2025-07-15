# 租約管理功能完善

## 新增功能

### 1. 租約管理組件 (`RentalManagement.tsx`)
- **功能概述**: 提供完整的租約管理界面，包含多個標籤頁
- **主要功能**:
  - 租約詳情查看
  - 租約調整（租金、租期）
  - 續約功能
  - 租約轉讓
  - 延期申請
  - 歷史記錄查看
  - 通知設定管理

### 2. 租約歷史記錄 (`RentalHistory.tsx`)
- **功能概述**: 顯示租約的所有重要事件和變更歷史
- **主要功能**:
  - 時間線式歷史記錄展示
  - 事件類型圖標和顏色區分
  - 交易哈希連結到 Solscan
  - 金額和狀態顯示
  - 匯出歷史記錄功能

### 3. 租約通知設定 (`RentalNotifications.tsx`)
- **功能概述**: 管理租約相關的通知設定
- **主要功能**:
  - 多種通知類型（租金到期、租約到期、調整等）
  - 提前通知天數設定
  - 多管道通知（郵件、推播、簡訊）
  - 測試通知功能
  - 設定保存和同步

## 詳細功能說明

### 租約管理標籤頁

#### 1. 租約詳情
- 基本資訊顯示（房源、地址、狀態）
- 財務資訊（租金、押金、支付方式）
- 租期資訊（開始日期、結束日期、合約地址）
- 操作選項（終止、調整、續約、轉讓、延期）

#### 2. 租約調整
- 新租金設定
- 新結束日期設定
- 調整原因說明
- 需要雙方同意的調整流程

#### 3. 續約功能
- 續約期數選擇（6、12、18、24個月）
- 新租金設定
- 自動續約選項
- 續約確認流程

#### 4. 租約轉讓
- 新租客錢包地址輸入
- 轉讓費用設定
- 轉讓原因說明
- 需要房東同意的轉讓流程

#### 5. 延期申請
- 延期天數選擇（7、14、30、60天）
- 延期原因選擇
- 詳細說明輸入
- 需要房東同意的延期流程

#### 6. 歷史記錄
- 租約建立記錄
- 租金支付記錄
- 租約調整記錄
- 交易哈希連結
- 事件狀態顯示

#### 7. 通知設定
- 租金到期提醒
- 租約到期提醒
- 租約調整通知
- 維修通知
- 押金處理通知

## 技術實現

### 組件架構
```
RentalManagement
├── 標籤頁導航
├── 租約詳情
├── 租約調整
├── 續約功能
├── 租約轉讓
├── 延期申請
├── RentalHistory (歷史記錄)
└── RentalNotifications (通知設定)
```

### 資料結構

#### 租約資料
```typescript
interface Rental {
  id: string;
  title: string;
  address: string;
  price: number;
  deposit: number;
  status: string;
  startDate: string;
  endDate: string;
  nextPayment: string;
  contractAddress: string;
  landlord: string;
  tenant: string;
  paymentMethod: 'SOL' | 'USDT';
  type: 'tenant' | 'landlord';
}
```

#### 歷史事件
```typescript
interface RentalEvent {
  id: string;
  type: 'created' | 'payment' | 'adjustment' | 'renewal' | 'transfer' | 'termination' | 'extension';
  title: string;
  description: string;
  timestamp: string;
  amount?: number;
  currency?: string;
  status: 'completed' | 'pending' | 'failed';
  txHash?: string;
}
```

#### 通知設定
```typescript
interface NotificationSetting {
  id: string;
  type: 'payment_due' | 'contract_expiry' | 'rental_adjustment' | 'maintenance' | 'security_deposit';
  title: string;
  description: string;
  enabled: boolean;
  daysInAdvance: number;
  channels: ('email' | 'push' | 'sms')[];
}
```

### 狀態管理
- 使用 React useState 管理組件狀態
- 模擬資料用於展示功能
- 實際整合時可連接智能合約

## 用戶體驗

### 1. 直觀的操作流程
- 標籤頁式界面，功能分類清晰
- 表單驗證和錯誤提示
- 確認對話框防止誤操作

### 2. 視覺化設計
- 彩色圖標區分不同功能
- 狀態標籤顯示操作結果
- 時間線式歷史記錄

### 3. 響應式設計
- 支援桌面和移動設備
- 自適應佈局
- 觸控友好的界面

## 整合方式

### 1. 在我的租約頁面中
```tsx
// 在租約卡片中添加管理按鈕
<button
  onClick={() => handleRentalManagement(rental)}
  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
>
  管理租約
</button>

// 租約管理對話框
{showRentalManagement && selectedRental && (
  <RentalManagement
    rental={selectedRental}
    onClose={() => setShowRentalManagement(false)}
    onUpdate={() => {
      // 重新載入租約資料
      setShowRentalManagement(false);
    }}
  />
)}
```

### 2. 智能合約整合
- 租約調整需要調用智能合約
- 支付功能整合 Solana 錢包
- 事件記錄存儲在區塊鏈上

### 3. 通知系統整合
- 電子郵件通知
- 推播通知（瀏覽器/移動端）
- 簡訊通知（可選）

## 後續改進

### 1. 智能合約功能
- 實現真實的租約調整邏輯
- 整合預言機驗證
- 實現自動化支付

### 2. 通知系統
- 整合第三方通知服務
- 實現即時通知推送
- 支援多語言通知

### 3. 文件管理
- 租約文件上傳和下載
- 電子簽名功能
- 文件版本控制

### 4. 爭議解決
- 爭議提交功能
- 仲裁流程管理
- 證據上傳和存儲

### 5. 數據分析
- 租約統計分析
- 支付歷史分析
- 用戶行為分析

## 使用指南

### 1. 訪問租約管理
1. 進入「我的租約」頁面
2. 找到要管理的租約
3. 點擊「管理租約」按鈕

### 2. 調整租約
1. 選擇「租約調整」標籤
2. 修改租金或租期
3. 填寫調整原因
4. 提交調整申請

### 3. 續約
1. 選擇「續約」標籤
2. 設定續約期數和新租金
3. 選擇是否啟用自動續約
4. 確認續約

### 4. 查看歷史記錄
1. 選擇「歷史記錄」標籤
2. 瀏覽所有租約事件
3. 點擊交易哈希查看區塊鏈記錄

### 5. 設定通知
1. 選擇「通知設定」標籤
2. 啟用/禁用不同類型的通知
3. 設定提前通知天數
4. 選擇通知管道
5. 保存設定

這些功能大大提升了租約管理的完整性和用戶體驗，為用戶提供了全面的租約管理工具。 