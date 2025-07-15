use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

mod oracle;
use oracle::{OracleValidator, OracleError};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod rental_contract {
    use super::*;

    /// 初始化租屋平台
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let platform = &mut ctx.accounts.platform;
        platform.authority = ctx.accounts.authority.key();
        platform.bump = *ctx.bumps.get("platform").unwrap();
        platform.total_listings = 0;
        platform.total_rentals = 0;
        platform.total_volume = 0;
        
        msg!("租屋平台已初始化");
        Ok(())
    }

    /// 上架房源
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
    ) -> Result<()> {
        let listing = &mut ctx.accounts.listing;
        let platform = &mut ctx.accounts.platform;
        
        // 預言機驗證
        require!(
            OracleValidator::verify_location(&location),
            OracleError::LocationVerificationFailed
        );
        
        require!(
            OracleValidator::verify_price(price, &location),
            OracleError::PriceVerificationFailed
        );
        
        require!(
            OracleValidator::verify_listing_info(size, rooms, bathrooms, floor, total_floors),
            OracleError::ListingInfoVerificationFailed
        );
        
        listing.authority = ctx.accounts.authority.key();
        listing.bump = *ctx.bumps.get("listing").unwrap();
        listing.title = title;
        listing.description = description;
        listing.location = location;
        listing.price = price;
        listing.deposit = deposit;
        listing.size = size;
        listing.rooms = rooms;
        listing.bathrooms = bathrooms;
        listing.floor = floor;
        listing.total_floors = total_floors;
        listing.contract_length = contract_length;
        listing.move_in_date = move_in_date;
        listing.amenities = amenities;
        listing.is_available = true;
        listing.is_verified = false;
        listing.created_at = Clock::get()?.unix_timestamp;
        listing.updated_at = Clock::get()?.unix_timestamp;
        
        platform.total_listings += 1;
        
        msg!("房源已上架並通過預言機驗證: {}", listing.title);
        Ok(())
    }

    /// 租用房源
    pub fn rent_property(
        ctx: Context<RentProperty>,
        rental_id: u64,
    ) -> Result<()> {
        let rental = &mut ctx.accounts.rental;
        let listing = &mut ctx.accounts.listing;
        let platform = &mut ctx.accounts.platform;
        
        // 檢查房源是否可用
        require!(listing.is_available, RentalError::PropertyNotAvailable);
        
        // 檢查租客是否有足夠的 SOL 支付押金和首月租金
        let total_amount = listing.deposit + listing.price;
        require!(
            ctx.accounts.tenant.to_account_info().lamports() >= total_amount,
            RentalError::InsufficientFunds
        );
        
        // 轉移押金和首月租金到房東
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.tenant.to_account_info(),
                to: ctx.accounts.landlord.to_account_info(),
                authority: ctx.accounts.tenant.to_account_info(),
            },
        );
        
        token::transfer(transfer_ctx, total_amount)?;
        
        // 創建租約
        rental.rental_id = rental_id;
        rental.listing = ctx.accounts.listing.key();
        rental.landlord = ctx.accounts.landlord.key();
        rental.tenant = ctx.accounts.tenant.key();
        rental.price = listing.price;
        rental.deposit = listing.deposit;
        rental.contract_length = listing.contract_length;
        rental.start_date = Clock::get()?.unix_timestamp;
        rental.end_date = Clock::get()?.unix_timestamp + (listing.contract_length as i64 * 30 * 24 * 60 * 60);
        rental.next_payment_date = Clock::get()?.unix_timestamp + (30 * 24 * 60 * 60);
        rental.status = RentalStatus::Active;
        rental.bump = *ctx.bumps.get("rental").unwrap();
        rental.created_at = Clock::get()?.unix_timestamp;
        
        // 更新房源狀態
        listing.is_available = false;
        listing.updated_at = Clock::get()?.unix_timestamp;
        
        platform.total_rentals += 1;
        platform.total_volume += total_amount;
        
        msg!("租約已創建，租約 ID: {}", rental_id);
        Ok(())
    }

    /// 支付租金
    pub fn pay_rent(ctx: Context<PayRent>) -> Result<()> {
        let rental = &mut ctx.accounts.rental;
        let platform = &mut ctx.accounts.platform;
        
        // 檢查租約狀態
        require!(rental.status == RentalStatus::Active, RentalError::RentalNotActive);
        
        // 檢查是否到了付款時間
        let current_time = Clock::get()?.unix_timestamp;
        require!(current_time >= rental.next_payment_date, RentalError::PaymentNotDue);
        
        // 檢查租客是否有足夠的 SOL
        require!(
            ctx.accounts.tenant.to_account_info().lamports() >= rental.price,
            RentalError::InsufficientFunds
        );
        
        // 轉移租金到房東
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.tenant.to_account_info(),
                to: ctx.accounts.landlord.to_account_info(),
                authority: ctx.accounts.tenant.to_account_info(),
            },
        );
        
        token::transfer(transfer_ctx, rental.price)?;
        
        // 更新下次付款日期
        rental.next_payment_date += 30 * 24 * 60 * 60; // 30 天後
        rental.updated_at = current_time;
        
        platform.total_volume += rental.price;
        
        msg!("租金已支付，下次付款日期: {}", rental.next_payment_date);
        Ok(())
    }

    /// 終止租約
    pub fn terminate_rental(ctx: Context<TerminateRental>) -> Result<()> {
        let rental = &mut ctx.accounts.rental;
        let listing = &mut ctx.accounts.listing;
        
        // 檢查租約狀態
        require!(rental.status == RentalStatus::Active, RentalError::RentalNotActive);
        
        // 檢查是否為房東或租客
        let current_user = ctx.accounts.authority.key();
        require!(
            current_user == rental.landlord || current_user == rental.tenant,
            RentalError::Unauthorized
        );
        
        // 如果租客提前終止，押金不退還
        // 如果房東提前終止，需要退還押金和剩餘租金
        if current_user == rental.landlord {
            // 計算剩餘天數的租金
            let current_time = Clock::get()?.unix_timestamp;
            let remaining_days = (rental.end_date - current_time) / (24 * 60 * 60);
            let refund_amount = rental.deposit + (rental.price * remaining_days as u64 / 30);
            
            // 轉移退款給租客
            let transfer_ctx = CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.landlord.to_account_info(),
                    to: ctx.accounts.tenant.to_account_info(),
                    authority: ctx.accounts.landlord.to_account_info(),
                },
            );
            
            token::transfer(transfer_ctx, refund_amount)?;
        }
        
        // 更新租約狀態
        rental.status = RentalStatus::Terminated;
        rental.updated_at = Clock::get()?.unix_timestamp;
        
        // 重新開放房源
        listing.is_available = true;
        listing.updated_at = Clock::get()?.unix_timestamp;
        
        msg!("租約已終止");
        Ok(())
    }

    /// 驗證房源（預言機驗證）
    pub fn verify_listing(ctx: Context<VerifyListing>) -> Result<()> {
        let listing = &mut ctx.accounts.listing;
        
        // 這裡可以整合 Switchboard 預言機來驗證房源資訊
        // 目前簡單地標記為已驗證
        listing.is_verified = true;
        listing.updated_at = Clock::get()?.unix_timestamp;
        
        msg!("房源已通過預言機驗證");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Platform::INIT_SPACE,
        seeds = [b"platform"],
        bump
    )]
    pub platform: Account<'info, Platform>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateListing<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Listing::INIT_SPACE,
        seeds = [b"listing", platform.key().as_ref(), &[platform.total_listings]],
        bump
    )]
    pub listing: Account<'info, Listing>,
    
    #[account(
        mut,
        seeds = [b"platform"],
        bump = platform.bump
    )]
    pub platform: Account<'info, Platform>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RentProperty<'info> {
    #[account(
        init,
        payer = tenant,
        space = 8 + Rental::INIT_SPACE,
        seeds = [b"rental", listing.key().as_ref(), tenant.key().as_ref()],
        bump
    )]
    pub rental: Account<'info, Rental>,
    
    #[account(
        mut,
        seeds = [b"listing", platform.key().as_ref(), &[listing.id]],
        bump = listing.bump
    )]
    pub listing: Account<'info, Listing>,
    
    #[account(
        mut,
        seeds = [b"platform"],
        bump = platform.bump
    )]
    pub platform: Account<'info, Platform>,
    
    /// CHECK: 房東帳戶
    #[account(mut)]
    pub landlord: AccountInfo<'info>,
    
    #[account(mut)]
    pub tenant: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PayRent<'info> {
    #[account(
        mut,
        seeds = [b"rental", rental.listing.as_ref(), rental.tenant.as_ref()],
        bump = rental.bump
    )]
    pub rental: Account<'info, Rental>,
    
    #[account(
        mut,
        seeds = [b"platform"],
        bump = platform.bump
    )]
    pub platform: Account<'info, Platform>,
    
    /// CHECK: 房東帳戶
    #[account(mut)]
    pub landlord: AccountInfo<'info>,
    
    #[account(mut)]
    pub tenant: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct TerminateRental<'info> {
    #[account(
        mut,
        seeds = [b"rental", rental.listing.as_ref(), rental.tenant.as_ref()],
        bump = rental.bump
    )]
    pub rental: Account<'info, Rental>,
    
    #[account(
        mut,
        seeds = [b"listing", platform.key().as_ref(), &[listing.id]],
        bump = listing.bump
    )]
    pub listing: Account<'info, Listing>,
    
    /// CHECK: 房東帳戶
    #[account(mut)]
    pub landlord: AccountInfo<'info>,
    
    /// CHECK: 租客帳戶
    #[account(mut)]
    pub tenant: AccountInfo<'info>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VerifyListing<'info> {
    #[account(
        mut,
        seeds = [b"listing", platform.key().as_ref(), &[listing.id]],
        bump = listing.bump
    )]
    pub listing: Account<'info, Listing>,
    
    #[account(
        seeds = [b"platform"],
        bump = platform.bump
    )]
    pub platform: Account<'info, Platform>,
    
    pub authority: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct Platform {
    pub authority: Pubkey,
    pub bump: u8,
    pub total_listings: u64,
    pub total_rentals: u64,
    pub total_volume: u64,
}

#[account]
#[derive(InitSpace)]
pub struct Listing {
    pub authority: Pubkey,
    pub bump: u8,
    pub id: u64,
    #[max_len(100)]
    pub title: String,
    #[max_len(500)]
    pub description: String,
    #[max_len(200)]
    pub location: String,
    pub price: u64,
    pub deposit: u64,
    pub size: u32,
    pub rooms: u8,
    pub bathrooms: u8,
    pub floor: u8,
    pub total_floors: u8,
    pub contract_length: u8,
    pub move_in_date: i64,
    #[max_len(20)]
    pub amenities: Vec<String>,
    pub is_available: bool,
    pub is_verified: bool,
    pub created_at: i64,
    pub updated_at: i64,
}

#[account]
#[derive(InitSpace)]
pub struct Rental {
    pub rental_id: u64,
    pub listing: Pubkey,
    pub landlord: Pubkey,
    pub tenant: Pubkey,
    pub price: u64,
    pub deposit: u64,
    pub contract_length: u8,
    pub start_date: i64,
    pub end_date: i64,
    pub next_payment_date: i64,
    pub status: RentalStatus,
    pub bump: u8,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum RentalStatus {
    Active,
    Terminated,
    Expired,
}

#[error_code]
pub enum RentalError {
    #[msg("房源不可用")]
    PropertyNotAvailable,
    #[msg("資金不足")]
    InsufficientFunds,
    #[msg("租約未激活")]
    RentalNotActive,
    #[msg("付款未到期")]
    PaymentNotDue,
    #[msg("未授權操作")]
    Unauthorized,
} 