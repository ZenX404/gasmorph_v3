"use client";

import { monadTestnet, sepolia } from "../lib/chains";
import { useWalletEvents } from "../lib/useWalletEvents";

export default function NetworkGuardBanner() {
  const { guard, ensureSupportedNetwork } = useWalletEvents();
  const { isSupported, chainId, recommended } = guard;

  if (isSupported) return null;

  return (
    <div
      className="glass-card glow flex flex-col gap-2 rounded-xl border-amber-200/60 bg-amber-50/80 px-4 py-3 text-amber-900 md:flex-row md:items-center md:justify-between"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <span role="img" aria-label="警告">
          !
        </span>
        <div className="text-sm">
          <div>不支持的网络：{chainId ?? "未知"}</div>
          <div className="text-amber-900/70">请切换到 {recommended?.name ?? "受支持的测试网"} 以继续。</div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => ensureSupportedNetwork()}
        aria-label="切换到受支持的网络"
        className="rounded-full border border-amber-300/70 px-3 py-2 text-xs font-semibold text-amber-900 transition hover:border-amber-400"
      >
        尝试自动切换
      </button>
      <div className="flex flex-wrap gap-2 text-xs">
        <button
          type="button"
          onClick={() => ensureSupportedNetwork(sepolia.id)}
          className="rounded-full border border-amber-300/70 px-3 py-2 text-amber-900 transition hover:border-amber-400"
        >
          切换到 Sepolia
        </button>
        {monadTestnet.rpcUrls.default.http.length > 0 && (
          <button
            type="button"
            onClick={() => ensureSupportedNetwork(monadTestnet.id)}
            className="rounded-full border border-amber-300/70 px-3 py-2 text-amber-900 transition hover:border-amber-400"
          >
            切换到 Monad 测试网
          </button>
        )}
      </div>
    </div>
  );
}
