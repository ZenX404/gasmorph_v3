export type CheckInRecord = {
  wallet: string;
  dayKey: string;
  voucherId: string;
  createdAt: number;
};

const globalKey = "__gasmorph_checkins__";

function getState(): CheckInRecord[] {
  const globalAny = globalThis as typeof globalThis & { [key: string]: CheckInRecord[] | undefined };
  if (!globalAny[globalKey]) {
    globalAny[globalKey] = [];
  }
  return globalAny[globalKey] as CheckInRecord[];
}

// 说明: 演示环境的签到记录，仅保存在内存中。
export function hasCheckedIn(wallet: string, dayKey: string): boolean {
  return getState().some((record) => record.wallet === wallet && record.dayKey === dayKey);
}

export function recordCheckIn(record: CheckInRecord) {
  const state = getState();
  state.unshift(record);
}

// 说明: 清理签到记录（用于本地演示重置）。
export function clearCheckIns(params?: { wallet?: string; dayKey?: string }) {
  const state = getState();
  const wallet = params?.wallet;
  const dayKey = params?.dayKey;
  let remaining: CheckInRecord[] = [];

  if (!wallet && !dayKey) {
    remaining = [];
  } else {
    remaining = state.filter((record) => {
      if (wallet && dayKey) return !(record.wallet === wallet && record.dayKey === dayKey);
      if (wallet) return record.wallet !== wallet;
      if (dayKey) return record.dayKey !== dayKey;
      return true;
    });
  }

  const removed = state.length - remaining.length;
  state.length = 0;
  state.push(...remaining);
  return removed;
}
