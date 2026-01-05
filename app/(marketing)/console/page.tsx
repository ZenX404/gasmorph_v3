"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import AppShell from "@/app/components/layout/AppShell";
import { PageShell, SectionCard } from "@/app/components/layout/pageShell";
import DashboardCards from "@/app/components/console/DashboardCards";
import SponsorSummary from "@/app/components/console/SponsorSummary";
import TransactionTable from "@/app/components/console/TransactionTable";
import IssueVoucherForm from "@/app/components/console/IssueVoucherForm";
import TrendChart from "@/app/components/console/TrendChart";
import SubsidyToggle from "@/app/components/SubsidyToggle";
import { buildConsoleTrendSeries } from "@/app/lib/console/chartData";
import { normalizeMetrics, type ConsoleMetric } from "@/app/lib/console/metrics";
import type { VoucherKind } from "@/app/lib/voucher/types";

const navItems = [
  { label: "演示", href: "/subsidy" },
  { label: "控制台", href: "/console" },
];

type OverviewResponse = {
  subsidyEnabled: boolean;
  metrics: ConsoleMetric[];
  sponsorSummary?: {
    address: string;
    balanceDelta: string;
    lastTxAt: string | null;
  };
};

type TransactionItem = {
  txHash: string;
  sender: string;
  status: "confirmed" | "failed" | "pending";
  gasPayer: "sponsor" | "user" | "voucher";
  gasUsed?: string | null;
  networkId?: number | null;
  explorerUrl?: string | null;
  blockNumber?: number | null;
  voucherId?: string | null;
  createdAt: number;
};

function isValidAddress(value: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

function buildOverviewSignature(data?: OverviewResponse | null) {
  if (!data) return "";
  const metricSig = (data.metrics ?? []).map((metric) => `${metric.key}:${metric.value}`).join("|");
  const sponsor = data.sponsorSummary
    ? `${data.sponsorSummary.address ?? ""}:${data.sponsorSummary.balanceDelta ?? ""}:${data.sponsorSummary.lastTxAt ?? ""}`
    : "";
  return `${data.subsidyEnabled ? "1" : "0"}|${metricSig}|${sponsor}`;
}

function buildTxSignature(items: TransactionItem[]) {
  return items
    .map(
      (item) =>
        `${item.txHash}:${item.sender}:${item.status}:${item.gasPayer}:${item.gasUsed ?? ""}:${item.createdAt}`,
    )
    .join("|");
}

export default function ConsolePage() {
  const pathname = usePathname();
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [issueLoading, setIssueLoading] = useState(false);
  const [issueMessage, setIssueMessage] = useState<string | null>(null);
  const [resetAddress, setResetAddress] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const overviewSigRef = useRef("");
  const txSigRef = useRef("");

  const nav = useMemo(
    () => navItems.map((item) => ({ ...item, isActive: item.href === pathname })),
    [pathname],
  );

  const chartSeries = useMemo(() => buildConsoleTrendSeries(transactions), [transactions]);

  const refresh = useCallback(async () => {
    try {
      const [overviewRes, txRes] = await Promise.all([
        fetch("/api/console/overview"),
        fetch("/api/console/transactions"),
      ]);
      if (overviewRes.ok) {
        const overviewJson = (await overviewRes.json()) as OverviewResponse;
        const nextOverview = {
          subsidyEnabled: overviewJson.subsidyEnabled,
          metrics: normalizeMetrics(overviewJson.metrics ?? []),
          sponsorSummary: overviewJson.sponsorSummary,
        };
        const sig = buildOverviewSignature(nextOverview);
        if (sig !== overviewSigRef.current) {
          overviewSigRef.current = sig;
          setOverview(nextOverview);
        }
      }
      if (txRes.ok) {
        const txJson = (await txRes.json()) as { items: TransactionItem[] };
        const nextItems = txJson.items ?? [];
        const sig = buildTxSignature(nextItems);
        if (sig !== txSigRef.current) {
          txSigRef.current = sig;
          setTransactions(nextItems);
        }
      }
    } catch {
      // ignore refresh errors to keep UI responsive
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh]);

  const handleToggle = async (enabled: boolean) => {
    setToggleLoading(true);
    setIssueMessage(null);
    try {
      const res = await fetch("/api/console/subsidy-toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      if (!res.ok) throw new Error("Failed to update subsidy state");
      await refresh();
    } catch (error) {
      setIssueMessage((error as Error).message);
    } finally {
      setToggleLoading(false);
    }
  };

  const handleIssue = async (target: string, kind: VoucherKind) => {
    setIssueLoading(true);
    setIssueMessage(null);
    const res = await fetch("/api/console/issue-voucher", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target, type: kind }),
    });
    if (!res.ok) {
      const data = await res.json();
      setIssueMessage(data.error || "Failed to issue voucher");
      setIssueLoading(false);
      return;
    }
    setIssueMessage("消费券发放成功");
    setIssueLoading(false);
    await refresh();
  };

  const handleResetCheckIn = async () => {
    setResetMessage(null);
    if (!isValidAddress(resetAddress)) {
      setResetMessage("Invalid address");
      return;
    }
    setResetLoading(true);
    const res = await fetch("/api/demo/checkin-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet: resetAddress }),
    });
    if (!res.ok) {
      const data = await res.json();
      setResetMessage(data.error || "Failed to reset check-in");
      setResetLoading(false);
      return;
    }
    setResetMessage("已重置签到记录，可重新领取");
    setResetLoading(false);
  };

  return (
    <AppShell
      title="GasMorph 控制台"
      badge="控制台"
      subtitle="集中查看补贴表现、发放消费券，并跟踪补贴账户活动。"
      navItems={nav}
      actions={
        <SubsidyToggle
          enabled={overview?.subsidyEnabled ?? false}
          onToggle={handleToggle}
          disabled={toggleLoading}
        />
      }
    >
      <PageShell>
        <div className="lg:col-span-7">
          <SectionCard
            title="运行概览"
            subtitle="实时运营指标，并预留后续图表扩展空间。"
          >
            <DashboardCards metrics={overview?.metrics ?? []} />
          </SectionCard>
        </div>
        <div className="lg:col-span-5">
          <SectionCard title="补贴账户" subtitle="余额变动与近期活动快照。">
            <SponsorSummary summary={overview?.sponsorSummary} />
          </SectionCard>
        </div>
        <div className="lg:col-span-7">
          <SectionCard title="覆盖趋势" subtitle="按小时展示补贴与消费券覆盖量。">
            <TrendChart series={chartSeries} />
          </SectionCard>
        </div>
        <div className="lg:col-span-5">
          <SectionCard title="发放消费券" subtitle="在控制台向任意地址发放消费券 NFT。">
            <IssueVoucherForm onIssue={handleIssue} isLoading={issueLoading} />
            {issueMessage ? <p className="mt-4 text-sm text-[var(--app-muted)]">{issueMessage}</p> : null}
            <div className="mt-6 rounded-2xl border border-dashed border-[var(--app-border)] bg-white/80 px-4 py-4 text-sm text-[var(--app-fg)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">重置签到记录</p>
                  <p className="text-xs text-[var(--app-muted)]">
                    仅本地演示使用，清空当日签到记录，便于再次领取。
                  </p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                  本地演示
                </span>
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  value={resetAddress}
                  onChange={(event) => setResetAddress(event.target.value)}
                  placeholder="输入钱包地址"
                  className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-800 outline-none transition focus:border-amber-300"
                />
                <button
                  type="button"
                  onClick={handleResetCheckIn}
                  disabled={resetLoading}
                  className="rounded-full border border-amber-200 bg-amber-100 px-4 py-2 text-xs font-semibold text-amber-900 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {resetLoading ? "重置中..." : "重置签到"}
                </button>
              </div>
              {resetMessage ? <p className="mt-3 text-xs text-rose-600">{resetMessage}</p> : null}
            </div>
          </SectionCard>
        </div>
        <div className="lg:col-span-12">
          <SectionCard title="最新交易" subtitle="最新的补贴与消费券动作。">
            <TransactionTable items={transactions} />
          </SectionCard>
        </div>
      </PageShell>
    </AppShell>
  );
}
