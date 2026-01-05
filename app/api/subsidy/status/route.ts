import { NextRequest } from "next/server";

const allowedNetworks = new Set([11155111, 20143, 31337]);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const opId = searchParams.get("opId");
  const networkId = Number(searchParams.get("networkId"));
  const isSubsidized = searchParams.get("isSubsidized") === "true";

  if (!opId || !networkId) {
    return Response.json({ error: "missing params" }, { status: 400 });
  }
  if (!allowedNetworks.has(networkId)) {
    return Response.json({ error: "unsupported network" }, { status: 400 });
  }

  const fakeHash = `0x${opId.replace(/-/g, "").padEnd(64, "0").slice(0, 64)}`;
  const gasPayer = isSubsidized ? "sponsor" : "user";

  return Response.json(
    {
      opId,
      networkId,
      status: "confirmed",
      txHash: fakeHash,
      blockNumber: 0,
      gasUsed: null,
      gasPayer,
      explorerUrl: null,
      failureReason: null,
    },
    { status: 200 },
  );
}
