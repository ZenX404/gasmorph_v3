import { test, expect } from "@playwright/test";

test.skip("fallback: unsupported network / refusal / paymaster unavailable (requires real wallet)", async ({ page }) => {
  await page.goto("/subsidy");

  await expect(page.getByRole("button", { name: "连接钱包" })).toBeVisible();
  await expect(page.getByRole("button", { name: "运行演示动作" })).toBeVisible();

  // 手工验证说明（需要真实钱包 + 不同网络环境）：
  // 1) 切到不支持网络，展示 NetworkGuardBanner 并阻断。
  // 2) 拒绝签名后，前端提示错误信息。
  // 3) Paymaster 不可用时，回退为用户自付或中断。
});
