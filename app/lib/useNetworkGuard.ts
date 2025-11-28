import { useEffect, useMemo, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { getSupportedChains } from "./chains";

export function useNetworkGuard() {
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const supportedChains = useMemo(() => getSupportedChains(), []);
  const supportedIds = useMemo(
    () => supportedChains.map((c) => c.id),
    [supportedChains],
  );

  const [lastChainId, setLastChainId] = useState<number | null>(null);

  useEffect(() => {
    if (chainId) setLastChainId(chainId);
  }, [chainId]);

  const effectiveChainId = chainId ?? lastChainId ?? undefined;
  const isSupported = effectiveChainId
    ? supportedIds.includes(effectiveChainId)
    : !isConnected;
  const recommended = supportedChains[0];

  return {
    chainId: effectiveChainId,
    isSupported,
    supportedChains,
    supportedIds,
    recommended,
  };
}
