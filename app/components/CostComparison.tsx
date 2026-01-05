"use client";

import { formatEther } from "viem";
import { computeCostSummary, OperationRecord } from "../lib/operations";

type Props = {
  records: OperationRecord[];
};

function formatEth(wei: bigint, decimals = 6) {
  const raw = formatEther(wei);
  const sign = raw.startsWith("-") ? "-" : "";
  const value = sign ? raw.slice(1) : raw;
  const [whole, frac = ""] = value.split(".");
  const padded = frac.slice(0, decimals).padEnd(decimals, "0");
  return `${sign}${whole}.${padded}`;
}

export default function CostComparison({ records }: Props) {
  const summary = computeCostSummary(records);

  return (
    <div className="glass-card rounded-2xl border border-[var(--app-border)] p-6 text-[var(--app-fg)]">
      <h3 className="mb-4 text-lg font-semibold">费用对比</h3>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <StatCard label="自费 Gas" value={`${formatEth(summary.unsubsidizedWei)} ETH`} />
        <StatCard label="补贴 Gas" value={`${formatEth(summary.subsidizedWei)} ETH`} />
        <StatCard label="节省比例" value={`${summary.savedPercent.toFixed(1)}%`} highlight />
      </div>
      <p className="mt-3 text-sm text-[var(--app-muted)]">
        统计基于最近的演示动作记录，补贴或消费券抵扣会体现在节省比例中。
      </p>
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 ${
        highlight ? "border-emerald-300/60 bg-emerald-100/70 text-emerald-900" : "border-[var(--app-border)] bg-white/70"
      }`}
    >
      <div className="text-xs text-[var(--app-muted)]">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}
