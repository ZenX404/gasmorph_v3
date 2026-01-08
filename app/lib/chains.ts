import type { Chain } from "viem";
import { defineChain } from "viem";

// 说明: 全部链均为测试网，RPC 通过环境变量注入，避免硬编码私有节点。
const sepoliaRpc = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://rpc.sepolia.org";
const monadRpc = process.env.NEXT_PUBLIC_MONAD_TESTNET_RPC_URL;

export const sepolia: Chain = defineChain({
  id: 11155111,
  name: "Sepolia",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: sepoliaRpc ? [sepoliaRpc] : [] },
    public: { http: sepoliaRpc ? [sepoliaRpc] : [] },
  },
  blockExplorers: {
    default: { name: "Etherscan", url: "https://sepolia.etherscan.io" },
  },
  testnet: true,
});

export const monadTestnet: Chain = defineChain({
  id: 20143,
  name: "Monad Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: monadRpc ? [monadRpc] : [] },
    public: { http: monadRpc ? [monadRpc] : [] },
  },
  blockExplorers: {
    default: { name: "Monad Explorer", url: "https://explorer.monad.xyz" },
  },
  testnet: true,
});

export const anvil: Chain = defineChain({
  id: 1337,
  name: "Foundry Anvil",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
    public: { http: ["http://127.0.0.1:8545"] },
  },
  testnet: true,
});

function reorderByDefault(chains: Chain[]): Chain[] {
  const envDefault = process.env.DEFAULT_CHAIN_ID;
  const preferredId = envDefault ? Number(envDefault) : undefined;
  if (!preferredId) return chains;
  const found = chains.find((c) => c.id === preferredId);
  if (!found) return chains;
  const rest = chains.filter((c) => c.id !== preferredId);
  return [found, ...rest];
}

export function getSupportedChains(): Chain[] {
  // 默认优先真实测试网，其次可选 Monad，最后保留本地 anvil。
  const base: Chain[] = [sepolia];
  if (monadRpc) base.push(monadTestnet);
  base.push(anvil);
  return reorderByDefault(base);
}
