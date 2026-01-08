import { NextResponse } from "next/server";
import { createPublicClient, createWalletClient, http } from "viem";
import { issueVoucherSchema } from "@/app/lib/validation/validators";
import { voucherAbi, voucherAddress } from "@/app/lib/contracts/voucher";
import { createTraceContext, logError, logRequest } from "@/app/lib/telemetry/logger";
import { recordIssuedVoucher } from "@/app/lib/console/store";
import { voucherKindOrder, type VoucherKind } from "@/app/lib/voucher/types";
import { ensureSponsorBalance, resolveSponsorAccount } from "@/app/lib/console/sponsor";

function getRpcUrl() {
  return process.env.NEXT_PUBLIC_ANVIL_RPC_URL || "http://127.0.0.1:8545";
}

function resolveKindIndex(kind: VoucherKind) {
  return voucherKindOrder.indexOf(kind);
}

export async function POST(req: Request) {
  const trace = createTraceContext();
  try {
    const body = issueVoucherSchema.parse(await req.json());
    if (!voucherAddress) {
      return NextResponse.json({ error: "Voucher contract address missing" }, { status: 400 });
    }

    const { account, matchesConfig } = resolveSponsorAccount();
    if (!matchesConfig) {
      return NextResponse.json(
        { error: "Configured sponsor address does not match sponsor private key." },
        { status: 400 },
      );
    }

    const publicClient = createPublicClient({ transport: http(getRpcUrl()) });
    const bytecode = await publicClient.getBytecode({ address: voucherAddress });
    if (!bytecode || bytecode === "0x") {
      return NextResponse.json(
        { error: "Voucher contract not deployed on the current network." },
        { status: 400 },
      );
    }
    const client = createWalletClient({
      account,
      transport: http(getRpcUrl()),
    });
    await ensureSponsorBalance(getRpcUrl(), account.address);

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
    const message = (error as Error).message || "Failed to issue voucher";
    logError("console.voucher.issue.error", { message }, trace.traceId);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
