import { clearCheckIns, hasCheckedIn, recordCheckIn } from "../../app/lib/voucher/checkinStore";

describe("check-in store", () => {
  beforeEach(() => {
    clearCheckIns();
  });

  it("clears a specific wallet/day record", () => {
    recordCheckIn({ wallet: "0xabc", dayKey: "2026-01-01", voucherId: "0x1", createdAt: 1 });
    recordCheckIn({ wallet: "0xdef", dayKey: "2026-01-01", voucherId: "0x2", createdAt: 2 });
    expect(hasCheckedIn("0xabc", "2026-01-01")).toBe(true);

    const removed = clearCheckIns({ wallet: "0xabc", dayKey: "2026-01-01" });
    expect(removed).toBe(1);
    expect(hasCheckedIn("0xabc", "2026-01-01")).toBe(false);
    expect(hasCheckedIn("0xdef", "2026-01-01")).toBe(true);
  });

  it("clears all records when no params provided", () => {
    recordCheckIn({ wallet: "0xabc", dayKey: "2026-01-01", voucherId: "0x1", createdAt: 1 });
    recordCheckIn({ wallet: "0xdef", dayKey: "2026-01-01", voucherId: "0x2", createdAt: 2 });
    const removed = clearCheckIns();
    expect(removed).toBe(2);
    expect(hasCheckedIn("0xabc", "2026-01-01")).toBe(false);
    expect(hasCheckedIn("0xdef", "2026-01-01")).toBe(false);
  });
});
