import { EmptyState } from "../layout/pageShell";
import { voucherTypeLabels, type VoucherKind } from "@/app/lib/voucher/types";
import type { ActivityStatus } from "@/app/lib/activities/types";

export type ActivityListItem = {
  id: string;
  name: string;
  startsAt: number;
  endsAt: number;
  voucherType: VoucherKind;
  totalQuota: number;
  remainingQuota: number;
  status: ActivityStatus;
  createdAt: number;
  updatedAt: number;
};

const statusLabels: Record<ActivityStatus, { label: string; tone: string }> = {
  draft: { label: "未开始", tone: "bg-slate-100 text-slate-700" },
  active: { label: "进行中", tone: "bg-emerald-100 text-emerald-700" },
  paused: { label: "已暂停", tone: "bg-amber-100 text-amber-700" },
  ended: { label: "已结束", tone: "bg-rose-100 text-rose-700" },
  deleted: { label: "已删除", tone: "bg-slate-200 text-slate-500" },
};

export default function ActivityList({
  items,
  onStatusChange,
  onDelete,
  busyId,
}: {
  items: ActivityListItem[];
  onStatusChange: (id: string, status: "active" | "paused") => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  busyId?: string | null;
}) {
  if (!items.length) {
    return <EmptyState title="暂无活动" description="创建一个活动，用于演示发放消费券的完整流程。" />;
  }

  return (
    <div className="space-y-3">
      {items.map((activity) => {
        const status = statusLabels[activity.status];
        const isBusy = busyId === activity.id;
        const canToggle = activity.status === "active" || activity.status === "paused" || activity.status === "draft";
        const toggleLabel = activity.status === "paused" ? "恢复活动" : "暂停活动";
        const toggleStatus = activity.status === "paused" ? "active" : "paused";

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
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={!canToggle || isBusy}
                  onClick={() => onStatusChange(activity.id, toggleStatus)}
                  className="rounded-full border border-[var(--app-border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--app-fg)] transition hover:border-[rgba(35,30,28,0.3)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {toggleLabel}
                </button>
                <button
                  type="button"
                  disabled={activity.status === "deleted" || isBusy}
                  onClick={() => onDelete(activity.id)}
                  className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  删除活动
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
