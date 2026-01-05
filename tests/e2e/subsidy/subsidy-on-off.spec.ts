import { test, expect } from "@playwright/test";

test.skip("subsidy on/off flows (requires real wallet + supported network)", async ({ page }) => {
  await page.goto("/console");

  const toggle = page.getByRole("button", { name: "补贴开关" });
  await expect(toggle).toBeVisible();

  await page.goto("/subsidy");
  await expect(page.getByRole("button", { name: "运行演示动作" })).toBeVisible();

  // 手工验证说明：
  // 1) 在控制台打开/关闭补贴开关。
  // 2) 回到演示页执行交易，观察支付方与提示变化。
});
