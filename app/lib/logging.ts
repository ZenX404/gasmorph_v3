import { createTraceId } from "./trace";

type LogLevel = "info" | "warn" | "error";

// 结构化日志，后续可接入远程日志服务
export function logEvent(level: LogLevel, event: string, payload?: object, traceId?: string) {
  const entry = {
    ts: new Date().toISOString(),
    traceId: traceId || createTraceId(),
    level,
    event,
    ...payload,
  };
  console[level === "error" ? "error" : level](entry);
}

export function logWalletState(event: string, data: object, traceId?: string) {
  logEvent("info", event, data, traceId);
}
