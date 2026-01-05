import { test, expect } from "@playwright/test";

test("console subsidy toggle present", async ({ page }) => {
  await page.goto("/console");

  const toggle = page.getByRole("button", { name: "补贴开关" });
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
});
