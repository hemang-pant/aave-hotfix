import { CA } from '@arcana/ca-sdk';

let ca: CA | null = null;

export const getCA = (network: 'testnet' | 'dev' | 'mainnet' = 'mainnet') => {
  console.log('getCA called');
  if (!ca) {
    ca = new CA({ network });
  }
  return ca;
};
