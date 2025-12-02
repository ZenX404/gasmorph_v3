"use client";

type Props = {
  status: "idle" | "pending" | "confirmed" | "failed";
  txHash?: string | null;
  explorerUrl?: string | null;
  gasPayer?: string | null;
  failureReason?: string | null;
};

export default function TxStatus({ status, txHash, explorerUrl, gasPayer, failureReason }: Props) {
  if (status === "idle") return null;

  const statusText =
    status === "pending" ? "交易提交中" : status === "confirmed" ? "交易已确认" : "交易失败";

  return (
    <div className="glass-card rounded-2xl border border-white/15 p-4 text-sm text-white" role="status" aria-live="polite">
      <div className="flex flex-col gap-2">
        <div className="font-semibold">{statusText}</div>
        {txHash && (
          <div className="break-all text-sky-100/90">
            交易哈希：
            {explorerUrl ? (
              <a href={explorerUrl} className="underline underline-offset-4" target="_blank" rel="noreferrer">
                {txHash}
              </a>
            ) : (
              txHash
            )}
          </div>
        )}
        {gasPayer && <div className="text-sky-100/80">费用承担方：{gasPayer}</div>}
        {failureReason && <div className="text-red-200">失败原因：{failureReason}</div>}
      </div>
    </div>
  );
}
