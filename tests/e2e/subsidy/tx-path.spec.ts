import { test, expect } from "@playwright/test";

test.skip("tx path displays hash and explorer link when available (requires real wallet)", async ({ page }) => {
  await page.goto("/subsidy");

  await expect(page.getByRole("button", { name: "运行演示动作" })).toBeVisible();

  // 手工验证说明：
  // 需要真实钱包 + 受支持网络执行交易，检查 Tx Hash、ChainId 与 Explorer 链接展示。
});
