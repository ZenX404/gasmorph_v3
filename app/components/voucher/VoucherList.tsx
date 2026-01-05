import { aggregateVouchers, type AggregatedVoucher } from "@/app/lib/voucher/logic";
import { voucherTypeLabels } from "@/app/lib/voucher/types";
import type { VoucherToken } from "@/app/lib/voucher/types";

const statusStyles: Record<VoucherToken["status"], string> = {
  available: "bg-emerald-100 text-emerald-800",
  used: "bg-slate-200 text-slate-700",
  expired: "bg-amber-100 text-amber-800",
  burned: "bg-rose-100 text-rose-800",
};

const statusLabels: Record<VoucherToken["status"], string> = {
  available: "可用",
  used: "已使用",
  expired: "已过期",
  burned: "已销毁",
};

function AggregatedRow({ entry }: { entry: AggregatedVoucher }) {
  return (
    <div className="rounded-2xl border border-[var(--app-border)] bg-white/70 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--app-muted)]">{voucherTypeLabels[entry.kind]}</p>
      <div className="mt-2 flex items-center justify-between text-sm text-[var(--app-fg)]">
        <span>可用：{entry.activeCount}</span>
        {entry.kind === "single" ? (
          <span>次数：{entry.totalUses}</span>
        ) : (
          <span>剩余时长：{Math.ceil(entry.totalDurationSec / 60)} 分钟</span>
        )}
      </div>
    </div>
  );
}

export default function VoucherList({
  tokens,
  onTransfer,
  onBurn,
}: {
  tokens: VoucherToken[];
  onTransfer?: (token: VoucherToken) => void;
  onBurn?: (token: VoucherToken) => void;
}) {
  if (!tokens.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--app-border)] bg-white/70 p-6 text-center text-sm text-[var(--app-muted)]">
        暂无消费券，请先完成每日签到铸造。
      </div>
    );
  }

  const aggregated = aggregateVouchers(tokens).filter((entry) => entry.kind === "single" || entry.activeCount > 0);

  const sortedTokens = [...tokens].sort((a, b) => b.issuedAt - a.issuedAt);

  return (
    <div className="space-y-5">
      {aggregated.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {aggregated.map((entry) => (
            <AggregatedRow key={entry.kind} entry={entry} />
          ))}
        </div>
      ) : null}
      <div className="space-y-3">
        {sortedTokens.map((token) => (
          <div key={token.tokenId.toString()} className="rounded-2xl border border-[var(--app-border)] bg-white/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--app-fg)]">{voucherTypeLabels[token.kind]}</p>
                <p className="text-xs text-[var(--app-muted)]">编号 #{token.tokenId.toString()}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs ${statusStyles[token.status]}`}>
                {statusLabels[token.status]}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-[var(--app-muted)]">
              {token.expiresAt ? <span>到期时间：{new Date(token.expiresAt).toLocaleString()}</span> : null}
              {token.usesRemaining !== "unlimited" ? (
                <span>可用次数：{token.usesRemaining}</span>
              ) : (
                <span>不限次数</span>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {onTransfer ? (
                <button
                  type="button"
                  onClick={() => onTransfer(token)}
                  className="rounded-full border border-[var(--app-border)] px-4 py-2 text-xs text-[var(--app-fg)] hover:border-[rgba(35,30,28,0.3)]"
                >
                  转赠
                </button>
              ) : null}
              {onBurn ? (
                <button
                  type="button"
                  onClick={() => onBurn(token)}
                  className="rounded-full border border-rose-300/80 px-4 py-2 text-xs text-rose-700 hover:border-rose-400"
                >
                  销毁
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
