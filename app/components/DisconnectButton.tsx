"use client";

import { useWalletEvents } from "../lib/useWalletEvents";

export default function DisconnectButton() {
  const { safeDisconnect } = useWalletEvents();
  return (
    <button
      type="button"
      onClick={() => safeDisconnect()}
      className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/50 hover:-translate-y-0.5"
    >
      断开连接
    </button>
  );
}
