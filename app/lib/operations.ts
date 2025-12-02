export type OperationRecord = {
  opId: string;
  sender: string;
  networkId: number;
  isSubsidized: boolean;
  txHash: string | null;
  blockNumber: number | null;
  gasUsed: string | null; // wei amount
  gasPayer: string | null;
  explorerUrl: string | null;
  status: "pending" | "confirmed" | "failed" | "cancelled";
  failureReason?: string | null;
  createdAt: number;
};

export type CostSummary = {
  subsidized: number;
  unsubsidized: number;
  savedPercent: number;
};

export function computeCostSummary(records: OperationRecord[]): CostSummary {
  if (!records.length) {
    return { subsidized: 0, unsubsidized: 0, savedPercent: 0 };
  }
  // Use the latest 10 records to accumulate subsidized vs non-subsidized gas fees (wei)
  const latest = records.slice(0, 10);
  const subsidizedGas = latest
    .filter((r) => r.isSubsidized)
    .reduce((acc, r) => acc + safeGas(r.gasUsed), 0);
  const unsubsidizedGas = latest
    .filter((r) => !r.isSubsidized)
    .reduce((acc, r) => acc + safeGas(r.gasUsed), 0);

  const unsubsidized = unsubsidizedGas / 1e18;
  const subsidized = subsidizedGas / 1e18;
  const total = subsidized + unsubsidized;
  const savedPercent = total > 0 ? Math.min(100, Math.max(0, (subsidized / total) * 100)) : 0;
  return { subsidized, unsubsidized, savedPercent };
}

function safeGas(gasUsed: string | null): number {
  if (!gasUsed) return 0;
  try {
    return Number(BigInt(gasUsed));
  } catch {
    return 0;
  }
}
