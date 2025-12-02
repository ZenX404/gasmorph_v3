"use client";

import { Chain } from "viem";
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

export default function TxPath({ records }: { records: Item[] }) {
  if (!records.length) return null;
  const list = records.slice(0, 5);

  return (
    <div className="glass-card rounded-2xl border border-white/15 p-6 text-white">
      <h3 className="text-lg font-semibold mb-3">交易路径</h3>
      <div className="space-y-2 text-sm text-sky-100/85">
        {list.map((item, idx) => {
          const base = item.explorerUrl ?? (item.networkId ? getExplorer(item.networkId) : null);
          const link = base && item.txHash ? `${base}/tx/${item.txHash}` : null;
          const gasEth =
            item.gasUsed && !Number.isNaN(Number(item.gasUsed))
              ? Number(BigInt(item.gasUsed)) / 1e18
              : null;
          return (
            <div key={`${item.txHash ?? "local"}-${idx}`} className="rounded-lg border border-white/10 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-sky-100/70">
                  {new Date(item.createdAt).toLocaleTimeString()} · {item.status}
                </span>
                {item.gasPayer && <span className="text-xs">费用承担方：{item.gasPayer}</span>}
              </div>
              <div className="break-all">
                Tx Hash：{link ? <a href={link}>{item.txHash}</a> : item.txHash ?? "本地模拟"}
              </div>
              {gasEth !== null && (
                <div className="text-sky-100/80">
                  Gas 消耗：{gasEth.toFixed(6)} ETH · 补贴金额：{item.isSubsidized ? gasEth.toFixed(6) : "0.000000"} ETH
                </div>
              )}
              <div className="text-sky-100/70">
                链接：
                {link ? (
                  <a className="underline underline-offset-4" href={link} target="_blank" rel="noreferrer">
                    {link}
                  </a>
                ) : (
                  "本地模式（可复制哈希后 cast 查询）"
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
