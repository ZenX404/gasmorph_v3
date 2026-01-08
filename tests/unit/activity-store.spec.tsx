import {
  clearActivityState,
  createActivity,
  decrementActivityQuota,
  listActivities,
  resolveActivityStatus,
} from "@/app/lib/activities/store";

const baseInput = {
  name: "测试活动",
  startsAt: Date.now() - 1000,
  endsAt: Date.now() + 60_000,
  voucherType: "single" as const,
  totalQuota: 5,
};

describe("activity store", () => {
  beforeEach(() => {
    clearActivityState();
  });

  it("creates activity with initial quota", () => {
    const activity = createActivity(baseInput);
    expect(activity.remainingQuota).toBe(5);
    expect(activity.status).toBe("active");
  });

  it("decrements quota", () => {
    const activity = createActivity({ ...baseInput, totalQuota: 2 });
    const updated = decrementActivityQuota(activity);
    expect(updated?.remainingQuota).toBe(1);
  });

  it("lists activities in reverse created order", () => {
    createActivity({ ...baseInput, name: "最近活动" });
    const list = listActivities();
    expect(list.length).toBeGreaterThan(0);
    expect(list[0].name).toBe("最近活动");
  });

  it("resolves ended status when quota exhausted", () => {
    const activity = createActivity({ ...baseInput, totalQuota: 1 });
    decrementActivityQuota(activity);
    const status = resolveActivityStatus({ ...activity, remainingQuota: 0 });
    expect(status).toBe("ended");
  });
});
