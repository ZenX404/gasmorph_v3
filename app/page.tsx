"use client";

import { useAccount } from "wagmi";
import ConnectWalletButton from "./components/ConnectWalletButton";
import NetworkGuardBanner from "./components/NetworkGuardBanner";
import PrivacyNotice from "./components/PrivacyNotice";
import ShowcaseSummary from "./components/ShowcaseSummary";
import WalletBadge from "./components/WalletBadge";

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <main className="relative flex min-h-screen items-center justify-center px-6 py-12 text-foreground">
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-white/0 blur-3xl" />
      <div className="relative flex w-full max-w-5xl flex-col gap-8">
        <div className="glass-card glow rounded-2xl p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex-1 space-y-4">
              <p className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-sm text-sky-100">
                支持网络 · Sepolia / Monad / anvil
              </p>
              <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
                GasMorph · Web3 Gas 赞助体验
              </h1>
              <p className="max-w-3xl text-lg text-sky-100/90">
                连接钱包即可体验 Gas 赞助与链上互动预览。我们不会收集私钥，仅在你授权后读取公开地址。
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-sky-100/90">
                <span className="rounded-full border border-white/20 px-3 py-1">
                  钱包登录
                </span>
                <span className="rounded-full border border-white/20 px-3 py-1">
                  状态保持 / 网络提示
                </span>
                <span className="rounded-full border border-white/20 px-3 py-1">
                  Gas 赞助演示
                </span>
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <ConnectWalletButton />
                <div className="flex items-center gap-3">
                  <WalletBadge />
                </div>
              </div>
              <PrivacyNotice />
            </div>
          </div>
        </div>

        <NetworkGuardBanner />

        <ShowcaseSummary />
      </div>
    </main>
  );
}
