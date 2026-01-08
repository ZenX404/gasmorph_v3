const cacheKey = "gasmorph.projectConfig";
const cacheEvent = "gasmorph:project-config";

export type ProjectConfigCache = {
  subsidyAccount: { address: string; note?: string } | null;
  checkInEnabled: boolean;
  updatedAt: number;
};

export function readProjectConfigCache(): ProjectConfigCache | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(cacheKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProjectConfigCache;
    if (typeof parsed?.checkInEnabled !== "boolean") return null;
    if (typeof parsed?.updatedAt !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeProjectConfigCache(value: ProjectConfigCache) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(cacheKey, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(cacheEvent, { detail: value }));
  } catch {
    // 忽略缓存写入失败
  }
}

export function subscribeProjectConfigCache(listener: (value: ProjectConfigCache) => void) {
  if (typeof window === "undefined") return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== cacheKey || !event.newValue) return;
    try {
      const parsed = JSON.parse(event.newValue) as ProjectConfigCache;
      if (typeof parsed?.checkInEnabled !== "boolean") return;
      listener(parsed);
    } catch {
      // ignore parse failures
    }
  };

  const handleCustom = (event: Event) => {
    const detail = (event as CustomEvent<ProjectConfigCache>).detail;
    if (!detail || typeof detail?.checkInEnabled !== "boolean") return;
    listener(detail);
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(cacheEvent, handleCustom);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(cacheEvent, handleCustom);
  };
}
