"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import AppShell from "@/app/components/layout/AppShell";
import { PageShell, SectionCard } from "@/app/components/layout/pageShell";
import DashboardCards from "@/app/components/console/DashboardCards";
import SponsorSummary from "@/app/components/console/SponsorSummary";
import TransactionTable from "@/app/components/console/TransactionTable";
import IssueVoucherForm from "@/app/components/console/IssueVoucherForm";
import ProjectConfigCard from "@/app/components/console/ProjectConfigCard";
import ActivityForm, { type ActivityDraft } from "@/app/components/console/ActivityForm";
import ActivityList, { type ActivityListItem } from "@/app/components/console/ActivityList";
import TrendChart from "@/app/components/console/TrendChart";
import SubsidyToggle from "@/app/components/SubsidyToggle";
import { buildConsoleTrendSeries } from "@/app/lib/console/chartData";
import { writeProjectConfigCache } from "@/app/lib/console/projectConfigCache";
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

type ProjectConfigResponse = {
  subsidyAccount: { address: string; note?: string } | null;
  checkInEnabled: boolean;
  updatedAt: string;
};

type ActivitiesResponse = {
  items: ActivityListItem[];
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

function buildConfigSignature(data?: ProjectConfigResponse | null) {
  if (!data) return "";
  const account = data.subsidyAccount ? `${data.subsidyAccount.address}:${data.subsidyAccount.note ?? ""}` : "";
  return `${account}|${data.checkInEnabled ? "1" : "0"}`;
}

function buildActivitySignature(items: ActivityListItem[]) {
  return items
    .map(
      (item) =>
        `${item.id}:${item.status}:${item.remainingQuota}:${item.startsAt}:${item.endsAt}:${item.updatedAt}`,
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
  const [projectConfig, setProjectConfig] = useState<ProjectConfigResponse | null>(null);
  const [configLoading, setConfigLoading] = useState(false);
  const [configMessage, setConfigMessage] = useState<string | null>(null);
  const [activities, setActivities] = useState<ActivityListItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activitySubmitting, setActivitySubmitting] = useState(false);
  const [activityMessage, setActivityMessage] = useState<string | null>(null);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [activityActionId, setActivityActionId] = useState<string | null>(null);
  const overviewSigRef = useRef("");
  const txSigRef = useRef("");
  const configSigRef = useRef("");
  const activitySigRef = useRef("");

  const nav = useMemo(
    () => navItems.map((item) => ({ ...item, isActive: item.href === pathname })),
    [pathname],
  );

  const chartSeries = useMemo(() => buildConsoleTrendSeries(transactions), [transactions]);

  const refresh = useCallback(async () => {
    try {
      const [overviewRes, txRes, configRes] = await Promise.all([
        fetch("/api/console/overview"),
        fetch("/api/console/transactions"),
        fetch("/api/console/project-config"),
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
      if (configRes.ok) {
        const configJson = (await configRes.json()) as ProjectConfigResponse;
        const sig = buildConfigSignature(configJson);
        if (sig !== configSigRef.current) {
          configSigRef.current = sig;
          setProjectConfig(configJson);
        }
      }
    } catch {
      // ignore refresh errors to keep UI responsive
    }
  }, []);

  const loadActivities = useCallback(
    async (options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false;
      if (!silent) {
        setActivityLoading(true);
        setActivityMessage(null);
        setActivityError(null);
      }
      try {
        const res = await fetch("/api/console/activities");
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to load activities");
        }
        const data = (await res.json()) as ActivitiesResponse;
        const nextItems = data.items ?? [];
        const sig = buildActivitySignature(nextItems);
        if (sig !== activitySigRef.current) {
          activitySigRef.current = sig;
          setActivities(nextItems);
        }
      } catch (error) {
        if (!silent) {
          setActivityError((error as Error).message || "Failed to load activities");
        }
      } finally {
        if (!silent) {
          setActivityLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh]);

  useEffect(() => {
    loadActivities();
    const interval = setInterval(() => loadActivities({ silent: true }), 5000);
    const handleFocus = () => loadActivities({ silent: true });
    window.addEventListener("focus", handleFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [loadActivities]);

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

  const handleConfigSave = async (payload: {
    subsidyAccount: { address: string; note?: string } | null;
    checkInEnabled: boolean;
    sponsorPrivateKey?: string | null;
  }) => {
    setConfigLoading(true);
    setConfigMessage(null);
    writeProjectConfigCache({
      subsidyAccount: payload.subsidyAccount,
      checkInEnabled: payload.checkInEnabled,
      updatedAt: Date.now(),
    });
    try {
      const res = await fetch("/api/console/project-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        setConfigMessage(data.error || "Failed to save project config");
        return;
      }
      setConfigMessage("配置已保存");
      await refresh();
    } catch (error) {
      setConfigMessage((error as Error).message || "Failed to save project config");
    } finally {
      setConfigLoading(false);
    }
  };

  const handleCheckInToggle = async (enabled: boolean) => {
    setConfigLoading(true);
    setConfigMessage(null);
    writeProjectConfigCache({
      subsidyAccount: projectConfig?.subsidyAccount ?? null,
      checkInEnabled: enabled,
      updatedAt: Date.now(),
    });
    try {
      const res = await fetch("/api/console/project-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkInEnabled: enabled }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update check-in state");
      }
      setConfigMessage("配置已保存");
      await refresh();
    } finally {
      setConfigLoading(false);
    }
  };

  const handleActivityCreate = async (payload: ActivityDraft) => {
    setActivitySubmitting(true);
    setActivityMessage(null);
    setActivityError(null);
    try {
      const res = await fetch("/api/console/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        setActivityError(data.error || "Failed to create activity");
        return;
      }
      setActivityMessage("活动已创建");
      await loadActivities();
    } catch (error) {
      setActivityError((error as Error).message || "Failed to create activity");
    } finally {
      setActivitySubmitting(false);
    }
  };

  const handleActivityStatus = async (id: string, status: "active" | "paused") => {
    setActivityActionId(id);
    setActivityMessage(null);
    setActivityError(null);
    try {
      const res = await fetch(`/api/console/activities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json();
        setActivityError(data.error || "Failed to update activity");
        return;
      }
      setActivityMessage("活动状态已更新");
      await loadActivities({ silent: true });
    } catch (error) {
      setActivityError((error as Error).message || "Failed to update activity");
    } finally {
      setActivityActionId(null);
    }
  };

  const handleActivityDelete = async (id: string) => {
    const confirmed = window.confirm("确认删除该活动吗？");
    if (!confirmed) return;
    setActivityActionId(id);
    setActivityMessage(null);
    setActivityError(null);
    try {
      const res = await fetch(`/api/console/activities/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setActivityError(data.error || "Failed to delete activity");
        return;
      }
      setActivityMessage("活动已删除");
      await loadActivities({ silent: true });
    } catch (error) {
      setActivityError((error as Error).message || "Failed to delete activity");
    } finally {
      setActivityActionId(null);
    }
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
        <div className="lg:col-span-8 space-y-6">
          <SectionCard title="运行概览" subtitle="实时运营指标，并预留后续图表扩展空间。">
            <DashboardCards metrics={overview?.metrics ?? []} />
          </SectionCard>
          <SectionCard title="覆盖趋势" subtitle="按小时展示补贴与消费券覆盖量。">
            <TrendChart series={chartSeries} />
          </SectionCard>
          <SectionCard title="活动管理" subtitle="创建活动并同步到演示页面。">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <ActivityForm
                  onCreate={handleActivityCreate}
                  isLoading={activitySubmitting}
                  message={activityMessage}
                />
              </div>
              <div className="space-y-3">
                {activityLoading ? <p className="text-sm text-[var(--app-muted)]">正在加载活动...</p> : null}
                <ActivityList
                  items={activities}
                  onStatusChange={handleActivityStatus}
                  onDelete={handleActivityDelete}
                  busyId={activityActionId}
                />
                {activityError ? <p className="text-sm text-rose-600">{activityError}</p> : null}
              </div>
            </div>
          </SectionCard>
          <SectionCard title="最新交易" subtitle="最新的补贴与消费券动作。">
            <TransactionTable items={transactions} />
          </SectionCard>
        </div>
        <div className="lg:col-span-4 space-y-6">
          <SectionCard title="补贴账户" subtitle="当前补贴扣费账户与近期活动快照。">
            <SponsorSummary summary={overview?.sponsorSummary} />
          </SectionCard>
          <SectionCard title="项目配置" subtitle="设置补贴扣费账户与签到活动开关。">
            <ProjectConfigCard
              key={projectConfig?.updatedAt ?? "config"}
              config={projectConfig}
              onSave={handleConfigSave}
              onToggleCheckIn={handleCheckInToggle}
              saving={configLoading}
              message={configMessage}
            />
          </SectionCard>
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
      </PageShell>
    </AppShell>
  );
}
