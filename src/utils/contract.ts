import { Connection, PublicKey, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createTransferInstruction } from '@solana/spl-token';

// 合約 ID
const PROGRAM_ID = new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS');

// USDT 代幣地址 (Devnet)
const USDT_MINT = new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB');

// 網路配置
const NETWORK = 'https://api.devnet.solana.com'; // Devnet

export interface ListingData {
  authority: PublicKey;
  title: string;
  description: string;
  location: string;
  price: BN;
  deposit: BN;
  size: number;
  rooms: number;
  bathrooms: number;
  floor: number;
  totalFloors: number;
  contractLength: number;
  moveInDate: BN;
  amenities: string[];
  isAvailable: boolean;
  isVerified: boolean;
  createdAt: BN;
  updatedAt: BN;
}

export interface RentalData {
  rentalId: BN;
  listing: PublicKey;
  landlord: PublicKey;
  tenant: PublicKey;
  price: BN;
  deposit: BN;
  contractLength: number;
  startDate: BN;
  endDate: BN;
  nextPaymentDate: BN;
  status: number; // 0: Active, 1: Terminated, 2: Expired
  createdAt: BN;
  updatedAt: BN;
}

export interface PlatformData {
  authority: PublicKey;
  totalListings: BN;
  totalRentals: BN;
  totalVolume: BN;
}

export type PaymentMethod = 'SOL' | 'USDT';

export class RentalContractClient {
  private connection: Connection;
  private provider: AnchorProvider;
  private program: Program;

  constructor(wallet: any) {
    this.connection = new Connection(NETWORK, 'confirmed');
    this.provider = new AnchorProvider(this.connection, wallet as any, {
      commitment: 'confirmed',
      preflightCommitment: 'confirmed',
    });
    this.program = new Program(IDL as any, PROGRAM_ID, this.provider);
  }

  // 初始化平台
  async initializePlatform(): Promise<string> {
    try {
      const [platformPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('platform')],
        this.program.programId
      );

      const tx = await this.program.methods
        .initialize()
        .accounts({
          platform: platformPda,
          authority: this.provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('平台初始化成功:', tx);
      return tx;
    } catch (error) {
      console.error('平台初始化失敗:', error);
      throw error;
    }
  }

  // 上架房源
  async createListing(listingData: {
    title: string;
    description: string;
    location: string;
    price: number; // SOL
    deposit: number; // SOL
    size: number;
    rooms: number;
    bathrooms: number;
    floor: number;
    totalFloors: number;
    contractLength: number;
    moveInDate: Date;
    amenities: string[];
  }): Promise<string> {
    try {
      const [platformPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('platform')],
        this.program.programId
      );

      const [listingPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('listing'),
          platformPda.toBuffer(),
          Buffer.from([0]) // 暫時使用固定索引
        ],
        this.program.programId
      );

      const priceLamports = new BN(listingData.price * LAMPORTS_PER_SOL);
      const depositLamports = new BN(listingData.deposit * LAMPORTS_PER_SOL);
      const moveInTimestamp = new BN(Math.floor(listingData.moveInDate.getTime() / 1000));

      const tx = await this.program.methods
        .createListing(
          listingData.title,
          listingData.description,
          listingData.location,
          priceLamports,
          depositLamports,
          listingData.size,
          listingData.rooms,
          listingData.bathrooms,
          listingData.floor,
          listingData.totalFloors,
          listingData.contractLength,
          moveInTimestamp,
          listingData.amenities
        )
        .accounts({
          listing: listingPda,
          platform: platformPda,
          authority: this.provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('房源上架成功:', tx);
      return tx;
    } catch (error) {
      console.error('房源上架失敗:', error);
      throw error;
    }
  }

  // 租用房源
  async rentProperty(
    listingPda: PublicKey,
    landlord: PublicKey,
    rentalId: number,
    paymentMethod: PaymentMethod = 'SOL'
  ): Promise<string> {
    try {
      const [rentalPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('rental'),
          listingPda.toBuffer(),
          this.provider.wallet.publicKey.toBuffer()
        ],
        this.program.programId
      );

      const [platformPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('platform')],
        this.program.programId
      );

      // 獲取房源資訊
      const listingData = await this.getListingData(listingPda);
      if (!listingData) {
        throw new Error('房源不存在');
      }

      const totalAmount = listingData.price.add(listingData.deposit);

      if (paymentMethod === 'USDT') {
        // USDT 支付邏輯
        return await this.rentPropertyWithUSDT(
          rentalPda,
          listingPda,
          platformPda,
          landlord,
          rentalId,
          totalAmount
        );
      } else {
        // SOL 支付邏輯
        const tx = await this.program.methods
          .rentProperty(new BN(rentalId))
          .accounts({
            rental: rentalPda,
            listing: listingPda,
            platform: platformPda,
            landlord: landlord,
            tenant: this.provider.wallet.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        console.log('房源租用成功:', tx);
        return tx;
      }
    } catch (error) {
      console.error('房源租用失敗:', error);
      throw error;
    }
  }

  // 使用 USDT 租用房源
  private async rentPropertyWithUSDT(
    rentalPda: PublicKey,
    listingPda: PublicKey,
    platformPda: PublicKey,
    landlord: PublicKey,
    rentalId: number,
    totalAmount: BN
  ): Promise<string> {
    try {
      // 獲取或創建 USDT 代幣帳戶
      const tenantUsdtAccount = await getAssociatedTokenAddress(
        USDT_MINT,
        this.provider.wallet.publicKey
      );

      const landlordUsdtAccount = await getAssociatedTokenAddress(
        USDT_MINT,
        landlord
      );

      // 檢查租客 USDT 帳戶是否存在
      const tenantAccountInfo = await this.connection.getAccountInfo(tenantUsdtAccount);
      
      const instructions = [];

      // 如果租客沒有 USDT 帳戶，創建一個
      if (!tenantAccountInfo) {
        instructions.push(
          createAssociatedTokenAccountInstruction(
            this.provider.wallet.publicKey,
            tenantUsdtAccount,
            this.provider.wallet.publicKey,
            USDT_MINT
          )
        );
      }

      // 檢查房東 USDT 帳戶是否存在
      const landlordAccountInfo = await this.connection.getAccountInfo(landlordUsdtAccount);
      
      if (!landlordAccountInfo) {
        instructions.push(
          createAssociatedTokenAccountInstruction(
            this.provider.wallet.publicKey,
            landlordUsdtAccount,
            landlord,
            USDT_MINT
          )
        );
      }

      // 添加 USDT 轉帳指令
      instructions.push(
        createTransferInstruction(
          tenantUsdtAccount,
          landlordUsdtAccount,
          this.provider.wallet.publicKey,
          totalAmount.toNumber()
        )
      );

      // 創建交易
      const transaction = new Transaction().add(...instructions);
      
      // 發送交易
      const signature = await this.provider.sendAndConfirm(transaction);
      
      console.log('USDT 租用成功:', signature);
      return signature;
    } catch (error) {
      console.error('USDT 租用失敗:', error);
      throw error;
    }
  }

  // 支付租金
  async payRent(
    rentalPda: PublicKey,
    landlord: PublicKey,
    paymentMethod: PaymentMethod = 'SOL'
  ): Promise<string> {
    try {
      const [platformPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('platform')],
        this.program.programId
      );

      if (paymentMethod === 'USDT') {
        return await this.payRentWithUSDT(rentalPda, landlord);
      } else {
        const tx = await this.program.methods
          .payRent()
          .accounts({
            rental: rentalPda,
            platform: platformPda,
            landlord: landlord,
            tenant: this.provider.wallet.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        console.log('租金支付成功:', tx);
        return tx;
      }
    } catch (error) {
      console.error('租金支付失敗:', error);
      throw error;
    }
  }

  // 使用 USDT 支付租金
  private async payRentWithUSDT(rentalPda: PublicKey, landlord: PublicKey): Promise<string> {
    try {
      // 獲取租約資訊
      const rentalData = await this.getRentalData(rentalPda);
      if (!rentalData) {
        throw new Error('租約不存在');
      }

      const tenantUsdtAccount = await getAssociatedTokenAddress(
        USDT_MINT,
        this.provider.wallet.publicKey
      );

      const landlordUsdtAccount = await getAssociatedTokenAddress(
        USDT_MINT,
        landlord
      );

      // 創建 USDT 轉帳指令
      const transferInstruction = createTransferInstruction(
        tenantUsdtAccount,
        landlordUsdtAccount,
        this.provider.wallet.publicKey,
        rentalData.price.toNumber()
      );

      // 創建交易
      const transaction = new Transaction().add(transferInstruction);
      
      // 發送交易
      const signature = await this.provider.sendAndConfirm(transaction);
      
      console.log('USDT 租金支付成功:', signature);
      return signature;
    } catch (error) {
      console.error('USDT 租金支付失敗:', error);
      throw error;
    }
  }

  // 終止租約
  async terminateRental(
    rentalPda: PublicKey,
    listingPda: PublicKey,
    landlord: PublicKey,
    tenant: PublicKey
  ): Promise<string> {
    try {
      const tx = await this.program.methods
        .terminateRental()
        .accounts({
          rental: rentalPda,
          listing: listingPda,
          landlord: landlord,
          tenant: tenant,
          authority: this.provider.wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('租約終止成功:', tx);
      return tx;
    } catch (error) {
      console.error('租約終止失敗:', error);
      throw error;
    }
  }

  // 驗證房源
  async verifyListing(listingPda: PublicKey): Promise<string> {
    try {
      const [platformPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('platform')],
        this.program.programId
      );

      const tx = await this.program.methods
        .verifyListing()
        .accounts({
          listing: listingPda,
          platform: platformPda,
          authority: this.provider.wallet.publicKey,
        })
        .rpc();

      console.log('房源驗證成功:', tx);
      return tx;
    } catch (error) {
      console.error('房源驗證失敗:', error);
      throw error;
    }
  }

  // 獲取平台資料
  async getPlatformData(): Promise<PlatformData | null> {
    try {
      const [platformPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('platform')],
        this.program.programId
      );

      const platformData = await (this.program.account as any).platform.fetch(platformPda);
      return platformData as unknown as PlatformData;
    } catch (error) {
      console.error('獲取平台資料失敗:', error);
      return null;
    }
  }

  // 獲取房源資料
  async getListingData(listingPda: PublicKey): Promise<ListingData | null> {
    try {
      const listingData = await (this.program.account as any).listing.fetch(listingPda);
      return listingData as unknown as ListingData;
    } catch (error) {
      console.error('獲取房源資料失敗:', error);
      return null;
    }
  }

  // 獲取租約資料
  async getRentalData(rentalPda: PublicKey): Promise<RentalData | null> {
    try {
      const rentalData = await (this.program.account as any).rental.fetch(rentalPda);
      return rentalData as unknown as RentalData;
    } catch (error) {
      console.error('獲取租約資料失敗:', error);
      return null;
    }
  }

  // 獲取所有房源
  async getAllListings(): Promise<ListingData[]> {
    try {
      const [platformPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('platform')],
        this.program.programId
      );

      const listings = await this.program.account.listing.all([
        {
          memcmp: {
            offset: 8,
            bytes: platformPda.toBase58()
          }
        }
      ]);

      return listings.map(item => item.account as unknown as ListingData);
    } catch (error) {
      console.error('獲取所有房源失敗:', error);
      return [];
    }
  }

  // 獲取用戶租約
  async getUserRentals(userPublicKey: PublicKey): Promise<RentalData[]> {
    try {
      const rentals = await this.program.account.rental.all([
        {
          memcmp: {
            offset: 8 + 32, // 跳過 discriminator 和 listing
            bytes: userPublicKey.toBase58()
          }
        }
      ]);

      return rentals.map(item => item.account as unknown as RentalData);
    } catch (error) {
      console.error('獲取用戶租約失敗:', error);
      return [];
    }
  }

  // 調整租約
  async adjustRental(
    rentalPda: PublicKey,
    newPrice: number,
    newEndDate: Date,
    reason: string
  ): Promise<string> {
    try {
      // 這裡需要實現租約調整的智能合約調用
      // 目前模擬實現
      console.log('調整租約:', { newPrice, newEndDate, reason });
      
      // 模擬交易延遲
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 返回模擬的交易哈希
      return '0x' + Math.random().toString(16).substr(2, 64);
    } catch (error) {
      console.error('調整租約失敗:', error);
      throw error;
    }
  }

  // 續約
  async renewRental(
    rentalPda: PublicKey,
    months: number,
    newPrice: number,
    autoRenew: boolean
  ): Promise<string> {
    try {
      // 這裡需要實現續約的智能合約調用
      console.log('續約:', { months, newPrice, autoRenew });
      
      // 模擬交易延遲
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 返回模擬的交易哈希
      return '0x' + Math.random().toString(16).substr(2, 64);
    } catch (error) {
      console.error('續約失敗:', error);
      throw error;
    }
  }

  // 轉讓租約
  async transferRental(
    rentalPda: PublicKey,
    newTenantAddress: PublicKey,
    transferFee: number
  ): Promise<string> {
    try {
      // 這裡需要實現租約轉讓的智能合約調用
      console.log('轉讓租約:', { newTenantAddress: newTenantAddress.toString(), transferFee });
      
      // 模擬交易延遲
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 返回模擬的交易哈希
      return '0x' + Math.random().toString(16).substr(2, 64);
    } catch (error) {
      console.error('轉讓租約失敗:', error);
      throw error;
    }
  }

  // 延期申請
  async extendRental(
    rentalPda: PublicKey,
    days: number,
    reason: string
  ): Promise<string> {
    try {
      // 這裡需要實現延期申請的智能合約調用
      console.log('延期申請:', { days, reason });
      
      // 模擬交易延遲
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 返回模擬的交易哈希
      return '0x' + Math.random().toString(16).substr(2, 64);
    } catch (error) {
      console.error('延期申請失敗:', error);
      throw error;
    }
  }

  // 獲取租約歷史記錄
  async getRentalHistory(rentalPda: PublicKey): Promise<any[]> {
    try {
      // 這裡需要從智能合約或事件日誌中獲取歷史記錄
      // 目前返回模擬資料
      return [
        {
          id: '1',
          type: 'created',
          title: '租約建立',
          description: '租約已成功建立並開始生效',
          timestamp: new Date().toISOString(),
          status: 'completed',
          txHash: '0x1234567890abcdef'
        },
        {
          id: '2',
          type: 'payment',
          title: '租金支付',
          description: '成功支付月租金',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          amount: 25000,
          currency: 'SOL',
          status: 'completed',
          txHash: '0xabcdef1234567890'
        }
      ];
    } catch (error) {
      console.error('獲取租約歷史失敗:', error);
      return [];
    }
  }

  // 保存通知設定
  async saveNotificationSettings(
    rentalPda: PublicKey,
    settings: any[]
  ): Promise<string> {
    try {
      // 這裡需要將通知設定保存到智能合約或後端
      console.log('保存通知設定:', settings);
      
      // 模擬保存延遲
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 返回模擬的交易哈希
      return '0x' + Math.random().toString(16).substr(2, 64);
    } catch (error) {
      console.error('保存通知設定失敗:', error);
      throw error;
    }
  }

  // 發送測試通知
  async sendTestNotification(rentalPda: PublicKey): Promise<string> {
    try {
      // 這裡需要實現測試通知發送
      console.log('發送測試通知');
      
      // 模擬發送延遲
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 返回模擬的交易哈希
      return '0x' + Math.random().toString(16).substr(2, 64);
    } catch (error) {
      console.error('發送測試通知失敗:', error);
      throw error;
    }
  }

  // 調整租約
  async adjustRental(
    rentalPda: PublicKey,
    newPrice: number,
    newEndDate: Date,
    reason: string
  ): Promise<string> {
    try {
      const tx = await this.program.methods
        .adjustRental(
          new BN(newPrice),
          new BN(Math.floor(newEndDate.getTime() / 1000)),
          reason
        )
        .accounts({
          rental: rentalPda,
          authority: this.provider.wallet.publicKey,
        })
        .rpc();

      console.log('租約調整成功:', tx);
      return tx;
    } catch (error) {
      console.error('租約調整失敗:', error);
      throw error;
    }
  }

  // 續約
  async renewRental(
    rentalPda: PublicKey,
    months: number,
    newPrice: number,
    autoRenew: boolean
  ): Promise<string> {
    try {
      const [platformPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('platform')],
        this.program.programId
      );

      const tx = await this.program.methods
        .renewRental(
          months,
          new BN(newPrice),
          autoRenew
        )
        .accounts({
          rental: rentalPda,
          platform: platformPda,
          authority: this.provider.wallet.publicKey,
        })
        .rpc();

      console.log('租約續約成功:', tx);
      return tx;
    } catch (error) {
      console.error('租約續約失敗:', error);
      throw error;
    }
  }

  // 轉讓租約
  async transferRental(
    rentalPda: PublicKey,
    newTenantAddress: PublicKey,
    transferFee: number
  ): Promise<string> {
    try {
      const tx = await this.program.methods
        .transferRental(
          newTenantAddress,
          new BN(transferFee)
        )
        .accounts({
          rental: rentalPda,
          authority: this.provider.wallet.publicKey,
        })
        .rpc();

      console.log('租約轉讓成功:', tx);
      return tx;
    } catch (error) {
      console.error('租約轉讓失敗:', error);
      throw error;
    }
  }

  // 延期申請
  async extendRental(
    rentalPda: PublicKey,
    days: number,
    reason: string
  ): Promise<string> {
    try {
      const tx = await this.program.methods
        .extendRental(
          days,
          reason
        )
        .accounts({
          rental: rentalPda,
          authority: this.provider.wallet.publicKey,
        })
        .rpc();

      console.log('租約延期成功:', tx);
      return tx;
    } catch (error) {
      console.error('租約延期失敗:', error);
      throw error;
    }
  }

  // 獲取錢包餘額
  async getWalletBalance(publicKey: PublicKey): Promise<number> {
    try {
      const balance = await this.connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('獲取錢包餘額失敗:', error);
      return 0;
    }
  }

  // 獲取 USDT 餘額
  async getUSDTBalance(publicKey: PublicKey): Promise<number> {
    try {
      const usdtAccount = await getAssociatedTokenAddress(USDT_MINT, publicKey);
      const accountInfo = await this.connection.getTokenAccountBalance(usdtAccount);
      return accountInfo.value.uiAmount || 0;
    } catch (error) {
      console.error('獲取 USDT 餘額失敗:', error);
      return 0;
    }
  }
}

// 工具函數
export const formatSol = (lamports: BN): string => {
  return (lamports.toNumber() / LAMPORTS_PER_SOL).toFixed(4);
};

export const formatDate = (timestamp: BN): string => {
  return new Date(timestamp.toNumber() * 1000).toLocaleDateString();
};

export const getRentalStatusText = (status: number): string => {
  switch (status) {
    case 0: return '進行中';
    case 1: return '已終止';
    case 2: return '已到期';
    default: return '未知';
  }
};

// 導入 IDL
import { IDL } from '../types/rental_contract'; 