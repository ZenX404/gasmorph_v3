import type { ConsoleChartSeries } from "@/app/lib/console/chartData";

const colorMap: Record<string, string> = {
  total: "bg-slate-200",
  covered: "bg-emerald-300",
};

function formatTick(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return value.toString();
}

function buildTicks(maxValue: number, count = 4) {
  const step = Math.max(1, Math.ceil(maxValue / count));
  const top = Math.ceil(maxValue / step) * step;
  const ticks: number[] = [];
  for (let value = top; value >= 0; value -= step) {
    ticks.push(value);
  }
  return ticks;
}

export default function TrendChart({ series }: { series: ConsoleChartSeries[] }) {
  if (!series.length || series[0].points.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--app-border)] bg-white/70 p-6 text-center text-sm text-[var(--app-muted)]">
        暂无图表数据。
      </div>
    );
  }

  const maxValue = Math.max(1, ...series.flatMap((item) => item.points.map((point) => point.value)));
  const ticks = buildTicks(maxValue, 4);
  const chartMax = ticks[0] ?? maxValue;

  return (
    <div className="space-y-4">
      {series.map((item) => (
        <div key={item.id} className="space-y-2">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[var(--app-muted)]">
            <span>{item.label}</span>
            {/* <span>最高 {formatTick(chartMax)}</span> */}
          </div>
          <div className="rounded-2xl border border-[var(--app-border)] bg-white/70 px-3 py-3">
            <div className="grid grid-cols-[32px_1fr] gap-2">
              <div className="flex h-28 flex-col justify-between text-[10px] text-[var(--app-muted)]">
                {ticks.map((tick, idx) => (
                  <span key={`${item.id}-tick-${idx}`}>{formatTick(tick)}</span>
                ))}
              </div>
              <div className="relative h-28">
                <div className="absolute inset-0 flex flex-col justify-between">
                  {ticks.map((_, idx) => (
                    <div key={`${item.id}-grid-${idx}`} className="h-px bg-[var(--app-border)]/70" />
                  ))}
                </div>
                <div className="absolute inset-0 flex items-end gap-2 pb-2">
                  {item.points.map((point, idx) => {
                    const heightPct = chartMax > 0 ? Math.round((point.value / chartMax) * 100) : 0;
                    const height = point.value === 0 ? 2 : Math.max(6, heightPct);
                    return (
                      <div key={`${item.id}-${idx}`} className="group flex h-full flex-1 flex-col justify-end">
                        <div className="relative flex h-full flex-col items-center justify-end">
                          <div className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded-full border border-[var(--app-border)] bg-white px-2 py-0.5 text-[10px] text-[var(--app-fg)] opacity-0 shadow-sm transition group-hover:opacity-100">
                            {point.value}
                          </div>
                          <div
                            className={`w-full rounded-t-lg ${colorMap[item.id] ?? "bg-slate-200/70"} transition group-hover:opacity-90`}
                            style={{ height: `${height}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-[32px_1fr]">
              <div />
              <div className="flex gap-2 text-[10px] text-[var(--app-muted)]">
                {item.points.map((point, idx) => (
                  <span key={`${item.id}-label-${idx}`} className="flex-1 text-center">
                    {point.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
