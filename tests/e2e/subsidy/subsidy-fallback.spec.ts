import { test, expect } from "@playwright/test";

test.skip("fallback: unsupported network / refusal / paymaster unavailable (requires real wallet)", async ({ page }) => {
  await page.goto("/");

  // UI 基本元素存在
  await expect(page.getByRole("button", { name: "连接钱包" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Gas 补贴开关" })).toBeVisible();

  // 说明：需在真实钱包和不同网络下人工验证：
  // 1) 切到不支持网络，看到 NetworkGuardBanner 并阻断。
  // 2) 拒绝签名后，前端应提示错误。
  // 3) Paymaster 不可用时，返回可读错误并回退为用户自付或中断。
});
