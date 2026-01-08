import { clearActivityState, createActivity, recordActivityClaim } from "@/app/lib/activities/store";
import { getClaimError } from "@/app/lib/activities/claimRules";

const wallet = "0x0000000000000000000000000000000000000007";

describe("activity claim rules", () => {
  beforeEach(() => {
    clearActivityState();
  });

  it("rejects when already claimed", () => {
    const activity = createActivity({
      name: "单次活动",
      startsAt: Date.now() - 1000,
      endsAt: Date.now() + 60_000,
      voucherType: "single",
      totalQuota: 1,
    });
    recordActivityClaim({
      activityId: activity.id,
      wallet,
      claimedAt: Date.now(),
      voucherId: "0xabc",
    });

    const error = getClaimError(activity, wallet);
    expect(error).toBe("already_claimed");
  });
});
