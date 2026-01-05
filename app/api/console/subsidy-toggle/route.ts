import { NextResponse } from "next/server";
import { toggleSchema } from "@/app/lib/validation/validators";
import { createTraceContext, logError, logRequest } from "@/app/lib/telemetry/logger";
import { setSubsidyEnabled } from "@/app/lib/console/store";

export async function POST(req: Request) {
  const trace = createTraceContext();
  try {
    const body = toggleSchema.parse(await req.json());
    setSubsidyEnabled(body.enabled);
    logRequest("console.subsidy.toggle", { enabled: body.enabled }, trace.traceId);
    return NextResponse.json({ enabled: body.enabled, updatedAt: new Date().toISOString() });
  } catch (error) {
    logError("console.subsidy.toggle.error", { message: (error as Error).message }, trace.traceId);
    return NextResponse.json({ error: "Invalid subsidy toggle request" }, { status: 400 });
  }
}
