import { NextResponse } from "next/server";
import { activityUpdateSchema } from "@/app/lib/validation/validators";
import { deleteActivity, getActivityById, normalizeActivityStatus, updateActivity } from "@/app/lib/activities/store";
import { createTraceContext, logError, logRequest } from "@/app/lib/telemetry/logger";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function PATCH(req: Request, context: RouteContext) {
  const trace = createTraceContext();
  try {
    const { id } = await context.params;
    const body = activityUpdateSchema.parse(await req.json());
    if (body.startsAt !== undefined && body.endsAt !== undefined && body.endsAt <= body.startsAt) {
      return NextResponse.json({ error: "Invalid activity time range" }, { status: 400 });
    }

    const updated = updateActivity(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    const normalized = normalizeActivityStatus(updated);
    logRequest("console.activities.update", { id: normalized.id }, trace.traceId);
    return NextResponse.json({ item: normalized });
  } catch (error) {
    logError("console.activities.update.error", { message: (error as Error).message }, trace.traceId);
    return NextResponse.json({ error: "Failed to update activity" }, { status: 400 });
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  const trace = createTraceContext();
  try {
    const { id } = await context.params;
    const current = getActivityById(id);
    if (!current) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }
    const updated = deleteActivity(id);
    if (!updated) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }
    logRequest("console.activities.delete", { id: updated.id }, trace.traceId);
    return NextResponse.json({ item: updated });
  } catch (error) {
    logError("console.activities.delete.error", { message: (error as Error).message }, trace.traceId);
    return NextResponse.json({ error: "Failed to delete activity" }, { status: 400 });
  }
}
