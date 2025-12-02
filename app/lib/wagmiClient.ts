import { QueryClient } from "@tanstack/react-query";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import type { Chain } from "viem";
import { http } from "wagmi";
import { getSupportedChains } from "./chains";

export const queryClient = new QueryClient();

const chainsList = getSupportedChains();
const wagmiChains: [Chain, ...Chain[]] = chainsList as [Chain, ...Chain[]];
const transports = Object.fromEntries(
  wagmiChains.map((chain) => {
    const rpc = chain.rpcUrls.default.http[0] ?? "http://127.0.0.1:8545";
    return [chain.id, http(rpc)];
  }),
);

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo";

export const wagmiConfig = getDefaultConfig({
  appName: process.env.NEXT_PUBLIC_APP_NAME || "GasMorph Dapp",
  projectId: walletConnectProjectId,
  chains: wagmiChains,
  ssr: true,
  transports,
});
