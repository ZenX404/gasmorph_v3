import { useState } from "react";
import { voucherKindOrder, voucherTypeLabels, type VoucherKind } from "@/app/lib/voucher/types";

export type ActivityDraft = {
  name: string;
  startsAt: number;
  endsAt: number;
  voucherType: VoucherKind;
  totalQuota: number;
};

function toInputValue(value: number) {
  const date = new Date(value);
  const pad = (num: number) => num.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
    date.getMinutes(),
  )}`;
}

function parseInputValue(value: string) {
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

const initialStartValue = toInputValue(Date.now());
const initialEndValue = toInputValue(Date.now() + 2 * 60 * 60 * 1000);

export default function ActivityForm({
  onCreate,
  isLoading,
  message,
}: {
  onCreate: (payload: ActivityDraft) => Promise<void>;
  isLoading?: boolean;
  message?: string | null;
}) {
  const [name, setName] = useState("");
  const [startsAt, setStartsAt] = useState(initialStartValue);
  const [endsAt, setEndsAt] = useState(initialEndValue);
  const [voucherType, setVoucherType] = useState<VoucherKind>("single");
  const [totalQuota, setTotalQuota] = useState("50");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const startTimestamp = parseInputValue(startsAt);
    const endTimestamp = parseInputValue(endsAt);
    if (!name.trim()) {
      setError("Activity name is required");
      return;
    }
    if (!startTimestamp || !endTimestamp) {
      setError("Invalid activity time");
      return;
    }
    if (endTimestamp <= startTimestamp) {
      setError("End time must be later than start time");
      return;
    }

    const quota = Number(totalQuota);
    if (!Number.isFinite(quota) || quota <= 0) {
      setError("Invalid activity quota");
      return;
    }

    await onCreate({
      name: name.trim(),
      startsAt: startTimestamp,
      endsAt: endTimestamp,
      voucherType,
      totalQuota: quota,
    });
    setName("");
    setTotalQuota("50");
    const now = Date.now();
    setStartsAt(toInputValue(now));
    setEndsAt(toInputValue(now + 2 * 60 * 60 * 1000));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="text-xs uppercase tracking-[0.2em] text-[var(--app-muted)]">活动名称</label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="例如：新人任务 / 交易挑战"
            className="mt-2 w-full rounded-2xl border border-[var(--app-border)] bg-white px-4 py-3 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-muted)]"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-[var(--app-muted)]">开始时间</label>
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(event) => setStartsAt(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-[var(--app-border)] bg-white px-4 py-3 text-sm text-[var(--app-fg)]"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-[var(--app-muted)]">结束时间</label>
          <input
            type="datetime-local"
            value={endsAt}
            onChange={(event) => setEndsAt(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-[var(--app-border)] bg-white px-4 py-3 text-sm text-[var(--app-fg)]"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-[var(--app-muted)]">消费券类型</label>
          <select
            value={voucherType}
            onChange={(event) => setVoucherType(event.target.value as VoucherKind)}
            className="mt-2 w-full rounded-2xl border border-[var(--app-border)] bg-white px-4 py-3 text-sm text-[var(--app-fg)]"
          >
            {voucherKindOrder.map((option) => (
              <option key={option} value={option}>
                {voucherTypeLabels[option]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-[var(--app-muted)]">总数量</label>
          <input
            type="number"
            min={1}
            value={totalQuota}
            onChange={(event) => setTotalQuota(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-[var(--app-border)] bg-white px-4 py-3 text-sm text-[var(--app-fg)]"
          />
        </div>
      </div>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      {message ? <p className="text-sm text-[var(--app-muted)]">{message}</p> : null}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-full bg-[var(--app-accent)] px-4 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(255,143,47,0.26)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? "创建中..." : "创建活动"}
      </button>
    </form>
  );
}
