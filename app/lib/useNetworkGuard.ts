import { useMemo } from "react";
import { useAccount, useChainId } from "wagmi";
import { getSupportedChains } from "./chains";

export function useNetworkGuard() {
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const supportedChains = useMemo(() => getSupportedChains(), []);
  const supportedIds = useMemo(() => supportedChains.map((c) => c.id), [supportedChains]);

  const isSupported = chainId ? supportedIds.includes(chainId) : !isConnected;
  const recommended = supportedChains[0];

  return {
    chainId: chainId ?? undefined,
    isSupported,
    supportedChains,
    supportedIds,
    recommended,
  };
}
