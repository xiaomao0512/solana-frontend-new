use anchor_lang::prelude::*;
use anchor_lang::solana_program::keccak;

/// Switchboard 預言機驗證器
pub struct OracleValidator;

impl OracleValidator {
    /// 驗證房源位置資訊
    pub fn verify_location(location: &str) -> bool {
        // 這裡可以整合 Switchboard 的地理位置驗證
        // 目前簡單檢查是否包含有效的地址格式
        location.contains("市") && location.contains("區")
    }

    /// 驗證租金價格合理性
    pub fn verify_price(price: u64, location: &str) -> bool {
        // 根據地區驗證租金價格是否合理
        // 這裡可以整合 Switchboard 的價格預言機
        let price_in_sol = price as f64 / 1_000_000_000.0; // 轉換為 SOL
        
        match location {
            loc if loc.contains("信義") || loc.contains("大安") => {
                // 台北精華區租金範圍
                price_in_sol >= 20.0 && price_in_sol <= 100.0
            }
            loc if loc.contains("台北") => {
                // 台北一般區域租金範圍
                price_in_sol >= 10.0 && price_in_sol <= 50.0
            }
            loc if loc.contains("台中") => {
                // 台中租金範圍
                price_in_sol >= 5.0 && price_in_sol <= 30.0
            }
            loc if loc.contains("高雄") => {
                // 高雄租金範圍
                price_in_sol >= 3.0 && price_in_sol <= 20.0
            }
            _ => {
                // 其他地區
                price_in_sol >= 1.0 && price_in_sol <= 50.0
            }
        }
    }

    /// 驗證房源基本資訊
    pub fn verify_listing_info(
        size: u32,
        rooms: u8,
        bathrooms: u8,
        floor: u8,
        total_floors: u8,
    ) -> bool {
        // 驗證房源資訊的合理性
        size > 0 && size <= 1000 && // 坪數範圍 1-1000
        rooms > 0 && rooms <= 10 && // 房間數範圍 1-10
        bathrooms > 0 && bathrooms <= 5 && // 衛浴數範圍 1-5
        floor > 0 && floor <= total_floors && // 樓層合理性
        total_floors > 0 && total_floors <= 100 // 總樓層範圍
    }

    /// 生成驗證雜湊
    pub fn generate_verification_hash(
        title: &str,
        location: &str,
        price: u64,
        size: u32,
    ) -> [u8; 32] {
        let data = format!("{}:{}:{}:{}", title, location, price, size);
        keccak::hash(data.as_bytes()).to_bytes()
    }

    /// 驗證 Switchboard 預言機回應
    pub fn verify_switchboard_response(
        response: &[u8],
        expected_hash: &[u8; 32],
    ) -> bool {
        // 這裡應該驗證 Switchboard 的實際回應
        // 目前簡單比較雜湊值
        response.len() >= 32 && &response[..32] == expected_hash
    }
}

/// 預言機驗證錯誤
#[error_code]
pub enum OracleError {
    #[msg("房源位置驗證失敗")]
    LocationVerificationFailed,
    #[msg("租金價格驗證失敗")]
    PriceVerificationFailed,
    #[msg("房源資訊驗證失敗")]
    ListingInfoVerificationFailed,
    #[msg("預言機回應驗證失敗")]
    OracleResponseVerificationFailed,
} 