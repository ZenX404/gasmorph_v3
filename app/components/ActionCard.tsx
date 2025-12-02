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
      setError((err as Error).message || "执行失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl border border-white/15 p-6 text-white">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">示例操作</h3>
          {/* 补贴模式切换由页面顶部开关统一控制，这里仅执行操作 */}
        </div>
        <p className="text-sm text-sky-100/80">触发一次链上示例调用，展示补贴与自付的区别。</p>
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={handleExecute}
            disabled={loading}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "执行中..." : "执行操作"}
          </button>
          {error && <span className="text-sm text-red-200">{error}</span>}
        </div>
      </div>
    </div>
  );
}
