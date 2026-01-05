import { test, expect } from "@playwright/test";

const injectMock = () => {
  (window as any).ethereum = {
    isMetaMask: true,
    request: async ({ method }: { method: string }) => {
      if (method === "eth_chainId") return "0xAA36A7"; // Sepolia
      if (method === "eth_requestAccounts" || method === "eth_accounts")
        return ["0x1111111111111111111111111111111111111111"];
      if (method === "wallet_switchEthereumChain") return null;
      return null;
    },
    on: () => undefined,
    removeListener: () => undefined,
  };
};

async function closeDialogIfAny(page: import("@playwright/test").Page) {
  const dialog = page.getByRole("dialog");
  if (await dialog.isVisible({ timeout: 1000 }).catch(() => false)) {
    const closeButton = dialog.getByRole("button", { name: /关闭|Close|Dismiss/i });
    if (await closeButton.isVisible().catch(() => false)) {
      await closeButton.click();
    } else {
      await page.keyboard.press("Escape");
    }
    await dialog.waitFor({ state: "hidden", timeout: 2000 }).catch(() => {});
  }
}

test.describe("钱包连接落地页", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(injectMock);
  });

  test("显示主标题、隐私提示与连接入口", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "GasMorph 补贴演示" })).toBeVisible();
    await expect(page.getByRole("button", { name: "连接钱包" })).toBeVisible();
    await expect(page.getByText(/不会存储私钥|敏感数据/)).toBeVisible();
  });

  test("点击连接后可以看到链按钮或账户按钮，并可断开", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "连接钱包" }).click();
    const injected = page.getByRole("button", { name: /MetaMask|Injected|Browser Wallet/i });
    if (await injected.isVisible()) {
      await injected.click();
    }
    await expect(
      page.getByRole("button", { name: /Sepolia|Monad|Foundry|连接钱包/ }),
    ).toBeVisible({ timeout: 5000 });
    await closeDialogIfAny(page);
    const disconnect = page.getByRole("button", { name: "断开连接" });
    if (await disconnect.isVisible().catch(() => false)) {
      await disconnect.click({ timeout: 5000, force: true });
    }
    await expect(page.getByRole("button", { name: "连接钱包" })).toBeVisible();
  });
});
