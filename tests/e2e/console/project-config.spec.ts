import { test, expect } from "@playwright/test";

test("console project config toggles check-in", async ({ page }) => {
  await page.goto("/console");

  const addressInput = page.getByPlaceholder("输入补贴扣费账户地址");
  await addressInput.fill("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");

  const privateKeyInput = page.getByPlaceholder("可不包含 0x，仅在当前会话用于签名");
  await privateKeyInput.fill("59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d");

  const toggle = page.getByRole("button", { name: "每日签到活动" });
  await expect(toggle).toBeVisible();
  await toggle.click();

  const saveButton = page.getByRole("button", { name: "保存配置" });
  await expect(saveButton).toBeEnabled();
  await saveButton.click();
  await expect(page.getByText("Invalid private key")).toHaveCount(0);

  await page.goto("/subsidy");
  const checkInButton = page.getByRole("button", { name: "领取每日消费券" });
  await expect(checkInButton).toBeDisabled();
});
