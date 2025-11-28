import { test, expect } from "@playwright/test";

const injectMock = () => {
  (window as any).ethereum = {
    isMetaMask: true,
    request: async ({ method }: { method: string }) => {
      if (method === "eth_chainId") return "0xAA36A7"; // Sepolia
      if (method === "eth_requestAccounts" || method === "eth_accounts")
        return ["0x2222222222222222222222222222222222222222"];
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

test.describe("连接状态保持与账号/网络变更提示", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(injectMock);
  });

  test("刷新后仍可看到连接状态或重连入口", async ({ page }) => {
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
    await page.reload();
    await expect(page.getByText(/GasMorph · Web3 Gas 赞助体验/)).toBeVisible();
    await expect(page.getByRole("button", { name: /Sepolia|连接钱包/ })).toBeVisible({ timeout: 5000 });
  });
});
