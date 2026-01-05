"use client";

export default function PrivacyNotice() {
  return (
    <div className="rounded-xl border border-[var(--app-border)] bg-white/70 px-4 py-3 text-xs text-[var(--app-fg)]">
      我们不会存储私钥或敏感数据。仅在你授权后读取公开钱包地址与链 ID，用于补贴演示。
    </div>
  );
}
