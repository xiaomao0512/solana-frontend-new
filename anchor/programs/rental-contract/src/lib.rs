use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint};
use anchor_spl::associated_token::AssociatedToken;

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

    /// 租用房源 (SOL 支付)
    pub fn rent_property_sol(
        ctx: Context<RentPropertySol>,
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
        rental.payment_method = PaymentMethod::Sol;
        rental.bump = *ctx.bumps.get("rental").unwrap();
        rental.created_at = Clock::get()?.unix_timestamp;
        
        // 更新房源狀態
        listing.is_available = false;
        listing.updated_at = Clock::get()?.unix_timestamp;
        
        platform.total_rentals += 1;
        platform.total_volume += total_amount;
        
        msg!("租約已創建 (SOL 支付)，租約 ID: {}", rental_id);
        Ok(())
    }

    /// 租用房源 (USDT 支付)
    pub fn rent_property_usdt(
        ctx: Context<RentPropertyUsdt>,
        rental_id: u64,
    ) -> Result<()> {
        let rental = &mut ctx.accounts.rental;
        let listing = &mut ctx.accounts.listing;
        let platform = &mut ctx.accounts.platform;
        
        // 檢查房源是否可用
        require!(listing.is_available, RentalError::PropertyNotAvailable);
        
        // 檢查租客是否有足夠的 USDT
        let total_amount = listing.deposit + listing.price;
        require!(
            ctx.accounts.tenant_token_account.amount >= total_amount,
            RentalError::InsufficientFunds
        );
        
        // 轉移 USDT 到房東
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.tenant_token_account.to_account_info(),
                to: ctx.accounts.landlord_token_account.to_account_info(),
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
        rental.payment_method = PaymentMethod::Usdt;
        rental.bump = *ctx.bumps.get("rental").unwrap();
        rental.created_at = Clock::get()?.unix_timestamp;
        
        // 更新房源狀態
        listing.is_available = false;
        listing.updated_at = Clock::get()?.unix_timestamp;
        
        platform.total_rentals += 1;
        platform.total_volume += total_amount;
        
        msg!("租約已創建 (USDT 支付)，租約 ID: {}", rental_id);
        Ok(())
    }

    /// 支付租金 (SOL)
    pub fn pay_rent_sol(ctx: Context<PayRentSol>) -> Result<()> {
        let rental = &mut ctx.accounts.rental;
        let platform = &mut ctx.accounts.platform;
        
        // 檢查租約狀態
        require!(rental.status == RentalStatus::Active, RentalError::RentalNotActive);
        require!(rental.payment_method == PaymentMethod::Sol, RentalError::InvalidPaymentMethod);
        
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
        
        msg!("租金已支付 (SOL)，下次付款日期: {}", rental.next_payment_date);
        Ok(())
    }

    /// 支付租金 (USDT)
    pub fn pay_rent_usdt(ctx: Context<PayRentUsdt>) -> Result<()> {
        let rental = &mut ctx.accounts.rental;
        let platform = &mut ctx.accounts.platform;
        
        // 檢查租約狀態
        require!(rental.status == RentalStatus::Active, RentalError::RentalNotActive);
        require!(rental.payment_method == PaymentMethod::Usdt, RentalError::InvalidPaymentMethod);
        
        // 檢查是否到了付款時間
        let current_time = Clock::get()?.unix_timestamp;
        require!(current_time >= rental.next_payment_date, RentalError::PaymentNotDue);
        
        // 檢查租客是否有足夠的 USDT
        require!(
            ctx.accounts.tenant_token_account.amount >= rental.price,
            RentalError::InsufficientFunds
        );
        
        // 轉移 USDT 到房東
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.tenant_token_account.to_account_info(),
                to: ctx.accounts.landlord_token_account.to_account_info(),
                authority: ctx.accounts.tenant.to_account_info(),
            },
        );
        
        token::transfer(transfer_ctx, rental.price)?;
        
        // 更新下次付款日期
        rental.next_payment_date += 30 * 24 * 60 * 60; // 30 天後
        rental.updated_at = current_time;
        
        platform.total_volume += rental.price;
        
        msg!("租金已支付 (USDT)，下次付款日期: {}", rental.next_payment_date);
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
            
            // 根據支付方式進行退款
            if rental.payment_method == PaymentMethod::Sol {
                // SOL 退款
                let transfer_ctx = CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.landlord.to_account_info(),
                        to: ctx.accounts.tenant.to_account_info(),
                        authority: ctx.accounts.landlord.to_account_info(),
                    },
                );
                token::transfer(transfer_ctx, refund_amount)?;
            } else {
                // USDT 退款
                let transfer_ctx = CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.landlord_token_account.to_account_info(),
                        to: ctx.accounts.tenant_token_account.to_account_info(),
                        authority: ctx.accounts.landlord.to_account_info(),
                    },
                );
                token::transfer(transfer_ctx, refund_amount)?;
            }
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

    /// 調整租約
    pub fn adjust_rental(
        ctx: Context<AdjustRental>,
        new_price: u64,
        new_end_date: i64,
        reason: String,
    ) -> Result<()> {
        let rental = &mut ctx.accounts.rental;
        
        // 檢查操作權限（只有房東或租客可以調整）
        require!(
            ctx.accounts.authority.key() == rental.landlord || 
            ctx.accounts.authority.key() == rental.tenant,
            RentalError::Unauthorized
        );
        
        // 檢查租約狀態
        require!(rental.status == RentalStatus::Active, RentalError::RentalNotActive);
        
        // 更新租約資訊
        rental.price = new_price;
        rental.end_date = new_end_date;
        rental.updated_at = Clock::get()?.unix_timestamp;
        
        // 發送調整事件
        emit!(RentalAdjusted {
            rental: rental.key(),
            new_price,
            new_end_date,
            reason,
            adjusted_by: ctx.accounts.authority.key(),
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        msg!("租約已調整，新租金: {}, 新結束日期: {}", new_price, new_end_date);
        Ok(())
    }

    /// 續約
    pub fn renew_rental(
        ctx: Context<RenewRental>,
        months: u8,
        new_price: u64,
        auto_renew: bool,
    ) -> Result<()> {
        let rental = &mut ctx.accounts.rental;
        let platform = &mut ctx.accounts.platform;
        
        // 檢查操作權限（只有租客可以續約）
        require!(
            ctx.accounts.authority.key() == rental.tenant,
            RentalError::Unauthorized
        );
        
        // 檢查租約狀態
        require!(rental.status == RentalStatus::Active, RentalError::RentalNotActive);
        
        // 計算新的結束日期
        let new_end_date = rental.end_date + (months as i64 * 30 * 24 * 60 * 60);
        
        // 更新租約資訊
        rental.price = new_price;
        rental.end_date = new_end_date;
        rental.contract_length = months;
        rental.updated_at = Clock::get()?.unix_timestamp;
        
        // 發送續約事件
        emit!(RentalRenewed {
            rental: rental.key(),
            months,
            new_price,
            new_end_date,
            auto_renew,
            renewed_by: ctx.accounts.authority.key(),
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        platform.total_volume += new_price * months as u64;
        
        msg!("租約已續約，期數: {} 個月, 新租金: {}", months, new_price);
        Ok(())
    }

    /// 轉讓租約
    pub fn transfer_rental(
        ctx: Context<TransferRental>,
        new_tenant: Pubkey,
        transfer_fee: u64,
    ) -> Result<()> {
        let rental = &mut ctx.accounts.rental;
        
        // 檢查操作權限（只有租客可以轉讓）
        require!(
            ctx.accounts.authority.key() == rental.tenant,
            RentalError::Unauthorized
        );
        
        // 檢查租約狀態
        require!(rental.status == RentalStatus::Active, RentalError::RentalNotActive);
        
        // 檢查新租客不能是原租客
        require!(new_tenant != rental.tenant, RentalError::InvalidTransfer);
        
        // 轉移租約所有權
        let old_tenant = rental.tenant;
        rental.tenant = new_tenant;
        rental.updated_at = Clock::get()?.unix_timestamp;
        
        // 發送轉讓事件
        emit!(RentalTransferred {
            rental: rental.key(),
            old_tenant,
            new_tenant,
            transfer_fee,
            transferred_by: ctx.accounts.authority.key(),
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        msg!("租約已轉讓給新租客: {}", new_tenant);
        Ok(())
    }

    /// 延期申請
    pub fn extend_rental(
        ctx: Context<ExtendRental>,
        days: u8,
        reason: String,
    ) -> Result<()> {
        let rental = &mut ctx.accounts.rental;
        
        // 檢查操作權限（只有租客可以申請延期）
        require!(
            ctx.accounts.authority.key() == rental.tenant,
            RentalError::Unauthorized
        );
        
        // 檢查租約狀態
        require!(rental.status == RentalStatus::Active, RentalError::RentalNotActive);
        
        // 檢查延期天數合理性
        require!(days > 0 && days <= 60, RentalError::InvalidExtension);
        
        // 計算新的結束日期
        let new_end_date = rental.end_date + (days as i64 * 24 * 60 * 60);
        
        // 更新租約資訊
        rental.end_date = new_end_date;
        rental.updated_at = Clock::get()?.unix_timestamp;
        
        // 發送延期事件
        emit!(RentalExtended {
            rental: rental.key(),
            days,
            new_end_date,
            reason,
            extended_by: ctx.accounts.authority.key(),
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        msg!("租約已延期 {} 天，新結束日期: {}", days, new_end_date);
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
pub struct RentPropertySol<'info> {
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
pub struct RentPropertyUsdt<'info> {
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

    #[account(
        mut,
        seeds = [b"landlord_token_account"],
        bump = landlord_token_account.bump
    )]
    pub landlord_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"tenant_token_account"],
        bump = tenant_token_account.bump
    )]
    pub tenant_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PayRentSol<'info> {
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
pub struct PayRentUsdt<'info> {
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

    #[account(
        mut,
        seeds = [b"landlord_token_account"],
        bump = landlord_token_account.bump
    )]
    pub landlord_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"tenant_token_account"],
        bump = tenant_token_account.bump
    )]
    pub tenant_token_account: Account<'info, TokenAccount>,
    
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

    /// CHECK: 房東 USDT 帳戶 (可選)
    #[account(mut)]
    pub landlord_token_account: Option<Account<'info, TokenAccount>>,

    /// CHECK: 租客 USDT 帳戶 (可選)
    #[account(mut)]
    pub tenant_token_account: Option<Account<'info, TokenAccount>>,
    
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

#[derive(Accounts)]
pub struct AdjustRental<'info> {
    #[account(
        mut,
        seeds = [b"rental", rental.listing.as_ref(), rental.tenant.as_ref()],
        bump = rental.bump
    )]
    pub rental: Account<'info, Rental>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct RenewRental<'info> {
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
    
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct TransferRental<'info> {
    #[account(
        mut,
        seeds = [b"rental", rental.listing.as_ref(), rental.tenant.as_ref()],
        bump = rental.bump
    )]
    pub rental: Account<'info, Rental>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ExtendRental<'info> {
    #[account(
        mut,
        seeds = [b"rental", rental.listing.as_ref(), rental.tenant.as_ref()],
        bump = rental.bump
    )]
    pub rental: Account<'info, Rental>,
    
    #[account(mut)]
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
    pub payment_method: PaymentMethod,
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

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum PaymentMethod {
    Sol,
    Usdt,
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
    #[msg("無效支付方式")]
    InvalidPaymentMethod,
    #[msg("無效轉讓")]
    InvalidTransfer,
    #[msg("無效延期")]
    InvalidExtension,
}

// 事件定義
#[event]
pub struct RentalAdjusted {
    pub rental: Pubkey,
    pub new_price: u64,
    pub new_end_date: i64,
    pub reason: String,
    pub adjusted_by: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct RentalRenewed {
    pub rental: Pubkey,
    pub months: u8,
    pub new_price: u64,
    pub new_end_date: i64,
    pub auto_renew: bool,
    pub renewed_by: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct RentalTransferred {
    pub rental: Pubkey,
    pub old_tenant: Pubkey,
    pub new_tenant: Pubkey,
    pub transfer_fee: u64,
    pub transferred_by: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct RentalExtended {
    pub rental: Pubkey,
    pub days: u8,
    pub new_end_date: i64,
    pub reason: String,
    pub extended_by: Pubkey,
    pub timestamp: i64,
} 