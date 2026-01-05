import { NextResponse } from "next/server";
import { encodeFunctionData } from "viem";
import { burnVoucherSchema } from "@/app/lib/validation/validators";
import { voucherAbi, voucherAddress } from "@/app/lib/contracts/voucher";
import { createTraceContext, logError, logRequest } from "@/app/lib/telemetry/logger";

export async function POST(req: Request) {
  const trace = createTraceContext();
  try {
    const body = burnVoucherSchema.parse(await req.json());
    if (!voucherAddress) {
      return NextResponse.json({ error: "Voucher contract address missing" }, { status: 400 });
    }

    const data = encodeFunctionData({
      abi: voucherAbi,
      functionName: "burn",
      args: [BigInt(body.voucherId)],
    });

    logRequest("demo.voucher.burn", { tokenId: body.voucherId }, trace.traceId);

    return NextResponse.json({
      result: "ready",
      tx: {
        to: voucherAddress,
        data,
      },
    });
  } catch (error) {
    logError("demo.voucher.burn.error", { message: (error as Error).message }, trace.traceId);
    return NextResponse.json({ error: "Failed to prepare burn" }, { status: 400 });
  }
}
