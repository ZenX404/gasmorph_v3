import { createTraceId } from "./trace";

type LogLevel = "info" | "warn" | "error";

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
