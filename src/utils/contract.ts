import { Connection, PublicKey, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { IDL } from '../types/rental_contract';

// 合約 ID
const PROGRAM_ID = new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS');

// 網路配置
const NETWORK = 'http://127.0.0.1:8899'; // 本地網路
// const NETWORK = 'https://api.devnet.solana.com'; // Devnet

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

export class RentalContractClient {
  private connection: Connection;
  private provider: AnchorProvider;
  private program: Program;

  constructor(wallet: any) {
    this.connection = new Connection(NETWORK, 'confirmed');
    this.provider = new AnchorProvider(this.connection, wallet, {
      commitment: 'confirmed',
      preflightCommitment: 'confirmed',
    });
    this.program = new Program(IDL, PROGRAM_ID, this.provider);
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
    rentalId: number
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

      const tx = await this.program.methods
        .rentProperty(new BN(rentalId))
        .accounts({
          rental: rentalPda,
          listing: listingPda,
          platform: platformPda,
          landlord: landlord,
          tenant: this.provider.wallet.publicKey,
          tokenProgram: web3.TokenProgram.programId,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('房源租用成功:', tx);
      return tx;
    } catch (error) {
      console.error('房源租用失敗:', error);
      throw error;
    }
  }

  // 支付租金
  async payRent(rentalPda: PublicKey, landlord: PublicKey): Promise<string> {
    try {
      const [platformPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('platform')],
        this.program.programId
      );

      const tx = await this.program.methods
        .payRent()
        .accounts({
          rental: rentalPda,
          platform: platformPda,
          landlord: landlord,
          tenant: this.provider.wallet.publicKey,
          tokenProgram: web3.TokenProgram.programId,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('租金支付成功:', tx);
      return tx;
    } catch (error) {
      console.error('租金支付失敗:', error);
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
          tokenProgram: web3.TokenProgram.programId,
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

  // 獲取平台資訊
  async getPlatformData(): Promise<PlatformData | null> {
    try {
      const [platformPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('platform')],
        this.program.programId
      );

      const platformAccount = await this.program.account.platform.fetch(platformPda);
      return platformAccount as PlatformData;
    } catch (error) {
      console.error('獲取平台資訊失敗:', error);
      return null;
    }
  }

  // 獲取房源資訊
  async getListingData(listingPda: PublicKey): Promise<ListingData | null> {
    try {
      const listingAccount = await this.program.account.listing.fetch(listingPda);
      return listingAccount as ListingData;
    } catch (error) {
      console.error('獲取房源資訊失敗:', error);
      return null;
    }
  }

  // 獲取租約資訊
  async getRentalData(rentalPda: PublicKey): Promise<RentalData | null> {
    try {
      const rentalAccount = await this.program.account.rental.fetch(rentalPda);
      return rentalAccount as RentalData;
    } catch (error) {
      console.error('獲取租約資訊失敗:', error);
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

      const listings: ListingData[] = [];
      const platformData = await this.getPlatformData();
      
      if (!platformData) return listings;

      // 遍歷所有房源
      for (let i = 0; i < platformData.totalListings.toNumber(); i++) {
        try {
          const [listingPda] = PublicKey.findProgramAddressSync(
            [
              Buffer.from('listing'),
              platformPda.toBuffer(),
              Buffer.from([i])
            ],
            this.program.programId
          );

          const listingData = await this.getListingData(listingPda);
          if (listingData) {
            listings.push(listingData);
          }
        } catch (error) {
          console.warn(`獲取房源 ${i} 失敗:`, error);
        }
      }

      return listings;
    } catch (error) {
      console.error('獲取所有房源失敗:', error);
      return [];
    }
  }

  // 獲取用戶的租約
  async getUserRentals(userPublicKey: PublicKey): Promise<RentalData[]> {
    try {
      const rentals: RentalData[] = [];
      
      // 這裡需要實現更複雜的查詢邏輯
      // 由於 Solana 的限制，我們需要遍歷所有可能的租約
      // 在實際應用中，建議使用索引服務或後端 API

      return rentals;
    } catch (error) {
      console.error('獲取用戶租約失敗:', error);
      return [];
    }
  }

  // 檢查錢包餘額
  async getWalletBalance(publicKey: PublicKey): Promise<number> {
    try {
      const balance = await this.connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('獲取錢包餘額失敗:', error);
      return 0;
    }
  }
}

// 工具函數
export const formatSol = (lamports: BN): string => {
  return (lamports.toNumber() / LAMPORTS_PER_SOL).toFixed(4);
};

export const formatDate = (timestamp: BN): string => {
  return new Date(timestamp.toNumber() * 1000).toLocaleDateString('zh-TW');
};

export const getRentalStatusText = (status: number): string => {
  switch (status) {
    case 0: return '進行中';
    case 1: return '已終止';
    case 2: return '已到期';
    default: return '未知';
  }
}; 