import { GET, PUT } from "@/app/api/console/project-config/route";

async function readJson(res: Response) {
  return res.json() as Promise<Record<string, unknown>>;
}

describe("project config API", () => {
  it("updates and reads config", async () => {
    const putRes = await PUT(
      new Request("http://localhost/api/console/project-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subsidyAccount: { address: "0x0000000000000000000000000000000000000004", note: "demo" },
          checkInEnabled: true,
          sponsorPrivateKey: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603c9a21c087",
        }),
      }),
    );

    expect(putRes.status).toBe(200);
    const putBody = await readJson(putRes);
    expect(putBody.result).toBe("success");

    const getRes = await GET();
    expect(getRes.status).toBe(200);
    const getBody = await readJson(getRes);
    expect(getBody.checkInEnabled).toBe(true);
    expect(getBody.sponsorPrivateKey).toBeUndefined();
  });

  it("rejects sensitive fields", async () => {
    const res = await PUT(
      new Request("http://localhost/api/console/project-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subsidyAccount: { address: "0x0000000000000000000000000000000000000005" },
          privateKey: "0xabc",
        }),
      }),
    );

    expect(res.status).toBe(400);
    const body = await readJson(res);
    expect(body.error).toBe("Invalid project config");
  });
});
