const sensitiveKeys = ["private", "secret", "mnemonic", "password", "key", "seed"];

function isSensitiveKey(key: string) {
  const lowered = key.toLowerCase();
  return sensitiveKeys.some((token) => lowered.includes(token));
}

function redactValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item));
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).map(([key, val]) => {
      if (isSensitiveKey(key)) {
        return [key, "[REDACTED]"];
      }
      return [key, redactValue(val)];
    });
    return Object.fromEntries(entries);
  }
  return value;
}

// 说明: 轻量级日志脱敏，避免敏感字段进入日志。
export function redactSensitive(payload: Record<string, unknown>) {
  return redactValue(payload) as Record<string, unknown>;
}

export function containsSensitiveKeys(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some((item) => containsSensitiveKeys(item));
  }
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).some(([key, val]) => {
      if (isSensitiveKey(key)) return true;
      return containsSensitiveKeys(val);
    });
  }
  return false;
}
