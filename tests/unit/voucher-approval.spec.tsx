import { isVoucherApprovalRequired, shouldBlockVoucherExecution } from "../../app/lib/voucher/approval";

describe("voucher approval helpers", () => {
  it("flags approval required when voucher applied and sponsor known", () => {
    expect(
      isVoucherApprovalRequired({
        voucherApplied: true,
        voucherApproved: false,
        sponsorAddress: "0x0000000000000000000000000000000000000001",
      }),
    ).toBe(true);
  });

  it("does not require approval when already approved", () => {
    expect(
      isVoucherApprovalRequired({
        voucherApplied: true,
        voucherApproved: true,
        sponsorAddress: "0x0000000000000000000000000000000000000001",
      }),
    ).toBe(false);
  });

  it("blocks execution when approval is missing", () => {
    expect(shouldBlockVoucherExecution({ voucherApplied: true, voucherApproved: false })).toBe(true);
  });

  it("allows execution when voucher not applied", () => {
    expect(shouldBlockVoucherExecution({ voucherApplied: false, voucherApproved: false })).toBe(false);
  });
});
