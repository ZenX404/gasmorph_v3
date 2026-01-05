import { NextResponse } from "next/server";
import { recordTransactionSchema } from "@/app/lib/validation/validators";
import { createTraceContext, logError, logRequest } from "@/app/lib/telemetry/logger";
import { getConsoleState, recordTransaction } from "@/app/lib/console/store";

export async function GET() {
  const trace = createTraceContext();
  try {
    const state = getConsoleState();
    logRequest("console.transactions", { count: state.transactions.length }, trace.traceId);
    return NextResponse.json({ items: state.transactions });
  } catch (error) {
    logError("console.transactions.error", { message: (error as Error).message }, trace.traceId);
    return NextResponse.json({ error: "Failed to load transactions" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const trace = createTraceContext();
  try {
    const body = recordTransactionSchema.parse(await req.json());
    recordTransaction({
      txHash: body.txHash,
      sender: body.sender,
      status: body.status,
      gasPayer: body.gasPayer,
      gasUsed: body.gasUsed ?? null,
      networkId: body.networkId ?? null,
      explorerUrl: body.explorerUrl ?? null,
      blockNumber: body.blockNumber ?? null,
      voucherId: body.voucherId ?? null,
      createdAt: body.createdAt ?? Date.now(),
    });
    logRequest("console.transactions.record", { txHash: body.txHash }, trace.traceId);
    return NextResponse.json({ result: "success" });
  } catch (error) {
    logError("console.transactions.record.error", { message: (error as Error).message }, trace.traceId);
    return NextResponse.json({ error: "Invalid transaction payload" }, { status: 400 });
  }
}
