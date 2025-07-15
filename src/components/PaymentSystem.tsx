import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useNotificationContext } from '../contexts/NotificationContext';
import { RentalContractClient } from '../utils/contract';
import { PublicKey } from '@solana/web3.js';
import LoadingSpinner from './LoadingSpinner';

interface PaymentSystemProps {
  rentalId: string;
  amount: number;
  currency: 'SOL' | 'USDT';
  onPaymentSuccess: (txHash: string) => void;
  onPaymentError: (error: string) => void;
}

const PaymentSystem: React.FC<PaymentSystemProps> = ({
  rentalId,
  amount,
  currency,
  onPaymentSuccess,
  onPaymentError
}) => {
  const { isConnected, walletAddress } = useWallet();
  const { success, error: showError } = useNotificationContext();
  
  const [isLoading, setIsLoading] = useState(false);
  const [contractClient, setContractClient] = useState<RentalContractClient | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'SOL' | 'USDT'>('SOL');
  const [paymentAmount, setPaymentAmount] = useState<number>(amount);

  // 初始化合約客戶端
  useEffect(() => {
    if (isConnected && walletAddress) {
      // 這裡需要從錢包適配器獲取錢包實例
      // 暫時使用模擬的合約客戶端
      setContractClient(null);
    }
  }, [isConnected, walletAddress]);

  // 獲取錢包餘額
  useEffect(() => {
    if (isConnected && contractClient) {
      const fetchBalance = async () => {
        try {
          const balance = await contractClient.getWalletBalance();
          setWalletBalance(balance);
        } catch (error) {
          console.error('獲取錢包餘額失敗:', error);
        }
      };
      fetchBalance();
    }
  }, [isConnected, contractClient]);

  const handlePaymentMethodChange = (method: 'SOL' | 'USDT') => {
    setPaymentMethod(method);
    // 根據匯率調整支付金額
    if (method === 'USDT') {
      // 假設 1 SOL = 100 USDT
      setPaymentAmount(amount * 100);
    } else {
      setPaymentAmount(amount);
    }
  };

  const handlePayment = async () => {
    if (!isConnected) {
      showError('請先連接錢包');
      return;
    }

    if (paymentAmount > walletBalance) {
      showError('錢包餘額不足');
      return;
    }

    setIsLoading(true);
    try {
      if (contractClient) {
        // 使用真實的合約支付方法
        const txHash = await contractClient.payRent(
          new PublicKey(rentalId),
          paymentAmount,
          paymentMethod
        );
        
        success('支付成功', `交易哈希: ${txHash.slice(0, 8)}...`);
        onPaymentSuccess(txHash);
      } else {
        // 模擬支付過程
        await new Promise(resolve => setTimeout(resolve, 3000));
        const mockTxHash = '0x' + Math.random().toString(16).substr(2, 64);
        success('支付成功', `模擬交易哈希: ${mockTxHash.slice(0, 8)}...`);
        onPaymentSuccess(mockTxHash);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '支付失敗';
      showError('支付失敗', errorMessage);
      onPaymentError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatBalance = (balance: number, currency: 'SOL' | 'USDT') => {
    if (currency === 'SOL') {
      return `${balance.toFixed(4)} SOL`;
    } else {
      return `${balance.toFixed(2)} USDT`;
    }
  };

  const formatAmount = (amount: number, currency: 'SOL' | 'USDT') => {
    if (currency === 'SOL') {
      return `${amount.toFixed(4)} SOL`;
    } else {
      return `${amount.toFixed(2)} USDT`;
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">支付系統</h3>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">請先連接錢包以進行支付</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">支付系統</h3>
      
      {/* 錢包資訊 */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">錢包地址:</span>
          <span className="text-sm font-mono text-gray-800">
            {walletAddress?.slice(0, 8)}...{walletAddress?.slice(-8)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">餘額:</span>
          <span className="text-sm font-semibold text-gray-800">
            {formatBalance(walletBalance, paymentMethod)}
          </span>
        </div>
      </div>

      {/* 支付金額 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          支付金額
        </label>
        <div className="text-2xl font-bold text-blue-600">
          {formatAmount(paymentAmount, paymentMethod)}
        </div>
      </div>

      {/* 支付方式選擇 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          支付方式
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handlePaymentMethodChange('SOL')}
            className={`p-3 rounded-lg border-2 transition-colors ${
              paymentMethod === 'SOL'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">S</span>
              </div>
              <span className="font-medium">SOL</span>
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => handlePaymentMethodChange('USDT')}
            className={`p-3 rounded-lg border-2 transition-colors ${
              paymentMethod === 'USDT'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">U</span>
              </div>
              <span className="font-medium">USDT</span>
            </div>
          </button>
        </div>
      </div>

      {/* 匯率資訊 */}
      {paymentMethod !== currency && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-blue-800">
              匯率: 1 SOL = 100 USDT (僅供參考)
            </span>
          </div>
        </div>
      )}

      {/* 餘額檢查 */}
      {paymentAmount > walletBalance && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-red-800">
              餘額不足，請充值後再試
            </span>
          </div>
        </div>
      )}

      {/* 支付按鈕 */}
      <button
        onClick={handlePayment}
        disabled={isLoading || paymentAmount > walletBalance}
        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <LoadingSpinner size="sm" color="white" />
            <span>處理中...</span>
          </div>
        ) : (
          `支付 ${formatAmount(paymentAmount, paymentMethod)}`
        )}
      </button>

      {/* 安全提示 */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>支付將通過 Solana 區塊鏈進行，確保安全可靠</p>
        <p>請確認交易詳情後再進行支付</p>
      </div>
    </div>
  );
};

export default PaymentSystem; 