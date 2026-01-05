"use client";

import { formatEther, type Chain } from "viem";
import { getSupportedChains } from "../lib/chains";

type Item = {
  txHash: string | null;
  networkId: number | null;
  explorerUrl: string | null;
  gasPayer: string | null;
  gasUsed?: string | null; // wei
  isSubsidized?: boolean;
  status: string;
  createdAt: number;
};

function getExplorer(chainId?: number | null): string | null {
  if (!chainId) return null;
  const chain = (getSupportedChains() as Chain[]).find((c) => c.id === chainId);
  return chain?.blockExplorers?.default?.url ?? null;
}

function payerLabel(value?: string | null) {
  if (value === "voucher") return "消费券";
  if (value === "sponsor") return "补贴账户";
  if (value === "user") return "钱包";
  return "未知";
}

function statusLabel(value: string) {
  if (value === "pending") return "进行中";
  if (value === "confirmed") return "已确认";
  if (value === "failed") return "失败";
  return value;
}

function formatEth(wei: string | null | undefined, decimals = 6) {
  if (!wei) return null;
  try {
    const raw = formatEther(BigInt(wei));
    const sign = raw.startsWith("-") ? "-" : "";
    const value = sign ? raw.slice(1) : raw;
    const [whole, frac = ""] = value.split(".");
    const padded = frac.slice(0, decimals).padEnd(decimals, "0");
    return `${sign}${whole}.${padded}`;
  } catch {
    return null;
  }
}

export default function TxPath({ records }: { records: Item[] }) {
  if (!records.length) return null;
  const list = records.slice(0, 5);

  return (
    <div className="glass-card rounded-2xl border border-[var(--app-border)] p-6 text-[var(--app-fg)]">
      <h3 className="mb-3 text-lg font-semibold">交易轨迹</h3>
      <div className="space-y-2 text-sm text-[var(--app-muted)]">
        {list.map((item, idx) => {
          const base = item.explorerUrl ?? (item.networkId ? getExplorer(item.networkId) : null);
          const link = base && item.txHash ? `${base}/tx/${item.txHash}` : null;
          const gasEth = formatEth(item.gasUsed);
          return (
            <div key={`${item.txHash ?? "local"}-${idx}`} className="rounded-lg border border-[var(--app-border)] p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--app-muted)]">
                  {new Date(item.createdAt).toLocaleTimeString()} - {statusLabel(item.status)}
                </span>
                <span className="text-xs">费用来源：{payerLabel(item.gasPayer)}</span>
              </div>
              <div className="break-all">
                交易哈希：{link ? (
                  <a className="underline underline-offset-4" href={link} target="_blank" rel="noreferrer">
                    {item.txHash}
                  </a>
                ) : (
                  item.txHash ?? "本地模拟"
                )}
              </div>
              {gasEth !== null && (
                <div className="text-[var(--app-muted)]">
                  Gas 使用：{gasEth} ETH - 已抵扣：{item.isSubsidized ? gasEth : "0.000000"} ETH
                </div>
              )}
              <div className="text-[var(--app-muted)]">
                区块浏览器：{link ? (
                  <a className="underline underline-offset-4" href={link} target="_blank" rel="noreferrer">
                    {link}
                  </a>
                ) : (
                  "本地模式"
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
