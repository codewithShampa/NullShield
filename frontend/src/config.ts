// Frontend configuration for NullShield
export const config = {
  // Contract address on Midnight Preprod — set via env or after deploy
  contractAddress: localStorage.getItem('DEPLOYED_CONTRACT_ADDRESS') || import.meta.env.VITE_CONTRACT_ADDRESS || '',
  
  // Midnight Preprod infrastructure
  indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
  indexerWS: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
  node: import.meta.env.VITE_NODE_URL ?? 'https://rpc.preprod.midnight.network',
  proofServer: import.meta.env.VITE_PROOF_SERVER_URL ?? 'https://bsp.preprod.midnight.network',
  networkId: import.meta.env.VITE_NETWORK_ID ?? 'preprod',
};
