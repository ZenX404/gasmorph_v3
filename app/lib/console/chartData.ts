import type { ConsoleTransaction } from "./store";

export type ConsoleChartPoint = {
  label: string;
  value: number;
};

export type ConsoleChartSeries = {
  id: string;
  label: string;
  points: ConsoleChartPoint[];
};

export function buildConsoleTrendSeries(
  transactions: ConsoleTransaction[],
  hours = 6,
  nowMs = Date.now(),
): ConsoleChartSeries[] {
  const bucketMs = 60 * 60 * 1000;
  const clampedHours = Math.max(3, Math.min(hours, 24));
  const now = new Date(nowMs);
  now.setMinutes(0, 0, 0);
  const end = now.getTime();
  const start = end - bucketMs * (clampedHours - 1);

  const buckets = Array.from({ length: clampedHours }, (_, idx) => {
    const ts = start + idx * bucketMs;
    const label = new Date(ts).toLocaleTimeString([], { hour: "2-digit", hour12: false });
    return { label, total: 0, covered: 0 };
  });

  transactions.forEach((tx) => {
    if (tx.createdAt < start || tx.createdAt > end + bucketMs) return;
    const bucketIndex = Math.floor((tx.createdAt - start) / bucketMs);
    const bucket = buckets[bucketIndex];
    if (!bucket) return;
    bucket.total += 1;
    if (tx.gasPayer === "sponsor" || tx.gasPayer === "voucher") {
      bucket.covered += 1;
    }
  });

  return [
    {
      id: "total",
      label: "总动作数",
      points: buckets.map((bucket) => ({ label: bucket.label, value: bucket.total })),
    },
    {
      id: "covered",
      label: "补贴覆盖",
      points: buckets.map((bucket) => ({ label: bucket.label, value: bucket.covered })),
    },
  ];
}
