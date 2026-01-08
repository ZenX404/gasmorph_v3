import { updateProjectConfig } from "@/app/lib/console/projectConfigStore";
import { POST } from "@/app/api/demo/checkin/route";

describe("check-in toggle enforcement", () => {
  it("returns error when check-in disabled", async () => {
    updateProjectConfig({ checkInEnabled: false });

    const res = await POST(
      new Request("http://localhost/api/demo/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: "0x0000000000000000000000000000000000000006" }),
      }),
    );

    expect(res.status).toBe(403);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.error).toBe("Daily check-in disabled");
  });
});
