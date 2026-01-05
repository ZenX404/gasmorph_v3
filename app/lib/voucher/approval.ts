import type { Address } from "viem";

export function isVoucherApprovalRequired(params: {
  voucherApplied: boolean;
  voucherApproved: boolean;
  sponsorAddress?: Address | null;
}) {
  return Boolean(params.voucherApplied && params.sponsorAddress && !params.voucherApproved);
}

export function shouldBlockVoucherExecution(params: { voucherApplied: boolean; voucherApproved: boolean }) {
  return params.voucherApplied && !params.voucherApproved;
}
