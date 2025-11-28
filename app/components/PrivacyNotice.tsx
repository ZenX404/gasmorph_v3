"use client";

export default function PrivacyNotice() {
  return (
    <div className="glass-card mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-sky-50">
      <span>🔒</span>
      <p>
        我们不会收集或存储私钥，仅在你授权后读取公开地址。请不要在此填写任何敏感信息。
      </p>
    </div>
  );
}
