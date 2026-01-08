import type { ConsoleMetric } from "@/app/lib/console/metrics";
import { DataPill } from "../layout/pageShell";

const iconMap: Record<string, string> = {
  subsidyCount: "SUB",
  totalTx: "TX",
  successRate: "SR",
};

export default function DashboardCards({ metrics }: { metrics: ConsoleMetric[] }) {
  if (!metrics.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--app-border)] bg-white/70 p-6 text-center text-sm text-[var(--app-muted)]">
        暂无指标数据。
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric) => (
        <div
          key={metric.key}
          className="flex items-center justify-between rounded-2xl border border-[var(--app-border)] bg-white/70 px-5 py-4"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--app-muted)]">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--app-fg)]">{metric.value}</p>
            {metric.delta ? <p className="mt-1 text-xs text-[var(--app-muted)]">{metric.delta}</p> : null}
          </div>
          <span className="rounded-full border border-[var(--app-border)] bg-white/80 px-3 py-2 text-xs font-semibold text-[var(--app-fg)]">
            {iconMap[metric.key] ?? "指标"}
          </span>
        </div>
      ))}
      <DataPill label="消费券影响" value="运行中" />
    </div>
  );
}
