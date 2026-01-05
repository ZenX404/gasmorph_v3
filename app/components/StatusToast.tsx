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
        ? "正在重新连接钱包..."
        : null);

  if (!message) return null;

  const isError = Boolean(error);

  return (
    <div
      className={`glass-card mt-4 inline-flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${
        isError ? "border-red-300/70 text-red-800" : "border-[var(--app-border)] text-[var(--app-fg)]"
      }`}
      role="status"
    >
      <span className="text-base" aria-hidden="true">
        {isError ? "!" : "~"}
      </span>
      <span>{message}</span>
    </div>
  );
}
