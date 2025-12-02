"use client";

import { useEffect, useState } from "react";

type Props = {
  onToggle?: (enabled: boolean) => void;
};

const STORAGE_KEY = "subsidy-toggle";

export default function SubsidyToggle({ onToggle }: Props) {
  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.sessionStorage.getItem(STORAGE_KEY) === "true";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(STORAGE_KEY, String(enabled));
    }
    onToggle?.(enabled);
  }, [enabled, onToggle]);

  return (
    <button
      type="button"
      onClick={() => setEnabled((v) => !v)}
      aria-pressed={enabled}
      aria-label="Gas 补贴开关"
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
        enabled ? "bg-emerald-500 text-white" : "bg-white/10 text-white border border-white/30"
      }`}
    >
      <span className="text-base" aria-hidden="true">
        {enabled ? "🟢" : "⚪"}
      </span>
      <span>{enabled ? "补贴已开启" : "补贴已关闭"}</span>
    </button>
  );
}
