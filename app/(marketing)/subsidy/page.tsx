"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAccount, useChainId, usePublicClient, useWalletClient } from "wagmi";
import { usePathname } from "next/navigation";
import type { Address } from "viem";
import AppShell from "@/app/components/layout/AppShell";
import { PageShell, SectionCard } from "@/app/components/layout/pageShell";
import ActionCard from "@/app/components/ActionCard";
import ConnectWalletButton from "@/app/components/ConnectWalletButton";
import CostComparison from "@/app/components/CostComparison";
import NetworkGuardBanner from "@/app/components/NetworkGuardBanner";
import PrivacyNotice from "@/app/components/PrivacyNotice";
import ShowcaseSummary from "@/app/components/ShowcaseSummary";
import TxPath from "@/app/components/TxPath";
import TxStatus from "@/app/components/TxStatus";
import WalletBadge from "@/app/components/WalletBadge";
import ActivityBoard from "@/app/components/voucher/ActivityBoard";
import CheckInCard from "@/app/components/voucher/CheckInCard";
import TransferVoucherModal from "@/app/components/voucher/TransferVoucherModal";
import VoucherList from "@/app/components/voucher/VoucherList";
import { executeDemoAction } from "@/app/lib/demoAction";
import type { OperationRecord } from "@/app/lib/operations";
import { measure } from "@/app/lib/telemetry";
import { getSupportedChains } from "@/app/lib/chains";
import { voucherAbi, voucherAddress } from "@/app/lib/contracts/voucher";
import { isVoucherApprovalRequired, shouldBlockVoucherExecution } from "@/app/lib/voucher/approval";
import { fetchVoucherTokens } from "@/app/lib/voucher/client";
import { pickVoucherForUse } from "@/app/lib/voucher/logic";
import { voucherTypeLabels, type VoucherToken } from "@/app/lib/voucher/types";
import type { ActivityErrorCode } from "@/app/lib/activities/errors";
import type { ActivityStatus } from "@/app/lib/activities/types";
import {
  readProjectConfigCache,
  subscribeProjectConfigCache,
  writeProjectConfigCache,
} from "@/app/lib/console/projectConfigCache";
import { GasMorphClient } from "@gasmorph/sdk";

const navItems = [
  { label: "演示", href: "/subsidy" },
  { label: "控制台", href: "/console" },
];

type OverviewResponse = {
  subsidyEnabled: boolean;
  sponsorSummary?: {
    address?: string;
  };
};

type ConsoleTransactionItem = {
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

type DemoActivityItem = {
  id: string;
  name: string;
  startsAt: number;
  endsAt: number;
  voucherType: keyof typeof voucherTypeLabels;
  totalQuota: number;
  remainingQuota: number;
  status: ActivityStatus;
  createdAt: number;
  updatedAt: number;
  claimed: boolean;
  claimable: boolean;
  claimError?: ActivityErrorCode | null;
};

function isValidAddress(value: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

function formatErrorMessage(error: unknown) {
  const raw = error instanceof Error ? error.message : String(error);
  const normalized = raw.replace(/\s+/g, " ").trim();
  if (!normalized) return "Transaction request failed.";
  if (/user denied|user rejected|denied transaction/i.test(normalized)) {
    return "User denied the transaction signature.";
  }
  if (/NotOwnerOrApproved|approval required|setApprovalForAll/i.test(normalized)) {
    return "Voucher approval required before using vouchers.";
  }
  if (/tokensOfOwner|eth_call/i.test(normalized)) {
    return "Failed to load vouchers from the contract. Check the contract address and network.";
  }
  if (normalized.length > 180) {
    return `${normalized.slice(0, 180)}...`;
  }
  return normalized;
}

function buildConsoleStatusSignature(enabled: boolean, sponsorAddress?: Address | null) {
  return `${enabled ? "1" : "0"}|${sponsorAddress ?? ""}`;
}

function buildTokenSignature(tokens: VoucherToken[]) {
  return tokens
    .map(
      (token) =>
        `${token.tokenId.toString()}:${token.status}:${token.usesRemaining}:${token.expiresAt ?? 0}:${token.issuedAt}`,
    )
    .join("|");
}

function buildRecordSignature(records: OperationRecord[]) {
  return records
    .map(
      (record) =>
        `${record.txHash}:${record.status}:${record.gasPayer}:${record.gasUsed ?? ""}:${record.createdAt}`,
    )
    .join("|");
}

function buildConfigSignature(config?: ProjectConfigResponse | null) {
  if (!config) return "";
  const account = config.subsidyAccount
    ? `${config.subsidyAccount.address}:${config.subsidyAccount.note ?? ""}`
    : "";
  return `${account}|${config.checkInEnabled ? "1" : "0"}`;
}

export default function SubsidyPage() {
  const pathname = usePathname();
  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const sdk = useMemo(() => new GasMorphClient(), []);
  const [txStatus, setTxStatus] = useState<"idle" | "pending" | "confirmed" | "failed">("idle");
  const [txInfo, setTxInfo] = useState<{
    txHash?: string | null;
    explorerUrl?: string | null;
    gasPayer?: string | null;
    failureReason?: string | null;
  }>({});
  const [subsidyEnabled, setSubsidyEnabled] = useState(false);
  const [records, setRecords] = useState<OperationRecord[]>([]);
  const [tokens, setTokens] = useState<VoucherToken[]>([]);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkinMessage, setCheckinMessage] = useState<string | null>(null);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferTarget, setTransferTarget] = useState<VoucherToken | null>(null);
  const [sponsorAddress, setSponsorAddress] = useState<Address | null>(null);
  const [voucherApproved, setVoucherApproved] = useState(false);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [approvalError, setApprovalError] = useState<string | null>(null);
  const [checkInEnabled, setCheckInEnabled] = useState(true);
  const [activities, setActivities] = useState<DemoActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [claimingActivityId, setClaimingActivityId] = useState<string | null>(null);
  const statusSigRef = useRef("");
  const tokenSigRef = useRef("");
  const recordSigRef = useRef("");
  const configSigRef = useRef("");

  const nav = useMemo(
    () => navItems.map((item) => ({ ...item, isActive: item.href === pathname })),
    [pathname],
  );
  const supportedChainIds = useMemo(() => new Set(getSupportedChains().map((chain) => chain.id)), []);

  const activeVoucher = useMemo(() => pickVoucherForUse(tokens), [tokens]);
  const voucherReady = Boolean(activeVoucher);
  const voucherApplied = !subsidyEnabled && voucherReady;
  const needsVoucherApproval = isVoucherApprovalRequired({
    voucherApplied,
    voucherApproved,
    sponsorAddress,
  });

  const loadConsoleStatus = useCallback(async () => {
    try {
      const data = (await sdk.getOverview()) as OverviewResponse;
      const nextSubsidyEnabled = Boolean(data.subsidyEnabled);
      const nextSponsor =
        data.sponsorSummary?.address && isValidAddress(data.sponsorSummary.address)
          ? (data.sponsorSummary.address as Address)
          : null;
      const sig = buildConsoleStatusSignature(nextSubsidyEnabled, nextSponsor);
      if (sig !== statusSigRef.current) {
        statusSigRef.current = sig;
        setSubsidyEnabled(nextSubsidyEnabled);
        setSponsorAddress(nextSponsor);
      }
    } catch {
      setSubsidyEnabled(false);
    }
  }, [sdk]);

  const loadProjectConfig = useCallback(async () => {
    const cached = readProjectConfigCache();
    if (cached) {
      const sig = buildConfigSignature({
        subsidyAccount: cached.subsidyAccount,
        checkInEnabled: cached.checkInEnabled,
        updatedAt: new Date(cached.updatedAt).toISOString(),
      });
      if (sig !== configSigRef.current) {
        configSigRef.current = sig;
        setCheckInEnabled(Boolean(cached.checkInEnabled));
      }
    }
    try {
      const data = (await sdk.getProjectConfig()) as ProjectConfigResponse;
      const serverUpdatedAt = Number.isNaN(Date.parse(data.updatedAt))
        ? Date.now()
        : Date.parse(data.updatedAt);
      if (cached && serverUpdatedAt < cached.updatedAt) {
        return;
      }
      const sig = buildConfigSignature(data);
      if (sig !== configSigRef.current) {
        configSigRef.current = sig;
        setCheckInEnabled(Boolean(data.checkInEnabled));
      }
      writeProjectConfigCache({
        subsidyAccount: data.subsidyAccount ?? null,
        checkInEnabled: Boolean(data.checkInEnabled),
        updatedAt: serverUpdatedAt,
      });
    } catch {
      if (!cached) {
        setCheckInEnabled(true);
      }
    }
  }, [sdk]);

  const loadActivities = useCallback(
    async (options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false;
      if (!silent) {
        setActivityLoading(true);
        setActivityError(null);
      }
      try {
        const query = address ? `?wallet=${address}` : "";
        const res = await fetch(`/api/demo/activities${query}`, { cache: "no-store" });
        if (!res.ok) {
          const errorData = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(errorData.error || "Failed to load activities");
        }
        const data = (await res.json()) as { items: DemoActivityItem[] };
        const nextItems = (data.items ?? []) as DemoActivityItem[];
        setActivities(nextItems);
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
    [address],
  );

  const refreshVouchers = useCallback(
    async (options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false;
      if (!address || !publicClient) {
        setTokens([]);
        setVoucherError(null);
        return;
      }
      if (!voucherAddress || !isValidAddress(voucherAddress)) {
        setTokens([]);
        setVoucherError(null);
        return;
      }
      if (chainId && !supportedChainIds.has(chainId)) {
        setTokens([]);
        setVoucherError(null);
        return;
      }
      if (!silent) {
        setVoucherLoading(true);
        setVoucherError(null);
      }
      try {
        const bytecode = await publicClient.getBytecode({ address: voucherAddress });
        if (!bytecode || bytecode === "0x") {
          setTokens([]);
          setVoucherError(null);
          return;
        }
        const data = await fetchVoucherTokens({ client: publicClient, owner: address as Address });
        const sig = buildTokenSignature(data);
        if (sig !== tokenSigRef.current) {
          tokenSigRef.current = sig;
          setTokens(data);
        }
      } catch (error) {
        const message = formatErrorMessage(error);
        if (/Failed to load vouchers|fetch failed|contract address|tokensOfOwner|eth_call/i.test(message)) {
          setTokens([]);
          setVoucherError(null);
          return;
        }
        setVoucherError(message);
      } finally {
        if (!silent) {
          setVoucherLoading(false);
        }
      }
    },
    [address, publicClient, chainId, supportedChainIds],
  );

  const refreshTransactions = useCallback(async () => {
    try {
      if (!address) {
        if (recordSigRef.current) {
          recordSigRef.current = "";
          setRecords([]);
        }
        return;
      }
      const res = await fetch("/api/console/transactions");
      if (!res.ok) return;
      const data = (await res.json()) as { items: ConsoleTransactionItem[] };
      const fallbackChainId = chainId ?? 1337;
      const normalized = address.toLowerCase();
      const filtered = (data.items ?? []).filter((item) => item.sender.toLowerCase() === normalized);
      const mapped = filtered.map((item, idx) => ({
        opId: item.txHash ?? `${item.createdAt}-${idx}`,
        sender: item.sender,
        networkId: item.networkId ?? fallbackChainId,
        isSubsidized: item.gasPayer === "sponsor" || item.gasPayer === "voucher",
        txHash: item.txHash,
        blockNumber: item.blockNumber ?? null,
        gasUsed: item.gasUsed ?? null,
        gasPayer: item.gasPayer,
        explorerUrl: item.explorerUrl ?? null,
        status: item.status,
        failureReason: null,
        createdAt: item.createdAt,
      }));
      const sig = buildRecordSignature(mapped);
      if (sig !== recordSigRef.current) {
        recordSigRef.current = sig;
        setRecords(mapped);
      }
    } catch {
      // ignore refresh errors to keep UI responsive
    }
  }, [address, chainId]);

  const refreshVoucherApproval = useCallback(async () => {
    if (!address || !publicClient || !sponsorAddress || !activeVoucher) {
      setVoucherApproved(false);
      setApprovalError(null);
      return;
    }
    if (!voucherAddress) {
      setVoucherApproved(false);
      setApprovalError("Voucher contract address missing");
      return;
    }
    setApprovalLoading(true);
    setApprovalError(null);
    try {
      const approvedForAll = (await publicClient.readContract({
        address: voucherAddress,
        abi: voucherAbi,
        functionName: "isApprovedForAll",
        args: [address as Address, sponsorAddress],
      })) as boolean;

      if (approvedForAll) {
        setVoucherApproved(true);
        return;
      }

      const approvedAddress = (await publicClient.readContract({
        address: voucherAddress,
        abi: voucherAbi,
        functionName: "getApproved",
        args: [activeVoucher.tokenId],
      })) as Address;

      setVoucherApproved(approvedAddress?.toLowerCase() === sponsorAddress.toLowerCase());
    } catch (error) {
      setApprovalError(formatErrorMessage(error));
      setVoucherApproved(false);
    } finally {
      setApprovalLoading(false);
    }
  }, [address, publicClient, sponsorAddress, activeVoucher]);

  useEffect(() => {
    loadConsoleStatus();
    const interval = setInterval(loadConsoleStatus, 5000);
    const handleFocus = () => loadConsoleStatus();
    window.addEventListener("focus", handleFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [loadConsoleStatus]);

  useEffect(() => {
    loadProjectConfig();
    const interval = setInterval(loadProjectConfig, 5000);
    const handleFocus = () => loadProjectConfig();
    window.addEventListener("focus", handleFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [loadProjectConfig]);

  useEffect(() => {
    const unsubscribe = subscribeProjectConfigCache((next) => {
      const sig = buildConfigSignature({
        subsidyAccount: next.subsidyAccount,
        checkInEnabled: next.checkInEnabled,
        updatedAt: new Date(next.updatedAt).toISOString(),
      });
      if (sig !== configSigRef.current) {
        configSigRef.current = sig;
        setCheckInEnabled(Boolean(next.checkInEnabled));
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    refreshVouchers();
  }, [address, chainId, publicClient, refreshVouchers]);

  useEffect(() => {
    refreshVoucherApproval();
  }, [refreshVoucherApproval]);

  useEffect(() => {
    refreshTransactions();
    loadActivities();
    const interval = setInterval(() => {
      refreshTransactions();
      loadActivities({ silent: true });
    }, 5000);
    const handleFocus = () => {
      refreshTransactions();
      loadActivities({ silent: true });
    };
    window.addEventListener("focus", handleFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [refreshTransactions, loadActivities]);

  useEffect(() => {
    if (!address || !publicClient) return;
    const interval = setInterval(() => refreshVouchers({ silent: true }), 10000);
    return () => clearInterval(interval);
  }, [address, publicClient, refreshVouchers]);

  const handleExecute = async () => {
    if (!isConnected || !address || !chainId) {
      throw new Error("Connect your wallet and select a supported network.");
    }
    if (shouldBlockVoucherExecution({ voucherApplied, voucherApproved })) {
      setTxStatus("failed");
      setTxInfo({ failureReason: "Voucher approval required before using vouchers." });
      return;
    }
    setTxStatus("pending");
    setTxInfo({});
    const voucherId = voucherApplied && activeVoucher ? activeVoucher.tokenId.toString() : null;
    try {
      const res = await measure("demo-action", () =>
        executeDemoAction({
          networkId: chainId,
          account: address,
          isSubsidized: subsidyEnabled,
          mode: "erc4337",
          walletClient: walletClient ?? undefined,
          voucherApplied,
          voucherId,
          voucherKind: activeVoucher?.kind ?? null,
          expectedSponsorAddress: sponsorAddress ?? undefined,
        }),
      );
      setTxInfo({
        txHash: res.txHash,
        explorerUrl: res.explorerUrl ?? undefined,
        gasPayer: res.gasPayer,
        failureReason: res.failureReason ?? undefined,
      });
      setTxStatus(res.status === "failed" ? "failed" : "confirmed");

      const isCovered = res.gasPayer === "sponsor" || res.gasPayer === "voucher";

      const record: OperationRecord = {
        opId: crypto.randomUUID(),
        sender: address,
        networkId: chainId,
        isSubsidized: isCovered,
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

      await fetch("/api/console/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txHash: res.txHash,
          sender: address,
          status: res.status === "confirmed" ? "confirmed" : res.status === "failed" ? "failed" : "pending",
          gasPayer: res.gasPayer ?? "user",
          gasUsed: res.gasUsed ?? null,
          networkId: chainId ?? null,
          explorerUrl: res.explorerUrl ?? null,
          blockNumber: res.blockNumber ?? null,
          voucherId,
          createdAt: record.createdAt,
        }),
      });

      if (voucherApplied) {
        await refreshVouchers();
      }
      await refreshTransactions();
    } catch (error) {
      setTxInfo({ failureReason: formatErrorMessage(error) });
      setTxStatus("failed");
    }
  };

  const handleVoucherApproval = async () => {
    if (!address || !walletClient) {
      setApprovalError("Connect your wallet to approve vouchers.");
      return;
    }
    if (!voucherAddress || !sponsorAddress) {
      setApprovalError("Voucher approval is unavailable.");
      return;
    }
    setApprovalLoading(true);
    setApprovalError(null);
    try {
      await walletClient.writeContract({
        address: voucherAddress,
        abi: voucherAbi,
        functionName: "setApprovalForAll",
        args: [sponsorAddress, true],
        account: address as Address,
      });
      setVoucherApproved(true);
      await refreshVoucherApproval();
    } catch (error) {
      setApprovalError(formatErrorMessage(error));
    } finally {
      setApprovalLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!checkInEnabled) {
      setCheckinMessage("Daily check-in disabled");
      return;
    }
    if (!address) {
      setCheckinMessage("Connect your wallet first.");
      return;
    }
    setCheckinLoading(true);
    setCheckinMessage(null);
    try {
      const data = await sdk.claimCheckIn(address);
      setCheckinMessage(`已发放消费券：${data.voucherId}`);
      await refreshVouchers();
    } catch (error) {
      setCheckinMessage((error as Error).message || "Failed to claim voucher");
    } finally {
      setCheckinLoading(false);
    }
  };

  const handleActivityClaim = async (activityId: string) => {
    if (!address) {
      setActivityError("Connect your wallet first.");
      return;
    }
    setClaimingActivityId(activityId);
    setActivityError(null);
    try {
      await sdk.claimActivity({ activityId, wallet: address });
      await refreshVouchers();
      await loadActivities({ silent: true });
    } catch (error) {
      setActivityError((error as Error).message || "Failed to claim activity");
    } finally {
      setClaimingActivityId(null);
    }
  };

  const handleTransfer = async (token: VoucherToken, to: string) => {
    if (!address || !walletClient) {
      throw new Error("Connect your wallet to transfer.");
    }
    if (!isValidAddress(to)) {
      throw new Error("Invalid recipient address");
    }
    if (!voucherAddress) {
      throw new Error("Voucher contract address missing");
    }

    await walletClient.writeContract({
      address: voucherAddress,
      abi: voucherAbi,
      functionName: "transferFrom",
      args: [address as Address, to as Address, token.tokenId],
      account: address as Address,
    });

    await refreshVouchers();
  };

  const handleBurn = async (token: VoucherToken) => {
    if (!address || !walletClient) {
      throw new Error("Connect your wallet to burn vouchers.");
    }
    if (!voucherAddress) {
      throw new Error("Voucher contract address missing");
    }
    const confirmed = window.confirm(`确认销毁消费券 #${token.tokenId.toString()} 吗？`);
    if (!confirmed) return;

    await walletClient.writeContract({
      address: voucherAddress,
      abi: voucherAbi,
      functionName: "burn",
      args: [token.tokenId],
      account: address as Address,
    });

    await refreshVouchers();
  };

  const coverageLabel = subsidyEnabled
    ? "项目补贴已开启"
    : voucherReady
      ? "消费券可抵扣"
      : "补贴未开启";
  const coverageTone = subsidyEnabled
    ? "bg-emerald-100 text-emerald-800"
    : voucherReady
      ? "bg-sky-100 text-sky-800"
      : "bg-white/70 text-[var(--app-muted)]";

  return (
    <AppShell
      title="GasMorph 补贴演示"
      badge="演示"
      subtitle="在测试网展示补贴路由、消费券 NFT 与交易可视化。"
      navItems={nav}
      actions={
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs ${coverageTone}`}>{coverageLabel}</span>
          <ConnectWalletButton />
        </div>
      }
    >
      <NetworkGuardBanner />
      <PageShell>
        <div className="lg:col-span-12">
          <ShowcaseSummary />
        </div>
        <div className="lg:col-span-7 space-y-6">
          <SectionCard
            title="运行演示交易"
            subtitle="触发一次链上动作，对比项目补贴、消费券抵扣与自费路径。"
            action={<span className="text-xs uppercase tracking-[0.2em] text-[var(--app-muted)]">{coverageLabel}</span>}
          >
            <div id="action" className="space-y-4">
              <ActionCard onExecute={handleExecute} />
              <TxStatus
                status={txStatus}
                txHash={txInfo.txHash || undefined}
                explorerUrl={txInfo.explorerUrl || undefined}
                gasPayer={txInfo.gasPayer || undefined}
                failureReason={txInfo.failureReason || undefined}
              />
            </div>
          </SectionCard>
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
        </div>
        <div className="lg:col-span-5 space-y-6">
          <SectionCard title="钱包与隐私" subtitle="连接钱包以铸造与管理消费券。">
            <div className="space-y-4">
              <WalletBadge />
              <PrivacyNotice />
              <div className="rounded-2xl border border-[var(--app-border)] bg-white/70 px-4 py-3 text-sm text-[var(--app-fg)]">
                补贴状态：{subsidyEnabled ? "开启" : "关闭"}
                <br />
                消费券状态：
                {voucherReady && activeVoucher
                  ? `可用：${voucherTypeLabels[activeVoucher.kind]}`
                  : "暂无可用消费券"}
              </div>
              {voucherApplied ? (
                <div className="rounded-2xl border border-[var(--app-border)] bg-white/80 px-4 py-3 text-sm text-[var(--app-fg)]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">消费券抵扣授权</p>
                      <p className="text-xs text-[var(--app-muted)]">
                        授权补贴账户一次后，可由项目方代付 GAS 并自动抵扣。
                      </p>
                    </div>
                    {needsVoucherApproval ? (
                      <button
                        type="button"
                        onClick={handleVoucherApproval}
                        disabled={approvalLoading}
                        className="rounded-full border border-amber-200 bg-amber-100 px-4 py-2 text-xs font-semibold text-amber-900 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {approvalLoading ? "授权处理中..." : "授权补贴账户"}
                      </button>
                    ) : (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        已授权可抵扣
                      </span>
                    )}
                  </div>
                  {approvalError ? (
                    <div className="mt-3 rounded-2xl border border-rose-200/80 bg-rose-50/80 px-4 py-3 text-xs text-rose-900 shadow-[0_14px_28px_rgba(244,63,94,0.12)]">
                      <div className="flex items-start gap-3">
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-rose-600">
                          Error
                        </span>
                        <div className="text-[11px] leading-relaxed text-rose-700">{approvalError}</div>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
              {voucherError ? (
                <div className="rounded-2xl border border-rose-200/80 bg-rose-50/80 px-4 py-3 text-xs text-rose-900 shadow-[0_14px_28px_rgba(244,63,94,0.12)]">
                  <div className="flex items-start gap-3">
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-rose-600">
                      Error
                    </span>
                    <div className="text-[11px] leading-relaxed text-rose-700">{voucherError}</div>
                  </div>
                </div>
              ) : null}
              {voucherLoading ? <p className="text-sm text-[var(--app-muted)]">正在加载消费券...</p> : null}
            </div>
          </SectionCard>
          <SectionCard title="每日签到" subtitle="每天铸造一个可抵扣 GAS 的消费券 NFT。">
            <CheckInCard
              onCheckIn={handleCheckIn}
              isLoading={checkinLoading}
              disabled={!checkInEnabled}
              disabledMessage={!checkInEnabled ? "每日签到已关闭" : null}
            />
            {checkinMessage ? <p className="mt-3 text-sm text-[var(--app-muted)]">{checkinMessage}</p> : null}
          </SectionCard>
          <SectionCard title="活动任务" subtitle="完成活动即可领取对应消费券奖励。">
            {activityLoading ? <p className="text-sm text-[var(--app-muted)]">正在加载活动...</p> : null}
            <ActivityBoard
              items={activities}
              onClaim={handleActivityClaim}
              claimingId={claimingActivityId}
              walletConnected={Boolean(address)}
              message={activityError}
            />
          </SectionCard>
          <SectionCard title="消费券清单" subtitle="管理钱包里的消费券（转赠/销毁）。">
            <VoucherList
              tokens={tokens}
              onTransfer={(token) => {
                setTransferTarget(token);
                setTransferOpen(true);
              }}
              onBurn={handleBurn}
            />
          </SectionCard>
        </div>
      </PageShell>
      <TransferVoucherModal
        open={transferOpen}
        token={transferTarget}
        onClose={() => {
          setTransferOpen(false);
          setTransferTarget(null);
        }}
        onTransfer={handleTransfer}
      />
    </AppShell>
  );
}
