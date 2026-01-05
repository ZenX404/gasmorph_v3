import { test, expect } from "@playwright/test";

test.skip("check-in reset (local demo only)", async ({ page }) => {
  await page.goto("/console");

  await expect(page.getByRole("button", { name: "连接钱包" })).toBeVisible();
  await expect(page.getByRole("button", { name: "重置签到" })).toBeVisible();

  // 手工验证说明（仅本地演示）：
  // 1) 完成一次签到后，进入控制台点击“重置签到”。
  // 2) 显示“已重置签到记录，可重新领取”提示。
  // 3) 回到演示页再次点击“领取每日消费券”，可以再次领取。
});
