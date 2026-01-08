import { GET as getProjectConfig } from "@/app/api/console/project-config/route";
import { GET as getConsoleActivities } from "@/app/api/console/activities/route";
import { GET as getDemoActivities } from "@/app/api/demo/activities/route";

async function measure<T>(action: () => Promise<T>) {
  const start = Date.now();
  const result = await action();
  return { result, elapsedMs: Date.now() - start };
}

describe("performance smoke", () => {
  it("responds within acceptable latency", async () => {
    const { result: configRes, elapsedMs: configMs } = await measure(() => getProjectConfig());
    expect(configRes.status).toBe(200);
    expect(configMs).toBeLessThan(1000);

    const { result: consoleRes, elapsedMs: consoleMs } = await measure(() => getConsoleActivities());
    expect(consoleRes.status).toBe(200);
    expect(consoleMs).toBeLessThan(1000);

    const demoReq = new Request(
      "http://localhost/api/demo/activities?wallet=0x0000000000000000000000000000000000000001",
    );
    const { result: demoRes, elapsedMs: demoMs } = await measure(() => getDemoActivities(demoReq));
    expect(demoRes.status).toBe(200);
    expect(demoMs).toBeLessThan(1000);
  });
});
