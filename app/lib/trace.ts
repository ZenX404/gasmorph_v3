import { randomUUID } from "crypto";

export function createTraceId() {
  try {
    return randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  }
}
