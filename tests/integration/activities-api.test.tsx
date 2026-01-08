import { POST as createActivity, GET as listConsoleActivities } from "@/app/api/console/activities/route";
import { PATCH as updateActivity } from "@/app/api/console/activities/[id]/route";
import { GET as listDemoActivities } from "@/app/api/demo/activities/route";
import { POST as claimActivity } from "@/app/api/demo/activities/claim/route";
import { clearActivityState } from "@/app/lib/activities/store";

async function readJson(res: Response) {
  return res.json() as Promise<Record<string, unknown>>;
}

describe("activities API", () => {
  beforeEach(() => {
    clearActivityState();
  });

  it("creates and lists activities in console", async () => {
    const createRes = await createActivity(
      new Request("http://localhost/api/console/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "测试活动",
          startsAt: Date.now() - 1000,
          endsAt: Date.now() + 60_000,
          voucherType: "single",
          totalQuota: 3,
        }),
      }),
    );

    expect(createRes.status).toBe(200);
    const createBody = await readJson(createRes);
    expect(createBody.item).toBeDefined();

    const listRes = await listConsoleActivities();
    expect(listRes.status).toBe(200);
    const listBody = await readJson(listRes);
    expect(Array.isArray(listBody.items)).toBe(true);
    expect((listBody.items as Array<{ name: string }>)[0].name).toBe("测试活动");
  });

  it("rejects claim when activity paused", async () => {
    const createRes = await createActivity(
      new Request("http://localhost/api/console/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "暂停活动",
          startsAt: Date.now() - 1000,
          endsAt: Date.now() + 60_000,
          voucherType: "single",
          totalQuota: 1,
        }),
      }),
    );
    const createBody = await readJson(createRes);
    const id = (createBody.item as { id: string }).id;

    const updateRes = await updateActivity(
      new Request("http://localhost/api/console/activities/" + id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paused" }),
      }),
      { params: { id } },
    );

    expect(updateRes.status).toBe(200);

    const demoRes = await listDemoActivities(
      new Request(`http://localhost/api/demo/activities?wallet=0x0000000000000000000000000000000000000008`),
    );
    expect(demoRes.status).toBe(200);

    const claimRes = await claimActivity(
      new Request("http://localhost/api/demo/activities/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityId: id,
          wallet: "0x0000000000000000000000000000000000000008",
        }),
      }),
    );

    expect(claimRes.status).toBe(409);
    const claimBody = await readJson(claimRes);
    expect(claimBody.error).toBe("Activity is paused");
  });
});
