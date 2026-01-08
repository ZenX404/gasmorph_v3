import { GasMorphClient } from "@gasmorph/sdk";
import { claimActivity, listActivities } from "@gasmorph/sdk";

describe("sdk activities", () => {
  it("lists activities with wallet query", async () => {
    const fetcher = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: [] }),
    });
    const client = new GasMorphClient({ fetcher });

    await listActivities(client, "0x0000000000000000000000000000000000000009");

    expect(fetcher).toHaveBeenCalledWith(
      "/api/demo/activities?wallet=0x0000000000000000000000000000000000000009",
      expect.objectContaining({
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      }),
    );
  });

  it("claims activity", async () => {
    const fetcher = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ result: "success", voucherId: "0xabc", issuedAt: "2026-01-01T00:00:00Z" }),
    });
    const client = new GasMorphClient({ fetcher });

    const res = await claimActivity(client, {
      activityId: "act_123",
      wallet: "0x0000000000000000000000000000000000000009",
    });

    expect(res.result).toBe("success");
    expect(fetcher).toHaveBeenCalledWith(
      "/api/demo/activities/claim",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });
});
