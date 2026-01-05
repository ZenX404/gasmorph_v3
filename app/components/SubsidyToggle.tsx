"use client";

type Props = {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
};

export default function SubsidyToggle({ enabled, onToggle, disabled }: Props) {
  return (
    <button
      type="button"
      onClick={() => onToggle(!enabled)}
      aria-pressed={enabled}
      aria-label="补贴开关"
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
        enabled ? "bg-emerald-500 text-white" : "border border-[var(--app-border)] bg-white/70 text-[var(--app-fg)]"
      } ${disabled ? "cursor-not-allowed opacity-60" : "hover:-translate-y-0.5"}`}
    >
      <span className="rounded-full border border-[var(--app-border)] px-2 py-0.5 text-[10px] tracking-[0.3em]">
        {enabled ? "开" : "关"}
      </span>
      <span>{enabled ? "补贴已开启" : "补贴已关闭"}</span>
    </button>
  );
}
