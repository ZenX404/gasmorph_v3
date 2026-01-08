import { getProjectConfig, updateProjectConfig } from "@/app/lib/console/projectConfigStore";

describe("project config store", () => {
  it("updates subsidy account and check-in toggle", () => {
    const initial = getProjectConfig();
    expect(initial.checkInEnabled).toBe(true);

    const updated = updateProjectConfig({
      subsidyAccount: { address: "0x0000000000000000000000000000000000000001", note: "demo" },
      checkInEnabled: false,
      sponsorPrivateKey: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603c9a21c087",
    });

    expect(updated.subsidyAccount?.address).toBe("0x0000000000000000000000000000000000000001");
    expect(updated.subsidyAccount?.note).toBe("demo");
    expect(updated.checkInEnabled).toBe(false);
    expect(updated.sponsorPrivateKey).toBe("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603c9a21c087");
  });
});
