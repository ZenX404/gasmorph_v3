import { test, expect } from "@playwright/test";

test.skip("tx path displays hash and explorer link when available (requires real wallet)", async ({ page }) => {
  await page.goto("/");

  // 补贴开关与示例操作按钮存在
  await expect(page.getByRole("button", { name: "Gas 补贴开关" })).toBeVisible();
  await expect(page.getByRole("button", { name: "执行操作" })).toBeVisible();

  // 说明：需真实钱包+受支持网络后运行，检查 Tx Hash、ChainId、Explorer 链接展示。
});
