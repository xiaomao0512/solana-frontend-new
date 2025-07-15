import { PublicKey } from '@solana/web3.js';

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: PublicKey }>;
      disconnect: () => Promise<void>;
      on: (event: string, callback: (args: any) => void) => void;
      publicKey: PublicKey | null;
    };
  }
}

export {}; 