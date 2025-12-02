import { test, expect } from "@playwright/test";

test.skip("subsidy on/off flows (requires real wallet + supported network)", async ({ page }) => {
  await page.goto("/");

  // 连接按钮存在
  await expect(page.getByRole("button", { name: "连接钱包" })).toBeVisible();

  // 补贴开关存在
  const toggle = page.getByRole("button", { name: "Gas 补贴开关" });
  await expect(toggle).toBeVisible();

  // 示范操作按钮存在
  await expect(page.getByRole("button", { name: "执行操作" })).toBeVisible();

  // 说明：完整链上验证需在已连接的钱包与受支持网络下执行，人工或 CI 配置后再移除 skip。
});
