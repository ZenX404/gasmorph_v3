export type ActivityErrorCode =
  | "activity_not_found"
  | "activity_paused"
  | "activity_ended"
  | "quota_exhausted"
  | "already_claimed"
  | "invalid_activity"
  | "checkin_disabled";

const errorMessages: Record<ActivityErrorCode, string> = {
  activity_not_found: "Activity not found",
  activity_paused: "Activity is paused",
  activity_ended: "Activity has ended",
  quota_exhausted: "Activity quota exhausted",
  already_claimed: "Activity already claimed",
  invalid_activity: "Invalid activity",
  checkin_disabled: "Daily check-in disabled",
};

export function getActivityErrorMessage(code: ActivityErrorCode) {
  return errorMessages[code] ?? "Activity error";
}
