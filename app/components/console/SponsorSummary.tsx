import { EmptyState } from "../layout/pageShell";

type SponsorSummaryData = {
  address: string;
  balanceDelta: string;
  lastTxAt: string | null;
};

function formatEthDelta(value: string) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return { amount: value, unit: "" };
  }
  const decimals = Math.abs(numeric) >= 1 ? 4 : 6;
  return { amount: numeric.toFixed(decimals), unit: "ETH" };
}

export default function SponsorSummary({ summary }: { summary?: SponsorSummaryData }) {
  if (!summary) {
    return <EmptyState title="暂无补贴账户数据" description="连接本地链以查看补贴账户活动。" />;
  }

  const formattedDelta = formatEthDelta(summary.balanceDelta);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--app-muted)]">补贴账户地址</p>
        <p className="mt-2 rounded-xl border border-[var(--app-border)] bg-white/70 px-3 py-2 font-mono text-xs text-[var(--app-fg)] break-all">
          {summary.address}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-[var(--app-border)] bg-white/70 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--app-muted)]">余额变动</p>
          <div className="mt-2 flex flex-wrap items-baseline gap-2">
            <span className="text-2xl font-semibold text-[var(--app-fg)]" title={`${summary.balanceDelta} ETH`}>
              {formattedDelta.amount}
            </span>
            {formattedDelta.unit ? (
              <span className="text-sm uppercase tracking-[0.2em] text-[var(--app-muted)]">{formattedDelta.unit}</span>
            ) : null}
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--app-border)] bg-white/70 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--app-muted)]">最新活动</p>
          <p className="mt-2 text-lg font-semibold text-[var(--app-fg)]">
            {summary.lastTxAt ? new Date(summary.lastTxAt).toLocaleString() : "暂无交易"}
          </p>
        </div>
      </div>
    </div>
  );
}
