"use client";

import { sepolia, monadTestnet } from "../lib/chains";
import { useWalletEvents } from "../lib/useWalletEvents";

export default function NetworkGuardBanner() {
  const { guard, ensureSupportedNetwork } = useWalletEvents();
  const { isSupported, chainId, recommended } = guard;

  if (isSupported) return null;

  return (
    <div className="glass-card glow flex flex-col gap-2 rounded-xl border-amber-200/40 bg-amber-100/10 px-4 py-3 text-amber-50 md:flex-row md:items-center md:justify-between" role="alert">
      <div className="flex items-center gap-2">
        <span>⚠</span>
        <div className="text-sm">
          <div>当前网络不受支持：{chainId ?? "未知"}</div>
          <div className="text-amber-100/80">请切换到 {recommended?.name ?? "受支持的测试网"} 继续。</div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => ensureSupportedNetwork()}
        aria-label="尝试切换到受支持网络"
        className="rounded-full border border-amber-200/60 px-3 py-2 text-xs font-semibold text-amber-50 transition hover:border-amber-100"
      >
        尝试切换
      </button>
      <div className="flex flex-wrap gap-2 text-xs">
        <button
          type="button"
          onClick={() => ensureSupportedNetwork(sepolia.id)}
          className="rounded-full border border-amber-200/60 px-3 py-2 text-amber-50 transition hover:border-amber-100"
        >
          切换到 Sepolia
        </button>
        {monadTestnet.rpcUrls.default.http.length > 0 && (
          <button
            type="button"
            onClick={() => ensureSupportedNetwork(monadTestnet.id)}
            className="rounded-full border border-amber-200/60 px-3 py-2 text-amber-50 transition hover:border-amber-100"
          >
            切换到 Monad 测试网
          </button>
        )}
      </div>
    </div>
  );
}
