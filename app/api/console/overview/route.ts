import { NextResponse } from "next/server";
import { createPublicClient, formatEther, http, type Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { normalizeMetrics } from "@/app/lib/console/metrics";
import { getConsoleState, setSponsorBaseline } from "@/app/lib/console/store";
import { createTraceContext, logError, logRequest } from "@/app/lib/telemetry/logger";

function getRpcUrl() {
  return process.env.NEXT_PUBLIC_ANVIL_RPC_URL || "http://127.0.0.1:8545";
}

const fallbackSponsorPk = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603c9a21c087";

export async function GET() {
  const trace = createTraceContext();
  try {
    const state = getConsoleState();
    const transactions = state.transactions;
    const totalCount = transactions.length;
    const successCount = transactions.filter((tx) => tx.status === "confirmed").length;
    const subsidizedCount = transactions.filter((tx) => tx.gasPayer === "sponsor" || tx.gasPayer === "voucher").length;
    const successRate = totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0;

    const metrics = normalizeMetrics([
      { key: "subsidyCount", label: "Subsidized actions", value: subsidizedCount },
      { key: "totalTx", label: "Total actions", value: totalCount },
      { key: "successRate", label: "Success rate", value: `${successRate}%` },
    ]);

    let sponsorAddress: Address = "0x0000000000000000000000000000000000000000";
    const sponsorPk =
      process.env.SPONSOR_PRIVATE_KEY ||
      process.env.NEXT_PUBLIC_SPONSOR_PRIVATE_KEY ||
      fallbackSponsorPk;
    sponsorAddress = privateKeyToAccount(sponsorPk as `0x${string}`).address;

    const client = createPublicClient({ transport: http(getRpcUrl()) });
    const balance = await client.getBalance({ address: sponsorAddress });
    if (!state.sponsorBaseline) {
      setSponsorBaseline(balance);
    }
    const baseline = state.sponsorBaseline ?? balance;
    const delta = balance - baseline;

    const sponsorSummary = {
      address: sponsorAddress,
      balanceDelta: formatEther(delta),
      lastTxAt: transactions[0]?.createdAt ? new Date(transactions[0].createdAt).toISOString() : null,
    };

    logRequest("console.overview", { totalCount }, trace.traceId);

    return NextResponse.json({
      subsidyEnabled: state.subsidyEnabled,
      metrics,
      sponsorSummary,
    });
  } catch (error) {
    logError("console.overview.error", { message: (error as Error).message }, trace.traceId);
    return NextResponse.json({ error: "Failed to load console overview" }, { status: 500 });
  }
}
