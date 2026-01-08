import { NextResponse } from "next/server";
import { activityCreateSchema } from "@/app/lib/validation/validators";
import {
  createActivity,
  listActivities,
  normalizeActivityStatus,
} from "@/app/lib/activities/store";
import type { VoucherKind } from "@/app/lib/voucher/types";
import { createTraceContext, logError, logRequest } from "@/app/lib/telemetry/logger";

export async function GET() {
  const trace = createTraceContext();
  try {
    const items = listActivities().map((activity) => normalizeActivityStatus(activity));
    logRequest("console.activities.list", { count: items.length }, trace.traceId);
    return NextResponse.json({ items });
  } catch (error) {
    logError("console.activities.list.error", { message: (error as Error).message }, trace.traceId);
    return NextResponse.json({ error: "Failed to load activities" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const trace = createTraceContext();
  try {
    const body = activityCreateSchema.parse(await req.json());
    if (body.endsAt <= body.startsAt) {
      return NextResponse.json({ error: "Invalid activity time range" }, { status: 400 });
    }
    const activity = createActivity({ ...body, voucherType: body.voucherType as VoucherKind });
    logRequest("console.activities.create", { id: activity.id }, trace.traceId);
    return NextResponse.json({ item: activity });
  } catch (error) {
    logError("console.activities.create.error", { message: (error as Error).message }, trace.traceId);
    return NextResponse.json({ error: "Failed to create activity" }, { status: 400 });
  }
}
