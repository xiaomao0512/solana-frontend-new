// 調試工具
export const debugWallet = () => {
  console.log('=== 錢包調試資訊 ===');
  console.log('window.solana:', window.solana);
  console.log('window.solana?.isPhantom:', window.solana?.isPhantom);
  console.log('window.solana?.publicKey:', window.solana?.publicKey);
  console.log('window.solana?.isConnected:', window.solana?.isConnected);
  
  // 檢查是否有其他錢包
  console.log('window.ethereum:', (window as any).ethereum);
  console.log('window.phantom:', (window as any).phantom);
  
  // 檢查瀏覽器環境
  console.log('User Agent:', navigator.userAgent);
  console.log('Platform:', navigator.platform);
  
  return {
    hasSolana: !!window.solana,
    isPhantom: !!window.solana?.isPhantom,
    hasPublicKey: !!window.solana?.publicKey,
    isConnected: !!window.solana?.isConnected
  };
};

// 測試錢包連接
export const testWalletConnection = async () => {
  try {
    if (!window.solana || !window.solana.isPhantom) {
      throw new Error('Phantom 錢包未安裝');
    }
    
    console.log('嘗試連接 Phantom 錢包...');
    const response = await window.solana.connect();
    console.log('連接成功:', response);
    return response;
  } catch (error) {
    console.error('連接失敗:', error);
    throw error;
  }
};

// 檢查網路狀態
export const checkNetworkStatus = async () => {
  try {
    const connection = new (await import('@solana/web3.js')).Connection(
      (await import('@solana/web3.js')).clusterApiUrl('devnet'),
      'confirmed'
    );
    
    const version = await connection.getVersion();
    console.log('Solana 網路版本:', version);
    return version;
  } catch (error) {
    console.error('網路檢查失敗:', error);
    throw error;
  }
}; 