import { useState } from "react";

const addressRegex = /^0x[a-fA-F0-9]{40}$/;

type ProjectConfig = {
  subsidyAccount: {
    address: string;
    note?: string;
  } | null;
  checkInEnabled: boolean;
};

type SavePayload = {
  subsidyAccount: { address: string; note?: string } | null;
  checkInEnabled: boolean;
  sponsorPrivateKey?: string | null;
};

export default function ProjectConfigCard({
  config,
  onSave,
  onToggleCheckIn,
  saving,
  message,
}: {
  config: ProjectConfig | null;
  onSave: (payload: SavePayload) => Promise<void>;
  onToggleCheckIn?: (enabled: boolean) => Promise<void>;
  saving?: boolean;
  message?: string | null;
}) {
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [sponsorPrivateKey, setSponsorPrivateKey] = useState("");
  const [checkInEnabled, setCheckInEnabled] = useState(config?.checkInEnabled ?? true);
  const [error, setError] = useState<string | null>(null);
  const [toggleSaving, setToggleSaving] = useState(false);

  const handleSave = async () => {
    setError(null);
    if (address && !addressRegex.test(address)) {
      setError("Invalid address");
      return;
    }
    if (sponsorPrivateKey && !/^(0x)?[a-fA-F0-9]{64}$/.test(sponsorPrivateKey)) {
      setError("Invalid private key");
      return;
    }
    const normalizedPrivateKey = sponsorPrivateKey
      ? sponsorPrivateKey.startsWith("0x")
        ? sponsorPrivateKey
        : `0x${sponsorPrivateKey}`
      : null;
    await onSave({
      subsidyAccount: address ? { address, note: note.trim() || undefined } : null,
      checkInEnabled,
      sponsorPrivateKey: normalizedPrivateKey ? normalizedPrivateKey.trim() : null,
    });
    setSponsorPrivateKey("");
  };

  const handleToggle = async () => {
    const next = !checkInEnabled;
    setCheckInEnabled(next);
    if (!onToggleCheckIn) return;
    setToggleSaving(true);
    try {
      await onToggleCheckIn(next);
    } catch (err) {
      setCheckInEnabled(!next);
      setError((err as Error).message || "Failed to update check-in state");
    } finally {
      setToggleSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--app-muted)]">补贴账户地址</p>
        <input
          value={address}
          onChange={(event) => setAddress(event.target.value.trim())}
          placeholder="输入补贴扣费账户地址"
          className="mt-2 w-full rounded-full border border-[var(--app-border)] bg-white/80 px-4 py-2 text-xs text-[var(--app-fg)] outline-none transition focus:border-amber-300"
        />
        <p className="mt-2 text-xs text-[var(--app-muted)]">
          补贴扣费由服务端内存签名完成，私钥不会回传前端或持久化保存。
        </p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--app-muted)]">补贴账户私钥（仅本次）</p>
        <input
          type="password"
          value={sponsorPrivateKey}
          onChange={(event) => setSponsorPrivateKey(event.target.value.trim())}
          placeholder="可不包含 0x，仅在当前会话用于签名"
          className="mt-2 w-full rounded-full border border-[var(--app-border)] bg-white/80 px-4 py-2 text-xs text-[var(--app-fg)] outline-none transition focus:border-amber-300"
        />
        <p className="mt-2 text-xs text-[var(--app-muted)]">仅用于本次会话，刷新页面需重新输入。</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--app-muted)]">备注（可选）</p>
        <input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="例如：项目方补贴账户"
          className="mt-2 w-full rounded-full border border-[var(--app-border)] bg-white/80 px-4 py-2 text-xs text-[var(--app-fg)] outline-none transition focus:border-amber-300"
        />
      </div>
      <div className="rounded-2xl border border-[var(--app-border)] bg-white/80 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--app-fg)]">每日签到活动</p>
            <p className="text-xs text-[var(--app-muted)]">可随时开启或关闭签到领券活动。</p>
          </div>
          <button
            type="button"
            role="button"
            aria-pressed={checkInEnabled}
            aria-label="每日签到活动"
            onClick={handleToggle}
            disabled={toggleSaving}
            className={`rounded-full px-4 py-1 text-xs font-semibold transition ${
              checkInEnabled ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
            }`}
          >
            {toggleSaving ? "更新中..." : checkInEnabled ? "已开启" : "已关闭"}
          </button>
        </div>
      </div>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
      {message ? <p className="text-xs text-[var(--app-muted)]">{message}</p> : null}
      <div className="flex items-center justify-between">
        <p className="text-xs text-[var(--app-muted)]">不保存密钥等敏感信息。</p>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-full border border-amber-200 bg-amber-100 px-4 py-2 text-xs font-semibold text-amber-900 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "保存中..." : "保存配置"}
        </button>
      </div>
    </div>
  );
}
