import type { Activity } from "./types";
import type { ActivityErrorCode } from "./errors";
import { isActivityClaimed } from "./store";

export function getClaimError(
  activity: Activity | null | undefined,
  wallet: string,
  now = Date.now(),
): ActivityErrorCode | null {
  if (!activity || activity.status === "deleted") return "activity_not_found";

  if (isActivityClaimed(activity.id, wallet)) return "already_claimed";

  if (activity.status === "paused") return "activity_paused";
  if (activity.status === "ended") return "activity_ended";

  if (now < activity.startsAt) return "invalid_activity";
  if (now > activity.endsAt) return "activity_ended";

  if (activity.remainingQuota <= 0) return "quota_exhausted";

  return null;
}
