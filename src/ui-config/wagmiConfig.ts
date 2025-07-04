import { Emitter } from '@wagmi/core/internal';
import { getDefaultConfig } from 'connectkit';
import {
  ENABLE_TESTNET,
  FORK_BASE_CHAIN_ID,
  FORK_CHAIN_ID,
  FORK_ENABLED,
  FORK_RPC_URL,
  networkConfigs,
} from 'src/utils/marketsAndNetworksConfig';
import { type Chain } from 'viem';
import { createConfig, CreateConfigParameters, http } from 'wagmi';
import { injected, safe } from 'wagmi/connectors';

import { prodNetworkConfig, testnetConfig } from './networksConfig';
import { AuthProvider } from '@arcana/auth';
import { ArcanaConnector } from '@arcana/auth-wagmi';

const testnetChains = Object.values(testnetConfig).map((config) => config.wagmiChain) as [
  Chain,
  ...Chain[]
];

let prodChains = Object.values(prodNetworkConfig).map((config) => config.wagmiChain) as [
  Chain,
  ...Chain[]
];

const { name, baseAssetDecimals, baseAssetSymbol } = networkConfigs[FORK_BASE_CHAIN_ID];

const forkChain: Chain = {
  id: FORK_CHAIN_ID,
  name: `${name} Fork`,
  nativeCurrency: {
    decimals: baseAssetDecimals,
    name: baseAssetSymbol,
    symbol: baseAssetSymbol,
  },
  rpcUrls: {
    default: { http: [FORK_RPC_URL] },
  },
  testnet: false,
};

if (FORK_ENABLED) {
  prodChains = [forkChain, ...prodChains];
}
const auth = new AuthProvider(`xar_test_58eeafa5256e97d4e58e872b283551b655104e1f`)
const arcanaAuth = ArcanaConnector({
    auth: auth as any
})

const defaultConfig = {
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string,
  appName: 'Aave',
  appDescription: 'Non-custodial liquidity protocol',
  appUrl: 'https://app.aave.com',
  appIcon: 'https://avatars.githubusercontent.com/u/47617460?s=200&v=4',
};

const cypressConfig = createConfig(
  getDefaultConfig({
    chains: [forkChain],
    connectors: [injected()],
    ...defaultConfig,
  })
);

const getTransport = (chainId: number) => {
  return networkConfigs[chainId].publicJsonRPCUrl[0];
};

const buildTransports = (chains: CreateConfigParameters['chains']) =>
  Object.fromEntries(chains.map((chain) => [chain.id, http(getTransport(chain.id))]));

const prodCkConfig = getDefaultConfig({
  chains: ENABLE_TESTNET ? testnetChains : prodChains,
  transports: ENABLE_TESTNET ? undefined : buildTransports(prodChains),
  connectors: [arcanaAuth],
  ...defaultConfig,
});

const familyConnectorId = 'familyAccountsProvider';

const connectorConfig = {
  chains: prodCkConfig.chains,
  emitter: new Emitter(''),
};

const connectors = prodCkConfig.connectors
  ?.map((connector) => {
    // initialize the connector with the emitter so we can access the id
    const c = connector(connectorConfig);
    if (c.id === 'safe') {
      return safe({
        allowedDomains: [/gnosis-safe.io$/, /app.safe.global$/, /dhedge.org$/],
      });
    } else {
      return connector;
    }
  })
  .sort((a, b) => {
    // sort connectors so the family connector is last
    // fixes slow wallet connections when running in the Safe UI
    if (a(connectorConfig).id === familyConnectorId) {
      return 1;
    }
    if (b(connectorConfig).id === familyConnectorId) {
      return -1;
    }
    return 0;
  });

const prodConfig = createConfig({
  ...prodCkConfig,
  connectors,
});

const isCypressEnabled = process.env.NEXT_PUBLIC_IS_CYPRESS_ENABLED === 'true';

export const wagmiConfig = isCypressEnabled ? cypressConfig : prodConfig;
