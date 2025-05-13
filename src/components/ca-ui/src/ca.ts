import { CA } from '@arcana/ca-sdk';

let ca: CA | null = null;

export const getCA = (network: 'testnet' | 'dev' = 'testnet') => {
  console.log('getCA called');
  if (!ca) {
    ca = new CA({ network });
  }
  return ca;
};
