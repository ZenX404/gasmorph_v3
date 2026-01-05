import { useState } from "react";
import type { VoucherToken } from "@/app/lib/voucher/types";

export default function TransferVoucherModal({
  open,
  token,
  onClose,
  onTransfer,
}: {
  open: boolean;
  token?: VoucherToken | null;
  onClose: () => void;
  onTransfer: (token: VoucherToken, to: string) => Promise<void>;
}) {
  const [recipient, setRecipient] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open || !token) return null;

  const resetState = () => {
    setRecipient("");
    setError(null);
    setLoading(false);
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await onTransfer(token, recipient);
      resetState();
      onClose();
    } catch (err) {
      setError((err as Error).message || "Transfer failed");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-md rounded-3xl border border-[var(--app-border)] bg-white/95 p-6 text-[var(--app-fg)]">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">转赠消费券</h3>
            <p className="mt-1 text-sm text-[var(--app-muted)]">编号 #{token.tokenId.toString()}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              resetState();
              onClose();
            }}
            className="text-sm text-[var(--app-muted)] hover:text-[var(--app-fg)]"
          >
            关闭
          </button>
        </div>
        <div className="mt-4">
          <label className="text-xs uppercase tracking-[0.2em] text-[var(--app-muted)]">接收地址</label>
          <input
            value={recipient}
            onChange={(event) => setRecipient(event.target.value)}
            placeholder="0x..."
            className="mt-2 w-full rounded-2xl border border-[var(--app-border)] bg-white px-4 py-3 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-muted)]"
          />
        </div>
        {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 rounded-full bg-[var(--app-accent)] px-4 py-2 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "转赠中..." : "确认转赠"}
          </button>
          <button
            type="button"
            onClick={() => {
              resetState();
              onClose();
            }}
            className="flex-1 rounded-full border border-[var(--app-border)] px-4 py-2 text-sm text-[var(--app-fg)]"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
