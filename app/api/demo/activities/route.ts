import { NextResponse } from "next/server";
import { addressSchema } from "@/app/lib/validation/validators";
import { getClaimError } from "@/app/lib/activities/claimRules";
import {
  isActivityClaimed,
  listActivities,
  normalizeActivityStatus,
} from "@/app/lib/activities/store";
import { createTraceContext, logError, logRequest } from "@/app/lib/telemetry/logger";

export async function GET(req: Request) {
  const trace = createTraceContext();
  try {
    const url = new URL(req.url);
    const walletParam = url.searchParams.get("wallet");
    const wallet = walletParam ? addressSchema.parse(walletParam) : null;

    const items = listActivities()
      .map((activity) => normalizeActivityStatus(activity))
      .filter((activity) => activity.status !== "deleted")
      .map((activity) => {
        if (!wallet) {
          return {
            ...activity,
            claimed: false,
            claimable: false,
            claimError: null,
          };
        }

        const claimError = getClaimError(activity, wallet);
        return {
          ...activity,
          claimed: isActivityClaimed(activity.id, wallet),
          claimable: !claimError,
          claimError,
        };
      });

    logRequest("demo.activities.list", { count: items.length }, trace.traceId);
    return NextResponse.json({ items });
  } catch (error) {
    logError("demo.activities.list.error", { message: (error as Error).message }, trace.traceId);
    return NextResponse.json({ error: "Failed to load activities" }, { status: 400 });
  }
}
