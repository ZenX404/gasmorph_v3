import { test, expect } from "@playwright/test";

test.skip("activity create + claim flow (manual wallet)", async ({ page }) => {
  await page.goto("/console");
  await expect(page.getByRole("heading", { name: "活动管理" })).toBeVisible();

  // 手工验证说明：
  // 1) 创建活动（名称/时间/券类型/总量）。
  // 2) 切换到 /subsidy，连接钱包。
  // 3) 在活动任务区点击“完成活动”，确认券已发放并显示。
});
