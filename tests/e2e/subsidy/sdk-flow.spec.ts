import { test, expect } from "@playwright/test";

test.skip("sdk demo flow (manual wallet)", async ({ page }) => {
  await page.goto("/subsidy");

  await expect(page.getByRole("heading", { name: "活动任务" })).toBeVisible();

  // 手工验证说明：
  // 1) 连接钱包后执行演示交易。
  // 2) 通过活动任务领取消费券。
  // 3) 确认控制台与演示页均通过 SDK 完成调用并展示状态。
});
