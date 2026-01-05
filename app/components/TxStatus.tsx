"use client";

type Props = {
  status: "idle" | "pending" | "confirmed" | "failed";
  txHash?: string | null;
  explorerUrl?: string | null;
  gasPayer?: string | null;
  failureReason?: string | null;
};

const statusLabel: Record<Props["status"], string> = {
  idle: "",
  pending: "交易已提交",
  confirmed: "交易已确认",
  failed: "交易失败",
};

const statusTone: Record<Props["status"], string> = {
  idle: "",
  pending: "border-amber-200/80 bg-amber-50/70",
  confirmed: "border-emerald-200/80 bg-emerald-50/70",
  failed: "border-rose-200/80 bg-rose-50/70",
};

export default function TxStatus({ status, txHash, explorerUrl, gasPayer, failureReason }: Props) {
  if (status === "idle") return null;

  const payerLabel =
    gasPayer === "voucher"
      ? "消费券抵扣"
      : gasPayer === "sponsor"
        ? "项目补贴"
        : gasPayer === "user"
          ? "钱包支付"
          : null;

  return (
    <div
      className={`rounded-2xl border p-4 text-sm text-[var(--app-fg)] ${statusTone[status] || "border-[var(--app-border)] bg-white/70"}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col gap-2">
        <div className="font-semibold">{statusLabel[status]}</div>
        {txHash ? (
          <div className="break-all text-[var(--app-muted)]">
            交易哈希：{" "}
            {explorerUrl ? (
              <a href={explorerUrl} className="underline underline-offset-4" target="_blank" rel="noreferrer">
                {txHash}
              </a>
            ) : (
              txHash
            )}
          </div>
        ) : null}
        {payerLabel ? <div className="text-[var(--app-muted)]">{payerLabel}</div> : null}
        {failureReason ? (
          <div className="rounded-lg border border-rose-200/80 bg-rose-100/70 px-3 py-2 text-xs text-rose-800">
            <span className="font-semibold uppercase tracking-[0.2em] text-rose-500">Error</span>
            <div className="mt-1 break-words">{failureReason}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
