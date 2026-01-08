export type ProjectConfig = {
  subsidyAccount: {
    address: string;
    note?: string;
  } | null;
  checkInEnabled: boolean;
  sponsorPrivateKey?: string | null;
  updatedAt: number;
};

const globalKey = "__gasmorph_project_config__";

function getState(): ProjectConfig {
  const globalAny = globalThis as typeof globalThis & { [key: string]: ProjectConfig | undefined };
  if (!globalAny[globalKey]) {
    globalAny[globalKey] = {
      subsidyAccount: null,
      checkInEnabled: true,
      sponsorPrivateKey: null,
      updatedAt: Date.now(),
    };
  }
  return globalAny[globalKey] as ProjectConfig;
}

// 说明: 控制台项目配置仅保存在内存中，用于演示。
export function getProjectConfig(): ProjectConfig {
  return getState();
}

export function updateProjectConfig(update: Partial<ProjectConfig>): ProjectConfig {
  const state = getState();
  const next: ProjectConfig = {
    ...state,
    ...update,
    updatedAt: Date.now(),
  };
  (globalThis as typeof globalThis & { [key: string]: ProjectConfig })[globalKey] = next;
  return next;
}
