import { test, expect } from "@playwright/test";

test.skip("voucher flow: check-in -> approval -> voucher-covered action (requires real wallet)", async ({ page }) => {
  await page.goto("/subsidy");

  await expect(page.getByRole("button", { name: "连接钱包" })).toBeVisible();
  await expect(page.getByRole("button", { name: "运行演示动作" })).toBeVisible();

  // 手工验证说明（需要真实钱包 + 本地链）：
  // 1) 签到领取消费券，列表中出现可用券。
  // 2) 点击“授权补贴账户”，在钱包里确认一次授权。
  // 3) 关闭补贴开关，点击“运行演示动作”，不再弹出钱包交易确认。
  // 4) 单次券被消耗后从列表消失，控制台交易记录显示“消费券”。
});
