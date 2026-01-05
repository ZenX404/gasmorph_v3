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
  subsidizedWei: bigint;
  unsubsidizedWei: bigint;
  savedPercent: number;
};

export function computeCostSummary(records: OperationRecord[]): CostSummary {
  if (!records.length) {
    return { subsidizedWei: BigInt(0), unsubsidizedWei: BigInt(0), savedPercent: 0 };
  }
  // Use the latest 10 records to accumulate subsidized vs non-subsidized gas fees (wei)
  const latest = records.slice(0, 10);
  const subsidizedGas = latest
    .filter((r) => r.isSubsidized)
    .reduce((acc, r) => acc + safeGasWei(r.gasUsed), BigInt(0));
  const unsubsidizedGas = latest
    .filter((r) => !r.isSubsidized)
    .reduce((acc, r) => acc + safeGasWei(r.gasUsed), BigInt(0));

  const total = subsidizedGas + unsubsidizedGas;
  const savedPercent =
    total > BigInt(0)
      ? Math.min(100, Math.max(0, (Number(subsidizedGas) / Number(total)) * 100))
      : 0;
  return { subsidizedWei: subsidizedGas, unsubsidizedWei: unsubsidizedGas, savedPercent };
}

function safeGasWei(gasUsed: string | null): bigint {
  if (!gasUsed) return BigInt(0);
  try {
    return BigInt(gasUsed);
  } catch {
    return BigInt(0);
  }
}
