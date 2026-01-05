import { useState } from "react";

export default function CheckInCard({
  onCheckIn,
  isLoading,
}: {
  onCheckIn: () => Promise<void>;
  isLoading?: boolean;
}) {
  const [error, setError] = useState<string | null>(null);

  const handleCheckIn = async () => {
    setError(null);
    try {
      await onCheckIn();
    } catch (err) {
      setError((err as Error).message || "Failed to check in");
    }
  };

  return (
    <div className="rounded-3xl border border-[var(--app-border)] bg-white/70 p-6">
      <h3 className="text-lg font-semibold text-[var(--app-fg)]">每日签到</h3>
      <p className="mt-2 text-sm text-[var(--app-muted)]">
        每日可领取一张 GAS 抵扣消费券 NFT。单次券可累计次数，时间窗券可叠加时长。
      </p>
      {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}
      <button
        type="button"
        onClick={handleCheckIn}
        disabled={isLoading}
        className="mt-4 rounded-full bg-[var(--app-accent)] px-5 py-2 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(255,143,47,0.26)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? "领取中..." : "领取每日消费券"}
      </button>
    </div>
  );
}
