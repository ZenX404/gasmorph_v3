import { NextResponse } from "next/server";
import { createPublicClient, formatEther, http, type Address } from "viem";
import { normalizeMetrics } from "@/app/lib/console/metrics";
import { getConsoleState, setSponsorAddress, setSponsorBaseline } from "@/app/lib/console/store";
import { resolveSponsorAccount } from "@/app/lib/console/sponsor";
import { createTraceContext, logError, logRequest } from "@/app/lib/telemetry/logger";

function getRpcUrl() {
  return process.env.NEXT_PUBLIC_ANVIL_RPC_URL || "http://127.0.0.1:8545";
}

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

    const { account, configuredAddress } = resolveSponsorAccount();
    const sponsorAddress: Address = configuredAddress || account.address;

    if (state.sponsorAddress !== sponsorAddress) {
      setSponsorAddress(sponsorAddress);
      state.sponsorBaseline = undefined;
    }

    let sponsorSummary = {
      address: sponsorAddress,
      balanceDelta: formatEther(BigInt(0)),
      lastTxAt: transactions[0]?.createdAt ? new Date(transactions[0].createdAt).toISOString() : null,
    };

    try {
      const client = createPublicClient({ transport: http(getRpcUrl()) });
      const balance = await client.getBalance({ address: sponsorAddress });
      if (!state.sponsorBaseline) {
        setSponsorBaseline(balance);
      }
      const baseline = state.sponsorBaseline ?? balance;
      const delta = balance - baseline;
      sponsorSummary = {
        address: sponsorAddress,
        balanceDelta: formatEther(delta),
        lastTxAt: transactions[0]?.createdAt ? new Date(transactions[0].createdAt).toISOString() : null,
      };
    } catch (error) {
      logError("console.overview.rpc.error", { message: (error as Error).message }, trace.traceId);
    }

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
