import { test, expect } from "@playwright/test";

test("wallet connect button and subsidy toggle present", async ({ page }) => {
  await page.goto("/");

  // 连接按钮存在
  await expect(page.getByRole("button", { name: "连接钱包" })).toBeVisible();

  // 补贴开关存在并可切换
  const toggle = page.getByRole("button", { name: "Gas 补贴开关" });
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
});
