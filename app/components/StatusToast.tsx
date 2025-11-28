"use client";

import { useState, useEffect } from "react";
import { useAccount, useConnect } from "wagmi";

export default function StatusToast() {
  const { status } = useAccount();
  const { error } = useConnect();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === "connecting") setMessage("正在连接钱包…");
    else if (status === "reconnecting") setMessage("尝试恢复连接…");
    else if (status === "connected") setMessage(null);
    else if (status === "disconnected") setMessage(null);
  }, [status]);

  useEffect(() => {
    if (error) setMessage(error.message || "连接失败，请重试");
  }, [error]);

  if (!message) return null;

  const isError = error != null;

  return (
    <div
      className={`glass-card mt-4 inline-flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${
        isError ? "border-red-300/50 text-red-50" : "border-white/20 text-sky-50"
      }`}
      role="status"
    >
      <span className="text-base">{isError ? "⚠" : "⏳"}</span>
      <span>{message}</span>
    </div>
  );
}
