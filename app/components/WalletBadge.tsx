"use client";

import { useAccount, useEnsName } from "wagmi";

export default function WalletBadge() {
  const { address, isConnected } = useAccount();
  const { data: ens } = useEnsName({ address, chainId: 1, query: { enabled: false } });

  if (!isConnected || !address) return null;

  const short =
    address.slice(0, 6) +
    "…" +
    address.slice(address.length - 4);

  return (
    <div className="glass-card inline-flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-sky-50">
      <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(16,185,129,0.35)]" />
      <div className="flex flex-col">
        <span className="text-xs text-sky-100/80">已连接</span>
        <span className="font-semibold">
          {ens ?? short}
        </span>
      </div>
    </div>
  );
}
