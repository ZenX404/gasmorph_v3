export type VoucherKind = "single" | "time_window_1m" | "time_window_2h" | "time_window_7d";

export type VoucherStatus = "available" | "used" | "expired" | "burned";

// 说明: 统一管理券类型与展示文案，便于后续扩展。
export const voucherTypeLabels: Record<VoucherKind, string> = {
  single: "单次抵扣券",
  time_window_1m: "1 分钟全额抵扣",
  time_window_2h: "2 小时全额抵扣",
  time_window_7d: "7 天全额抵扣",
};

export const voucherDurationsSec: Record<Exclude<VoucherKind, "single">, number> = {
  time_window_1m: 60,
  time_window_2h: 2 * 60 * 60,
  time_window_7d: 7 * 24 * 60 * 60,
};

export const voucherKindOrder: VoucherKind[] = [
  "single",
  "time_window_1m",
  "time_window_2h",
  "time_window_7d",
];

export type VoucherToken = {
  tokenId: bigint;
  kind: VoucherKind;
  owner: `0x${string}`;
  status: VoucherStatus;
  issuedAt: number;
  expiresAt?: number;
  usesRemaining: number | "unlimited";
};
