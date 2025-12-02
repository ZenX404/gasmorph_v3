"use client";

import { useAccount, useConnect } from "wagmi";

export default function StatusToast() {
  const { status } = useAccount();
  const { error } = useConnect();

  const message =
    error?.message ||
    (status === "connecting"
      ? "正在连接钱包..."
      : status === "reconnecting"
        ? "尝试恢复连接..."
        : null);

  if (!message) return null;

  const isError = Boolean(error);

  return (
    <div
      className={`glass-card mt-4 inline-flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${
        isError ? "border-red-300/50 text-red-50" : "border-white/20 text-sky-50"
      }`}
      role="status"
    >
      <span className="text-base" aria-hidden="true">
        {isError ? "⚠️" : "⏳"}
      </span>
      <span>{message}</span>
    </div>
  );
}
