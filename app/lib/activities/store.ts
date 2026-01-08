import type { Activity, ActivityClaimRecord, ActivityInput, ActivityStatus } from "./types";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const activitiesKey = "__gasmorph_activities__";
const claimsKey = "__gasmorph_activity_claims__";
const persistEnabled =
  typeof process !== "undefined" &&
  Boolean(process.versions?.node) &&
  process.env.NODE_ENV !== "test" &&
  !process.env.JEST_WORKER_ID;
const storageFile = persistEnabled ? join(process.cwd(), ".gasmorph", "activities.json") : "";
let lastLoadedMtime = 0;

type PersistedState = {
  activities: Activity[];
  claims: ActivityClaimRecord[];
};

function readPersistedState(): PersistedState | null {
  if (!persistEnabled || !storageFile || !existsSync(storageFile)) return null;
  try {
    const raw = readFileSync(storageFile, "utf8");
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    if (!Array.isArray(parsed.activities) || !Array.isArray(parsed.claims)) return null;
    return { activities: parsed.activities, claims: parsed.claims };
  } catch {
    return null;
  }
}

function writePersistedState(state: PersistedState) {
  if (!persistEnabled || !storageFile) return;
  try {
    mkdirSync(dirname(storageFile), { recursive: true });
    writeFileSync(storageFile, JSON.stringify(state, null, 2), "utf8");
  } catch {
    // 忽略本地持久化失败。
  }
}

function syncFromDisk() {
  const globalAny = globalThis as typeof globalThis & {
    [activitiesKey]?: Activity[];
    [claimsKey]?: ActivityClaimRecord[];
  };
  if (!persistEnabled || !storageFile || !existsSync(storageFile)) return;
  try {
    const mtime = statSync(storageFile).mtimeMs;
    if (mtime <= lastLoadedMtime) return;
    const persisted = readPersistedState();
    if (!persisted) return;
    globalAny[activitiesKey] = persisted.activities;
    globalAny[claimsKey] = persisted.claims;
    lastLoadedMtime = mtime;
  } catch {
    // 忽略磁盘同步失败。
  }
}

function getActivities(): Activity[] {
  syncFromDisk();
  const globalAny = globalThis as typeof globalThis & { [key: string]: Activity[] | undefined };
  if (!globalAny[activitiesKey]) {
    globalAny[activitiesKey] = [];
  }
  return globalAny[activitiesKey] as Activity[];
}

function getClaims(): ActivityClaimRecord[] {
  syncFromDisk();
  const globalAny = globalThis as typeof globalThis & { [key: string]: ActivityClaimRecord[] | undefined };
  if (!globalAny[claimsKey]) {
    globalAny[claimsKey] = [];
  }
  return globalAny[claimsKey] as ActivityClaimRecord[];
}

function persistState() {
  if (!persistEnabled) return;
  writePersistedState({ activities: getActivities(), claims: getClaims() });
}

function generateActivityId() {
  return `act_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function listActivities(): Activity[] {
  return [...getActivities()].sort((a, b) => b.createdAt - a.createdAt);
}

export function getActivityById(id: string) {
  return getActivities().find((item) => item.id === id);
}

export function createActivity(input: ActivityInput): Activity {
  const now = Date.now();
  const activity: Activity = {
    id: generateActivityId(),
    name: input.name,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    voucherType: input.voucherType,
    totalQuota: input.totalQuota,
    remainingQuota: input.totalQuota,
    status: "active",
    createdAt: now,
    updatedAt: now,
  };
  const state = getActivities();
  state.unshift(activity);
  persistState();
  return activity;
}

export function updateActivity(id: string, patch: Partial<Pick<Activity, "status" | "startsAt" | "endsAt">>) {
  const state = getActivities();
  const idx = state.findIndex((item) => item.id === id);
  if (idx === -1) return null;
  const current = state[idx];
  const updated: Activity = {
    ...current,
    ...patch,
    updatedAt: Date.now(),
  };
  state[idx] = updated;
  persistState();
  return updated;
}

export function deleteActivity(id: string) {
  return updateActivity(id, { status: "deleted" } as Partial<Pick<Activity, "status">>);
}

export function isActivityClaimed(id: string, wallet: string) {
  return getClaims().some((record) => record.activityId === id && record.wallet === wallet);
}

export function recordActivityClaim(record: ActivityClaimRecord) {
  const claims = getClaims();
  claims.unshift(record);
  persistState();
}

    // ??????????
export function clearActivityState() {
  const activities = getActivities();
  const claims = getClaims();
  activities.length = 0;
  claims.length = 0;
  persistState();
}

export function decrementActivityQuota(activity: Activity) {
  const state = getActivities();
  const idx = state.findIndex((item) => item.id === activity.id);
  if (idx === -1) return null;
  const nextRemaining = Math.max(0, state[idx].remainingQuota - 1);
  state[idx] = {
    ...state[idx],
    remainingQuota: nextRemaining,
    updatedAt: Date.now(),
  };
  persistState();
  return state[idx];
}

export function resolveActivityStatus(activity: Activity, now = Date.now()): ActivityStatus {
  if (activity.status === "deleted") return "deleted";
  if (activity.status === "paused") return "paused";
  if (now < activity.startsAt) return "draft";
  if (now > activity.endsAt || activity.remainingQuota <= 0) return "ended";
  return "active";
}

export function normalizeActivityStatus(activity: Activity, now = Date.now()): Activity {
  const resolved = resolveActivityStatus(activity, now);
  if (resolved === activity.status) return activity;
  return updateActivity(activity.id, { status: resolved }) ?? activity;
}
