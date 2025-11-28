type LogLevel = "info" | "warn" | "error";

// 说明：用于统一的结构化日志，后续可接入远程日志服务。
export function logEvent(level: LogLevel, event: string, payload?: object) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    event,
    ...payload,
  };
  // 目前打印到控制台，后续可替换为远程上报。
  // eslint-disable-next-line no-console
  console[level === "error" ? "error" : level](entry);
}

export function logWalletState(event: string, data: object) {
  logEvent("info", event, data);
}
