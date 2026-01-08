import { projectConfigSchema } from "@/app/lib/validation/validators";

describe("project config validators", () => {
  it("rejects sensitive fields", () => {
    const result = projectConfigSchema.safeParse({
      subsidyAccount: { address: "0x0000000000000000000000000000000000000002" },
      checkInEnabled: true,
      privateKey: "0xabc",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid config", () => {
    const result = projectConfigSchema.safeParse({
      subsidyAccount: { address: "0x0000000000000000000000000000000000000003", note: "demo" },
      checkInEnabled: false,
    });
    expect(result.success).toBe(true);
  });

  it("accepts sponsor private key", () => {
    const result = projectConfigSchema.safeParse({
      subsidyAccount: { address: "0x0000000000000000000000000000000000000006" },
      sponsorPrivateKey: "59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603c9a21c087",
    });
    expect(result.success).toBe(true);
  });
});
