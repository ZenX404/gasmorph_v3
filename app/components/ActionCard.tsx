"use client";

import { useState } from "react";

type Props = {
  onExecute?: () => Promise<void>;
};

export default function ActionCard({ onExecute }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExecute = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      await onExecute?.();
    } catch (err) {
      setError((err as Error).message || "Execution failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[var(--app-border)] bg-white/70 p-6 text-[var(--app-fg)]">
      <div className="absolute right-6 top-6 rounded-full border border-[var(--app-border)] bg-white/80 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-[var(--app-muted)]">
        交易
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">演示交易</h3>
        </div>
        <p className="text-sm text-[var(--app-muted)]">
          触发一次链上动作，对比项目补贴、消费券抵扣与自费路径。
        </p>
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={handleExecute}
            disabled={loading}
            className="rounded-full bg-[var(--app-accent)] px-4 py-2 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(255,143,47,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "执行中..." : "运行演示动作"}
          </button>
          {error ? (
            <div className="rounded-xl border border-rose-200/80 bg-rose-50/70 px-3 py-2 text-xs text-rose-800">
              <span className="font-semibold uppercase tracking-[0.2em] text-rose-500">Error</span>
              <div className="mt-1 break-words">{error}</div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
