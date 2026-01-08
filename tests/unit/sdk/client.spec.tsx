import { GasMorphClient } from "@gasmorph/sdk";

describe("sdk client", () => {
  it("throws API error message", async () => {
    const fetcher = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Bad request" }),
    });
    const client = new GasMorphClient({ baseUrl: "http://localhost", fetcher });

    await expect(client.getOverview()).rejects.toThrow("Bad request");
  });

  it("builds request with baseUrl", async () => {
    const fetcher = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ subsidyEnabled: true }),
    });
    const client = new GasMorphClient({ baseUrl: "http://localhost", fetcher });

    await client.getOverview();

    expect(fetcher).toHaveBeenCalledWith(
      "http://localhost/api/console/overview",
      expect.objectContaining({
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      }),
    );
  });
});
