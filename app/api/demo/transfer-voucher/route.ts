import { NextResponse } from "next/server";
import { encodeFunctionData } from "viem";
import { transferVoucherSchema } from "@/app/lib/validation/validators";
import { voucherAbi, voucherAddress } from "@/app/lib/contracts/voucher";
import { createTraceContext, logError, logRequest } from "@/app/lib/telemetry/logger";

export async function POST(req: Request) {
  const trace = createTraceContext();
  try {
    const body = transferVoucherSchema.parse(await req.json());
    if (!voucherAddress) {
      return NextResponse.json({ error: "Voucher contract address missing" }, { status: 400 });
    }

    const data = encodeFunctionData({
      abi: voucherAbi,
      functionName: "transferFrom",
      args: [body.from as `0x${string}`, body.to as `0x${string}`, BigInt(body.voucherId)],
    });

    logRequest("demo.voucher.transfer", { tokenId: body.voucherId, to: body.to }, trace.traceId);

    return NextResponse.json({
      result: "ready",
      tx: {
        to: voucherAddress,
        data,
      },
    });
  } catch (error) {
    logError("demo.voucher.transfer.error", { message: (error as Error).message }, trace.traceId);
    return NextResponse.json({ error: "Failed to prepare transfer" }, { status: 400 });
  }
}
