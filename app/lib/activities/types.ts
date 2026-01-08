import type { VoucherKind } from "../voucher/types";

export type ActivityStatus = "draft" | "active" | "paused" | "ended" | "deleted";

export type Activity = {
  id: string;
  name: string;
  startsAt: number;
  endsAt: number;
  voucherType: VoucherKind;
  totalQuota: number;
  remainingQuota: number;
  status: ActivityStatus;
  createdAt: number;
  updatedAt: number;
};

export type ActivityInput = {
  name: string;
  startsAt: number;
  endsAt: number;
  voucherType: VoucherKind;
  totalQuota: number;
};

export type ActivityClaimRecord = {
  activityId: string;
  wallet: string;
  claimedAt: number;
  voucherId: string;
};
