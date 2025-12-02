"use client";

import { computeCostSummary, OperationRecord } from "../lib/operations";

type Props = {
  records: OperationRecord[];
};

export default function CostComparison({ records }: Props) {
  const summary = computeCostSummary(records);

  return (
    <div className="glass-card rounded-2xl border border-white/15 p-6 text-white">
      <h3 className="text-lg font-semibold mb-4">费用对比</h3>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <StatCard label="未补贴费用（估算）" value={`${summary.unsubsidized.toFixed(6)} ETH`} />
        <StatCard label="已补贴费用（估算）" value={`${summary.subsidized.toFixed(6)} ETH`} />
        <StatCard label="节省比例" value={`${summary.savedPercent.toFixed(1)}%`} highlight />
      </div>
      <p className="mt-3 text-sm text-sky-100/80">
        上述为演示估算；真实费用以链上交易为准。补贴开启时，用户展示为 0，费用由项目方承担。
      </p>
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 ${
        highlight ? "border-emerald-300/60 bg-emerald-100/10 text-emerald-50" : "border-white/15 bg-white/5"
      }`}
    >
      <div className="text-xs text-sky-100/70">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}
