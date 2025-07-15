# Solana 租屋網智能合約

基於 Anchor 框架開發的 Solana 區塊鏈租屋智能合約，整合 Switchboard 預言機驗證功能。

## 🏗 合約架構

### 主要帳戶結構

#### 1. Platform (平台帳戶)
```rust
pub struct Platform {
    pub authority: Pubkey,        // 平台管理員
    pub bump: u8,                 // PDA bump
    pub total_listings: u64,      // 總房源數
    pub total_rentals: u64,       // 總租約數
    pub total_volume: u64,        // 總交易量
}
```

#### 2. Listing (房源帳戶)
```rust
pub struct Listing {
    pub authority: Pubkey,        // 房東地址
    pub bump: u8,                 // PDA bump
    pub id: u64,                  // 房源 ID
    pub title: String,            // 房源標題
    pub description: String,      // 房源描述
    pub location: String,         // 房源地址
    pub price: u64,               // 月租金 (lamports)
    pub deposit: u64,             // 押金 (lamports)
    pub size: u32,                // 坪數
    pub rooms: u8,                // 房間數
    pub bathrooms: u8,            // 衛浴數
    pub floor: u8,                // 樓層
    pub total_floors: u8,         // 總樓層
    pub contract_length: u8,      // 租期 (月)
    pub move_in_date: i64,        // 入住日期
    pub amenities: Vec<String>,   // 設施配備
    pub is_available: bool,       // 是否可租
    pub is_verified: bool,        // 是否已驗證
    pub created_at: i64,          // 創建時間
    pub updated_at: i64,          // 更新時間
}
```

#### 3. Rental (租約帳戶)
```rust
pub struct Rental {
    pub rental_id: u64,           // 租約 ID
    pub listing: Pubkey,          // 房源地址
    pub landlord: Pubkey,         // 房東地址
    pub tenant: Pubkey,           // 租客地址
    pub price: u64,               // 月租金
    pub deposit: u64,             // 押金
    pub contract_length: u8,      // 租期
    pub start_date: i64,          // 開始日期
    pub end_date: i64,            // 結束日期
    pub next_payment_date: i64,   // 下次付款日期
    pub status: RentalStatus,     // 租約狀態
    pub bump: u8,                 // PDA bump
    pub created_at: i64,          // 創建時間
    pub updated_at: i64,          // 更新時間
}
```

### 主要功能

#### 1. 初始化平台
```rust
pub fn initialize(ctx: Context<Initialize>) -> Result<()>
```
- 創建平台管理帳戶
- 設定平台管理員
- 初始化統計數據

#### 2. 上架房源
```rust
pub fn create_listing(
    ctx: Context<CreateListing>,
    title: String,
    description: String,
    location: String,
    price: u64,
    deposit: u64,
    size: u32,
    rooms: u8,
    bathrooms: u8,
    floor: u8,
    total_floors: u8,
    contract_length: u8,
    move_in_date: i64,
    amenities: Vec<String>,
) -> Result<()>
```
- 創建房源帳戶
- 驗證房源資訊（預言機）
- 更新平台統計

#### 3. 租用房源
```rust
pub fn rent_property(ctx: Context<RentProperty>, rental_id: u64) -> Result<()>
```
- 檢查房源可用性
- 轉移押金和首月租金
- 創建租約帳戶
- 更新房源狀態

#### 4. 支付租金
```rust
pub fn pay_rent(ctx: Context<PayRent>) -> Result<()>
```
- 檢查租約狀態
- 驗證付款時間
- 轉移租金
- 更新下次付款日期

#### 5. 終止租約
```rust
pub fn terminate_rental(ctx: Context<TerminateRental>) -> Result<()>
```
- 檢查授權
- 處理退款（房東終止）
- 更新租約狀態
- 重新開放房源

#### 6. 驗證房源
```rust
pub fn verify_listing(ctx: Context<VerifyListing>) -> Result<()>
```
- 整合 Switchboard 預言機
- 驗證房源資訊真實性
- 標記驗證狀態

## 🔗 Switchboard 預言機整合

### 驗證功能

#### 1. 地理位置驗證
```rust
pub fn verify_location(location: &str) -> bool
```
- 驗證地址格式
- 檢查地區有效性
- 整合地理編碼服務

#### 2. 價格合理性驗證
```rust
pub fn verify_price(price: u64, location: &str) -> bool
```
- 根據地區驗證租金範圍
- 整合市場價格預言機
- 防止價格操縱

#### 3. 房源資訊驗證
```rust
pub fn verify_listing_info(
    size: u32,
    rooms: u8,
    bathrooms: u8,
    floor: u8,
    total_floors: u8,
) -> bool
```
- 驗證房源規格合理性
- 檢查數據一致性
- 防止虛假資訊

## 🛠 開發環境設定

### 前置需求
- Rust 1.70+
- Solana CLI 1.17+
- Anchor CLI 0.29+
- Node.js 16+

### 安裝步驟

1. **安裝 Rust**
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

2. **安裝 Solana CLI**
```bash
sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"
```

3. **安裝 Anchor CLI**
```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

4. **安裝專案依賴**
```bash
cd anchor
npm install
```

### 建構合約
```bash
anchor build
```

### 測試合約
```bash
anchor test
```

### 部署合約
```bash
# 本地網路
anchor deploy

# Devnet
anchor deploy --provider.cluster devnet
```

## 📝 測試

### 運行所有測試
```bash
anchor test
```

### 測試覆蓋範圍
- ✅ 平台初始化
- ✅ 房源上架
- ✅ 房源租用
- ✅ 租金支付
- ✅ 租約終止
- ✅ 房源驗證
- ✅ 預言機整合

## 🔒 安全性考量

### 1. 輸入驗證
- 所有用戶輸入都經過驗證
- 防止惡意數據注入
- 數值範圍檢查

### 2. 權限控制
- 使用 PDA 確保帳戶唯一性
- 檢查操作權限
- 防止未授權訪問

### 3. 資金安全
- 使用託管合約管理押金
- 自動化租金支付
- 防止資金丟失

### 4. 預言機安全
- 多重預言機驗證
- 防止預言機攻擊
- 數據一致性檢查

## 📊 性能優化

### 1. 帳戶設計
- 使用 PDA 減少帳戶創建成本
- 優化數據結構大小
- 減少不必要的存儲

### 2. 指令優化
- 合併相關操作
- 減少跨程式調用
- 優化計算邏輯

### 3. 查詢優化
- 使用索引服務
- 實現分頁查詢
- 緩存常用數據

## 🚀 部署指南

### 1. 本地開發
```bash
# 啟動本地 Solana 節點
solana-test-validator

# 建構合約
anchor build

# 部署合約
anchor deploy
```

### 2. Devnet 部署
```bash
# 設定網路
solana config set --url devnet

# 獲取測試 SOL
solana airdrop 2

# 部署合約
anchor deploy --provider.cluster devnet
```

### 3. Mainnet 部署
```bash
# 設定網路
solana config set --url mainnet-beta

# 部署合約
anchor deploy --provider.cluster mainnet-beta
```

## 🔧 配置檔案

### Anchor.toml
```toml
[features]
seeds = false
skip-lint = false

[programs.localnet]
rental_contract = "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"

[registry]
url = "https://api.apr.dev"

[provider]
cluster = "localnet"
wallet = "~/.config/solana/id.json"

[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
```

### Cargo.toml
```toml
[package]
name = "rental-contract"
version = "0.1.0"
description = "Solana Rental Contract"
edition = "2021"

[lib]
crate-type = ["cdylib", "lib"]
name = "rental_contract"

[dependencies]
anchor-lang = "0.29.0"
anchor-spl = "0.29.0"
solana-program = "~1.17.0"
```

## 📈 監控與分析

### 1. 交易監控
- 監控所有合約交易
- 追蹤錯誤和異常
- 性能指標分析

### 2. 數據分析
- 房源統計分析
- 租金趨勢分析
- 用戶行為分析

### 3. 安全監控
- 異常交易檢測
- 預言機攻擊檢測
- 資金流向追蹤

## 🤝 貢獻指南

### 開發流程
1. Fork 專案
2. 建立功能分支
3. 實現功能並測試
4. 提交 Pull Request

### 代碼規範
- 使用 Rust 標準格式
- 添加詳細註釋
- 編寫單元測試
- 遵循安全最佳實踐

## 📄 授權

本專案採用 MIT 授權條款。

## 📞 支援

如有問題或建議，請透過以下方式聯絡：
- GitHub Issues
- Discord 社群
- 技術文檔

---

**注意**: 在生產環境部署前，請確保完成全面的安全審計和測試。 