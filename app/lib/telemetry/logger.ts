import { logEvent } from "../logging";
import { createTraceId } from "../trace";

export type TraceContext = {
  traceId: string;
};

// 说明: 为服务端与 API 路由提供统一的日志入口。
export function logRequest(event: string, payload: Record<string, unknown>, traceId?: string) {
  logEvent("info", event, payload, traceId || createTraceId());
}

export function logError(event: string, payload: Record<string, unknown>, traceId?: string) {
  logEvent("error", event, payload, traceId || createTraceId());
}

export function createTraceContext(): TraceContext {
  return { traceId: createTraceId() };
}
