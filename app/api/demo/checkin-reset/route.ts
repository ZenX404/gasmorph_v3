import { NextResponse } from "next/server";
import { checkInSchema } from "@/app/lib/validation/validators";
import { clearCheckIns } from "@/app/lib/voucher/checkinStore";
import { getShanghaiDayKey } from "@/app/lib/voucher/time";
import { createTraceContext, logError, logRequest } from "@/app/lib/telemetry/logger";

export async function POST(req: Request) {
  const trace = createTraceContext();
  try {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Check-in reset is disabled in production" }, { status: 403 });
    }

    const body = checkInSchema.parse(await req.json());
    const dayKey = getShanghaiDayKey();
    const removed = clearCheckIns({ wallet: body.wallet, dayKey });

    logRequest("demo.checkin.reset", { wallet: body.wallet, dayKey, removed }, trace.traceId);
    return NextResponse.json({ result: "success", removed, dayKey });
  } catch (error) {
    logError("demo.checkin.reset.error", { message: (error as Error).message }, trace.traceId);
    return NextResponse.json({ error: "Failed to reset check-in" }, { status: 400 });
  }
}
