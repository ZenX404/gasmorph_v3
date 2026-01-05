import { useState } from "react";
import { voucherKindOrder, voucherTypeLabels, type VoucherKind } from "@/app/lib/voucher/types";

export default function IssueVoucherForm({
  onIssue,
  isLoading,
}: {
  onIssue: (target: string, kind: VoucherKind) => Promise<void>;
  isLoading?: boolean;
}) {
  const [target, setTarget] = useState("");
  const [kind, setKind] = useState<VoucherKind>("single");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await onIssue(target, kind);
      setTarget("");
    } catch (err) {
      setError((err as Error).message || "Failed to issue voucher");
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="text-xs uppercase tracking-[0.2em] text-[var(--app-muted)]">接收地址</label>
        <input
          value={target}
          onChange={(event) => setTarget(event.target.value)}
          placeholder="0x..."
          className="mt-2 w-full rounded-2xl border border-[var(--app-border)] bg-white px-4 py-3 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-muted)]"
        />
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.2em] text-[var(--app-muted)]">消费券类型</label>
        <select
          value={kind}
          onChange={(event) => setKind(event.target.value as VoucherKind)}
          className="mt-2 w-full rounded-2xl border border-[var(--app-border)] bg-white px-4 py-3 text-sm text-[var(--app-fg)]"
        >
          {voucherKindOrder.map((option) => (
            <option key={option} value={option}>
              {voucherTypeLabels[option]}
            </option>
          ))}
        </select>
      </div>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-full bg-[var(--app-accent)] px-4 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(255,143,47,0.26)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? "发放中..." : "发放消费券"}
      </button>
    </form>
  );
}
