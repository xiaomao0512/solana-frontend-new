import React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const WalletConnectButton: React.FC = () => {
  const { connected, publicKey } = useWallet();

  return (
    <div className="flex items-center space-x-4">
      <WalletMultiButton className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md" />
      {connected && publicKey && (
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">
            {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
          </span>
        </div>
      )}
    </div>
  );
};

export default WalletConnectButton; 