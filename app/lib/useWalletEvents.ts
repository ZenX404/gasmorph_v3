"use client";

import { useEffect } from "react";
import { useAccount, useDisconnect, useSwitchChain } from "wagmi";
import { logWalletState } from "./logging";
import { useNetworkGuard } from "./useNetworkGuard";

export function useWalletEvents() {
  const { address, chainId, status, isConnected } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { disconnect } = useDisconnect();
  const guard = useNetworkGuard();

  useEffect(() => {
    logWalletState("wallet/status", { status, address, chainId, supported: guard.isSupported });
  }, [status, address, chainId, guard.isSupported]);

  // 若网络不兼容且已连接，可选择自动切换（保持手动，以提示为主）
  const ensureSupportedNetwork = async (targetChainId?: number) => {
    if (!isConnected) return;
    const target = targetChainId ?? guard.recommended?.id;
    if (!target) return;
    if (guard.isSupported && !targetChainId) return;
    try {
      await switchChainAsync?.({ chainId: target });
    } catch (err) {
      logWalletState("wallet/switch-error", { message: (err as Error).message });
    }
  };

  // 提供断开包装，方便调用
  const safeDisconnect = () => {
    disconnect();
    logWalletState("wallet/disconnect", {});
  };

  return {
    ensureSupportedNetwork,
    safeDisconnect,
    guard,
  };
}
