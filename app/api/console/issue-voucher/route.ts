import { NextResponse } from "next/server";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { issueVoucherSchema } from "@/app/lib/validation/validators";
import { voucherAbi, voucherAddress } from "@/app/lib/contracts/voucher";
import { createTraceContext, logError, logRequest } from "@/app/lib/telemetry/logger";
import { recordIssuedVoucher } from "@/app/lib/console/store";
import { voucherKindOrder, type VoucherKind } from "@/app/lib/voucher/types";

function getRpcUrl() {
  return process.env.NEXT_PUBLIC_ANVIL_RPC_URL || "http://127.0.0.1:8545";
}

function resolveKindIndex(kind: VoucherKind) {
  return voucherKindOrder.indexOf(kind);
}

const fallbackSponsorPk = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603c9a21c087";

export async function POST(req: Request) {
  const trace = createTraceContext();
  try {
    const body = issueVoucherSchema.parse(await req.json());
    if (!voucherAddress) {
      return NextResponse.json({ error: "Voucher contract address missing" }, { status: 400 });
    }

    const sponsorPk =
      process.env.SPONSOR_PRIVATE_KEY ||
      process.env.NEXT_PUBLIC_SPONSOR_PRIVATE_KEY ||
      fallbackSponsorPk;

    const account = privateKeyToAccount(sponsorPk as `0x${string}`);
    const client = createWalletClient({
      account,
      transport: http(getRpcUrl()),
    });

    const kindIndex = resolveKindIndex(body.type as VoucherKind);
    if (kindIndex < 0) {
      return NextResponse.json({ error: "Unsupported voucher type" }, { status: 400 });
    }

    const hash = await client.writeContract({
      address: voucherAddress,
      abi: voucherAbi,
      functionName: "issueVoucher",
      args: [body.target as `0x${string}`, kindIndex],
      chain: null,
    });

    const publicClient = createPublicClient({ transport: http(getRpcUrl()) });
    await publicClient.waitForTransactionReceipt({ hash });

    recordIssuedVoucher({
      target: body.target,
      type: body.type,
      issuedAt: Date.now(),
      voucherId: hash,
    });

    logRequest("console.voucher.issue", { target: body.target, kind: body.type, hash }, trace.traceId);

    return NextResponse.json({ result: "success", voucherId: hash, issuedAt: new Date().toISOString() });
  } catch (error) {
    logError("console.voucher.issue.error", { message: (error as Error).message }, trace.traceId);
    return NextResponse.json({ error: "Failed to issue voucher" }, { status: 400 });
  }
}
