import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletProvider as SolanaWalletProvider, useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string | null;
  balance: {
    SOL: number;
    USDC: number;
  };
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isLoading: boolean;
  error: string | null;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// 內部錢包組件
const WalletContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState({ SOL: 0, USDC: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { publicKey, connected, disconnect, select, wallet, connect } = useSolanaWallet();

  const connection = useMemo(() => {
    return new Connection(clusterApiUrl(WalletAdapterNetwork.Devnet), 'confirmed');
  }, []);

  const updateBalance = async (address: string) => {
    try {
      const publicKey = new PublicKey(address);
      const solBalance = await connection.getBalance(publicKey);
      
      setBalance({
        SOL: solBalance / 1000000000, // 轉換為 SOL
        USDC: 0 // 暫時設為 0，實際應該查詢 USDC 代幣餘額
      });
    } catch (err) {
      console.error('更新餘額失敗:', err);
      setError('更新餘額失敗');
    }
  };

  const refreshBalance = async () => {
    if (publicKey) {
      await updateBalance(publicKey.toString());
    }
  };

  const connectWallet = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 使用 Solana 錢包適配器的連接方法
      if (!connect) {
        throw new Error('錢包適配器未初始化');
      }

      await connect();
      console.log('錢包連接成功');
      
    } catch (err) {
      console.error('錢包連接錯誤:', err);
      setError(err instanceof Error ? err.message : '錢包連接失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    try {
      disconnect();
      setBalance({ SOL: 0, USDC: 0 });
      setError(null);
    } catch (err) {
      console.error('斷開錢包連接失敗:', err);
    }
  };

  // 當錢包連接狀態改變時更新餘額
  useEffect(() => {
    if (connected && publicKey) {
      updateBalance(publicKey.toString());
    } else {
      setBalance({ SOL: 0, USDC: 0 });
    }
  }, [connected, publicKey, connection]);

  const value: WalletContextType = {
    isConnected: connected,
    walletAddress: publicKey?.toString() || null,
    balance,
    connectWallet,
    disconnectWallet,
    isLoading,
    error,
    refreshBalance
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

// 外部 Provider 組件
export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
    ],
    []
  );

  return (
    <SolanaWalletProvider wallets={wallets} autoConnect={false}>
      <WalletModalProvider>
        <WalletContextProvider>
          {children}
        </WalletContextProvider>
      </WalletModalProvider>
    </SolanaWalletProvider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

 