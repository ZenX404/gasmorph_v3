"use client";

import { monadTestnet, sepolia } from "../lib/chains";
import { useWalletEvents } from "../lib/useWalletEvents";

export default function NetworkGuardBanner() {
  const { guard, ensureSupportedNetwork } = useWalletEvents();
  const { isSupported, chainId, recommended } = guard;

  if (isSupported) return null;

  return (
    <div
      className="glass-card glow flex flex-col gap-3 rounded-2xl border border-amber-200/70 bg-amber-50/80 px-4 py-4 text-amber-900 md:flex-row md:items-center md:justify-between"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <span
          role="img"
          aria-label="Warning"
          className="flex h-7 w-7 items-center justify-center rounded-full border border-amber-300/70 bg-white/70 text-sm font-semibold"
        >
          !
        </span>
        <div className="text-sm">
          <div className="font-semibold">Unsupported network: {chainId ?? "Unknown"}</div>
          <div className="text-amber-900/70">
            Switch to {recommended?.name ?? "a supported testnet"} to continue.
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          type="button"
          onClick={() => ensureSupportedNetwork()}
          aria-label="Switch to the recommended network"
          className="rounded-full border border-amber-300/70 px-3 py-2 font-semibold text-amber-900 transition hover:border-amber-400"
        >
          Try auto switch
        </button>
        <button
          type="button"
          onClick={() => ensureSupportedNetwork(sepolia.id)}
          className="rounded-full border border-amber-300/70 px-3 py-2 text-amber-900 transition hover:border-amber-400"
        >
          Switch to Sepolia
        </button>
        {monadTestnet.rpcUrls.default.http.length > 0 ? (
          <button
            type="button"
            onClick={() => ensureSupportedNetwork(monadTestnet.id)}
            className="rounded-full border border-amber-300/70 px-3 py-2 text-amber-900 transition hover:border-amber-400"
          >
            Switch to Monad Testnet
          </button>
        ) : null}
      </div>
    </div>
  );
}
