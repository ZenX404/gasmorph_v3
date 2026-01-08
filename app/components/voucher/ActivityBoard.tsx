import { voucherTypeLabels, type VoucherKind } from "@/app/lib/voucher/types";
import type { ActivityStatus } from "@/app/lib/activities/types";
import type { ActivityErrorCode } from "@/app/lib/activities/errors";

export type ActivityBoardItem = {
  id: string;
  name: string;
  startsAt: number;
  endsAt: number;
  voucherType: VoucherKind;
  totalQuota: number;
  remainingQuota: number;
  status: ActivityStatus;
  claimed: boolean;
  claimable: boolean;
  claimError?: ActivityErrorCode | null;
};

const statusMap: Record<ActivityStatus, { label: string; tone: string }> = {
  draft: { label: "未开始", tone: "bg-slate-100 text-slate-700" },
  active: { label: "进行中", tone: "bg-emerald-100 text-emerald-700" },
  paused: { label: "已暂停", tone: "bg-amber-100 text-amber-700" },
  ended: { label: "已结束", tone: "bg-rose-100 text-rose-700" },
  deleted: { label: "已删除", tone: "bg-slate-200 text-slate-500" },
};

export default function ActivityBoard({
  items,
  onClaim,
  claimingId,
  walletConnected,
  message,
}: {
  items: ActivityBoardItem[];
  onClaim: (activityId: string) => Promise<void>;
  claimingId?: string | null;
  walletConnected?: boolean;
  message?: string | null;
}) {
  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--app-border)] bg-white/70 p-6 text-center text-sm text-[var(--app-muted)]">
        暂无可参与活动
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((activity) => {
        const status = statusMap[activity.status];
        const isClaiming = claimingId === activity.id;
        const disabledReason = !walletConnected
          ? "连接钱包后可领取"
          : activity.claimed
            ? "已领取"
            : !activity.claimable
              ? "暂不可领取"
              : null;
        const canClaim = !disabledReason;

        return (
          <div
            key={activity.id}
            className="rounded-2xl border border-[var(--app-border)] bg-white/80 px-5 py-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-base font-semibold text-[var(--app-fg)]">{activity.name}</h3>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.tone}`}>{status.label}</span>
                  {activity.claimed ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      已领取
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-xs text-[var(--app-muted)]">
                  {new Date(activity.startsAt).toLocaleString()} - {new Date(activity.endsAt).toLocaleString()}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--app-muted)]">
                  <span className="rounded-full border border-[var(--app-border)] bg-white/70 px-3 py-1">
                    {voucherTypeLabels[activity.voucherType]}
                  </span>
                  <span className="rounded-full border border-[var(--app-border)] bg-white/70 px-3 py-1">
                    剩余 {activity.remainingQuota} / {activity.totalQuota}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button
                  type="button"
                  disabled={!canClaim || isClaiming}
                  onClick={() => onClaim(activity.id)}
                  className="rounded-full bg-[var(--app-accent)] px-4 py-2 text-xs font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(255,143,47,0.26)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isClaiming ? "领取中..." : "完成活动"}
                </button>
                {disabledReason ? <span className="text-xs text-[var(--app-muted)]">{disabledReason}</span> : null}
              </div>
            </div>
          </div>
        );
      })}
      {message ? (
        <div className="rounded-2xl border border-rose-200/80 bg-rose-50/80 px-4 py-3 text-xs text-rose-900 shadow-[0_14px_28px_rgba(244,63,94,0.12)]">
          <div className="flex items-start gap-3">
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-rose-600">
              Error
            </span>
            <div className="text-[11px] leading-relaxed text-rose-700">{message}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
