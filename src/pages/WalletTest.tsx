import React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { debugWallet, testWalletConnection, checkNetworkStatus } from "../utils/debug";

const WalletTest = () => {
  const { connected, publicKey, disconnect, wallet } = useWallet();
  const [balance, setBalance] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(false);

  const connection = React.useMemo(() => {
    return new Connection(clusterApiUrl(WalletAdapterNetwork.Devnet), 'confirmed');
  }, []);

  const getBalance = React.useCallback(async () => {
    if (!publicKey) return;
    
    setLoading(true);
    try {
      const balance = await connection.getBalance(publicKey);
      setBalance(balance / 1000000000); // 轉換為 SOL
    } catch (error) {
      console.error('獲取餘額失敗:', error);
    } finally {
      setLoading(false);
    }
  }, [publicKey, connection]);

  const handleDebug = () => {
    debugWallet();
  };

  const handleTestConnection = async () => {
    try {
      await testWalletConnection();
    } catch (error) {
      console.error('測試連接失敗:', error);
    }
  };

  const handleCheckNetwork = async () => {
    try {
      await checkNetworkStatus();
    } catch (error) {
      console.error('網路檢查失敗:', error);
    }
  };

  React.useEffect(() => {
    if (connected && publicKey) {
      getBalance();
    } else {
      setBalance(null);
    }
  }, [connected, publicKey, getBalance]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">錢包連接測試</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <WalletMultiButton className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg" />
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">連接狀態</h3>
              <p className="text-sm">
                狀態: <span className={connected ? "text-green-600" : "text-red-600"}>
                  {connected ? "已連接" : "未連接"}
                </span>
              </p>
            </div>

            {connected && publicKey && (
              <>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">錢包地址</h3>
                  <p className="text-sm font-mono break-all">{publicKey.toString()}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">餘額</h3>
                  {loading ? (
                    <p className="text-sm">載入中...</p>
                  ) : (
                    <p className="text-sm">
                      {balance !== null ? `${balance.toFixed(4)} SOL` : "無法獲取餘額"}
                    </p>
                  )}
                  <button
                    onClick={getBalance}
                    disabled={loading}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    更新餘額
                  </button>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">錢包資訊</h3>
                  <p className="text-sm">錢包名稱: {wallet?.adapter.name || "未知"}</p>
                  <p className="text-sm">錢包圖標: {wallet?.adapter.icon || "無"}</p>
                </div>
              </>
            )}

            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-blue-900">調試資訊</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>window.solana: {typeof window.solana !== 'undefined' ? "存在" : "不存在"}</p>
                <p>window.solana.isPhantom: {window.solana?.isPhantom ? "是" : "否"}</p>
                <p>連接狀態: {connected ? "true" : "false"}</p>
                <p>公鑰: {publicKey ? "存在" : "不存在"}</p>
              </div>
              <div className="mt-4 space-x-2">
                <button
                  onClick={handleDebug}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  調試錢包
                </button>
                <button
                  onClick={handleTestConnection}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  測試連接
                </button>
                <button
                  onClick={handleCheckNetwork}
                  className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                >
                  檢查網路
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletTest; 