"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useDisconnect } from "wagmi";

export default function ConnectWalletButton() {
  const { disconnect } = useDisconnect();

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openChainModal,
        openConnectModal,
        mounted,
        authenticationStatus,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready && account && chain && (!authenticationStatus || authenticationStatus === "authenticated");

        if (!connected) {
          return (
            <button
              onClick={openConnectModal}
              type="button"
              aria-label="连接钱包"
              className="rounded-full bg-[var(--app-accent)] px-5 py-3 text-base font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
            >
              连接钱包
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button
              onClick={openChainModal}
              type="button"
              aria-label="切换到受支持的网络"
              className="rounded-full border border-red-300/80 bg-red-100/70 px-5 py-3 text-base font-semibold text-red-800 transition hover:-translate-y-0.5"
            >
              网络不支持，点击切换
            </button>
          );
        }

        return (
          <div className="flex items-center gap-3">
            <button
              onClick={openChainModal}
              aria-label={`当前网络 ${chain.name}，点击切换`}
              className="rounded-full border border-[var(--app-border)] bg-white/70 px-4 py-2 text-sm text-[var(--app-fg)] transition hover:border-[rgba(35,30,28,0.3)]"
              type="button"
            >
              {chain.name}
            </button>
            <button
              onClick={openConnectModal}
              aria-label={`已连接账户 ${account.displayName}，点击管理`}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--app-fg)] transition hover:-translate-y-0.5 hover:shadow-md"
              type="button"
            >
              {account.displayName}
            </button>
            {connected && (
              <button
                onClick={() => disconnect()}
                aria-label="断开钱包"
                className="rounded-full border border-[var(--app-border)] px-4 py-2 text-sm font-semibold text-[var(--app-fg)] transition hover:border-[rgba(35,30,28,0.3)] hover:-translate-y-0.5"
                type="button"
              >
                断开连接
              </button>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
