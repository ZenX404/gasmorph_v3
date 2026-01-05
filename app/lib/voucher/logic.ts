import { voucherDurationsSec, voucherKindOrder, type VoucherKind, type VoucherToken } from "./types";

export type VoucherChainData = {
  tokenId: bigint;
  owner: `0x${string}`;
  kindIndex: number;
  issuedAt: number;
  durationSeconds: number;
  usesRemaining: number;
};

const voucherKindMap: VoucherKind[] = [
  "single",
  "time_window_1m",
  "time_window_2h",
  "time_window_7d",
];

// 说明: 将链上数据转换为前端可用结构。
export function normalizeVoucher(raw: VoucherChainData, nowMs = Date.now()): VoucherToken {
  const kind = voucherKindMap[raw.kindIndex] ?? "single";
  const issuedAtMs = raw.issuedAt * 1000;
  const durationSec = raw.durationSeconds || (kind === "single" ? 0 : voucherDurationsSec[kind]);
  const expiresAt = kind === "single" ? undefined : issuedAtMs + durationSec * 1000;

  const usesRemaining = kind === "single" ? Math.max(raw.usesRemaining, 0) : "unlimited";

  const status = resolveVoucherStatus({ kind, expiresAt, usesRemaining, nowMs });

  return {
    tokenId: raw.tokenId,
    kind,
    owner: raw.owner,
    issuedAt: issuedAtMs,
    expiresAt,
    usesRemaining,
    status,
  };
}

export function resolveVoucherStatus(params: {
  kind: VoucherKind;
  expiresAt?: number;
  usesRemaining: number | "unlimited";
  nowMs?: number;
}): VoucherToken["status"] {
  const nowMs = params.nowMs ?? Date.now();
  if (params.kind !== "single" && params.expiresAt && params.expiresAt <= nowMs) {
    return "expired";
  }
  if (params.kind === "single" && typeof params.usesRemaining === "number" && params.usesRemaining <= 0) {
    return "used";
  }
  return "available";
}

export type AggregatedVoucher = {
  kind: VoucherKind;
  totalUses: number;
  totalDurationSec: number;
  activeCount: number;
  items: VoucherToken[];
};

// 说明: 重复发券累加规则（单次券累加次数，时间段券累加时长）。
export function aggregateVouchers(tokens: VoucherToken[], nowMs = Date.now()): AggregatedVoucher[] {
  const buckets = new Map<VoucherKind, AggregatedVoucher>();

  for (const kind of voucherKindOrder) {
    buckets.set(kind, { kind, totalUses: 0, totalDurationSec: 0, activeCount: 0, items: [] });
  }

  tokens.forEach((token) => {
    const bucket = buckets.get(token.kind);
    if (!bucket) return;

    bucket.items.push(token);

    if (token.status === "available") {
      bucket.activeCount += 1;
      if (token.kind === "single" && typeof token.usesRemaining === "number") {
        bucket.totalUses += token.usesRemaining;
      } else if (token.expiresAt) {
        const remainingSec = Math.max(0, Math.floor((token.expiresAt - nowMs) / 1000));
        bucket.totalDurationSec += remainingSec;
      }
    }
  });

  return Array.from(buckets.values()).filter((bucket) => bucket.items.length > 0);
}

export function pickVoucherForUse(tokens: VoucherToken[]): VoucherToken | null {
  const available = tokens.filter((token) => token.status === "available");
  const single = available.find((token) => token.kind === "single");
  if (single) return single;

  return available.find((token) => token.kind !== "single") ?? null;
}
