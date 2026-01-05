"use client";

import { useWalletEvents } from "../lib/useWalletEvents";

export default function DisconnectButton() {
  const { safeDisconnect } = useWalletEvents();
  return (
    <button
      type="button"
      onClick={() => safeDisconnect()}
      className="rounded-full border border-[var(--app-border)] px-4 py-2 text-sm font-semibold text-[var(--app-fg)] transition hover:border-[rgba(35,30,28,0.3)] hover:-translate-y-0.5"
    >
      断开连接
    </button>
  );
}
