"use client";

import { useState } from "react";
import { useAccount, useChainId, useWalletClient } from "wagmi";
import ActionCard from "../../components/ActionCard";
import ConnectWalletButton from "../../components/ConnectWalletButton";
import CostComparison from "../../components/CostComparison";
import NetworkGuardBanner from "../../components/NetworkGuardBanner";
import PrivacyNotice from "../../components/PrivacyNotice";
import ShowcaseSummary from "../../components/ShowcaseSummary";
import SubsidyToggle from "../../components/SubsidyToggle";
import TxPath from "../../components/TxPath";
import TxStatus from "../../components/TxStatus";
import WalletBadge from "../../components/WalletBadge";
import { executeDemoAction } from "../../lib/demoAction";
import { OperationRecord } from "../../lib/operations";
import { measure } from "../../lib/telemetry";

export default function SubsidyPage() {
  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [txStatus, setTxStatus] = useState<"idle" | "pending" | "confirmed" | "failed">("idle");
  const [txInfo, setTxInfo] = useState<{
    txHash?: string | null;
    explorerUrl?: string | null;
    gasPayer?: string | null;
    failureReason?: string | null;
  }>({});
  const [subsidyEnabled, setSubsidyEnabled] = useState(false);
  const [records, setRecords] = useState<OperationRecord[]>([]);

  const handleExecute = async () => {
    if (!isConnected || !address || !chainId) {
      throw new Error("请先连接受支持的网络和钱包");
    }
    setTxStatus("pending");
    const res = await measure("demo-action", () =>
      executeDemoAction({
        networkId: chainId,
        account: address,
        isSubsidized: subsidyEnabled,
        mode: "erc4337",
        walletClient: walletClient ?? undefined,
      }),
    );
    setTxInfo({
      txHash: res.txHash,
      explorerUrl: res.explorerUrl ?? undefined,
      gasPayer: res.gasPayer,
      failureReason: res.failureReason ?? undefined,
    });
    setTxStatus(res.status === "failed" ? "failed" : "confirmed");

    const record: OperationRecord = {
      opId: crypto.randomUUID(),
      sender: address,
      networkId: chainId,
      isSubsidized: subsidyEnabled,
      txHash: res.txHash || null,
      blockNumber: res.blockNumber ? Number(res.blockNumber) : null,
      gasUsed: res.gasUsed ? res.gasUsed : null,
      gasPayer: res.gasPayer,
      explorerUrl: res.explorerUrl ?? null,
      status: res.status,
      failureReason: res.failureReason ?? null,
      createdAt: Date.now(),
    };
    setRecords((prev) => [record, ...prev].slice(0, 20));
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center px-6 py-12 text-foreground">
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-white/0 blur-3xl" aria-hidden="true" />
      <div className="relative flex w-full max-w-5xl flex-col gap-8">
        <div className="glass-card glow rounded-2xl p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex-1 space-y-4">
              <p className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-sm text-sky-100">
                支持网络 · Sepolia / Monad / anvil
              </p>
              <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">GasMorph · Web3 Gas 补贴体验</h1>
              <p className="max-w-3xl text-lg text-sky-100/90">
                连接钱包即可体验 Gas 补贴与链上交互预览。我们不收集私钥，仅在授权后读取公开地址。
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-sky-100/90">
                <span className="rounded-full border border-white/20 px-3 py-1">钱包登录</span>
                <span className="rounded-full border border-white/20 px-3 py-1">状态校验 / 网络提示</span>
                <span className="rounded-full border border-white/20 px-3 py-1">Gas 补贴演示</span>
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <ConnectWalletButton />
                <div className="flex items-center gap-3">
                  <WalletBadge />
                  <SubsidyToggle onToggle={setSubsidyEnabled} />
                </div>
              </div>
              <PrivacyNotice />
            </div>
          </div>
        </div>

        <NetworkGuardBanner />

        <ShowcaseSummary />

        <section id="action" className="space-y-4">
          <ActionCard onExecute={handleExecute} />
          <TxStatus
            status={txStatus}
            txHash={txInfo.txHash || undefined}
            explorerUrl={txInfo.explorerUrl || undefined}
            gasPayer={txInfo.gasPayer || undefined}
            failureReason={txInfo.failureReason || undefined}
          />
        </section>
        <section className="space-y-4">
          <CostComparison records={records} />
          <TxPath
            records={records.map((r) => ({
              txHash: r.txHash,
              networkId: r.networkId,
              explorerUrl: r.explorerUrl,
              gasPayer: r.gasPayer,
              gasUsed: r.gasUsed,
              isSubsidized: r.isSubsidized,
              status: r.status,
              createdAt: r.createdAt,
            }))}
          />
        </section>
      </div>
    </main>
  );
}
