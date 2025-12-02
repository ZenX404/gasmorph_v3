import { logEvent } from "./logging";
import { createTraceId } from "./trace";

export function measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const traceId = createTraceId();
  const start = performance.now();
  return fn()
    .then((res) => {
      const cost = performance.now() - start;
      logEvent("info", name, { costMs: cost.toFixed(1) }, traceId);
      return res;
    })
    .catch((err) => {
      const cost = performance.now() - start;
      logEvent("error", name, { costMs: cost.toFixed(1), error: (err as Error).message }, traceId);
      throw err;
    });
}

type TxPhase =
  | "submit"
  | "included"
  | "confirmed"
  | "failed"
  | "fallback"
  | "user-cancel";

export function logTxPhase(name: string, phase: TxPhase, payload: Record<string, unknown> = {}) {
  const traceId = createTraceId();
  logEvent("info", `tx:${name}`, { phase, ...payload }, traceId);
}
