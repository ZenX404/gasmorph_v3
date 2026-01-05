export type ConsoleMetric = {
  key: string;
  label: string;
  value: string;
  trend?: "up" | "down" | "flat";
  delta?: string;
};

// 说明: 控制台指标适配层，便于后续新增指标。
export function normalizeMetrics(metrics: Array<{ key: string; label: string; value: string | number }>): ConsoleMetric[] {
  const labelMap: Record<string, string> = {
    subsidyCount: "补贴覆盖动作",
    totalTx: "总动作数",
    successRate: "成功率",
  };

  return metrics.map((metric) => ({
    key: metric.key,
    label: labelMap[metric.key] ?? metric.label,
    value: typeof metric.value === "number" ? metric.value.toString() : metric.value,
  }));
}
