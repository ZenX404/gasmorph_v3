import { NextRequest } from "next/server";
import crypto from "crypto";

const allowedNetworks = new Set([11155111, 20143, 31337]);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { networkId, account, isSubsidized, mode, action } = body || {};

  if (!networkId || !account || !mode || !action) {
    return Response.json({ error: "missing params" }, { status: 400 });
  }
  if (!allowedNetworks.has(Number(networkId))) {
    return Response.json({ error: "unsupported network" }, { status: 400 });
  }

  const opId = crypto.randomUUID();

  return Response.json(
    {
      opId,
      mode,
      isSubsidized,
      action,
      networkId,
      status: "pending",
    },
    { status: 200 },
  );
}
