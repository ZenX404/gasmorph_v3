import { NextResponse } from "next/server";
import { createPublicClient, createWalletClient, http } from "viem";
import { activityClaimSchema } from "@/app/lib/validation/validators";
import { voucherAbi, voucherAddress } from "@/app/lib/contracts/voucher";
import { getActivityErrorMessage } from "@/app/lib/activities/errors";
import { getClaimError } from "@/app/lib/activities/claimRules";
import {
  decrementActivityQuota,
  getActivityById,
  recordActivityClaim,
} from "@/app/lib/activities/store";
import { recordIssuedVoucher } from "@/app/lib/console/store";
import { createTraceContext, logError, logRequest } from "@/app/lib/telemetry/logger";
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
    const body = activityClaimSchema.parse(await req.json());
    const activity = getActivityById(body.activityId);
    const claimError = getClaimError(activity, body.wallet);

    if (claimError) {
      const status = claimError === "activity_not_found" ? 404 : 409;
      return NextResponse.json({ error: getActivityErrorMessage(claimError) }, { status });
    }

    if (!activity) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

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

    const kindIndex = resolveKindIndex(activity.voucherType);
    if (kindIndex < 0) {
      return NextResponse.json({ error: "Unsupported voucher type" }, { status: 400 });
    }

    const hash = await client.writeContract({
      address: voucherAddress,
      abi: voucherAbi,
      functionName: "issueVoucher",
      args: [body.wallet as `0x${string}`, kindIndex],
      chain: null,
    });

    await publicClient.waitForTransactionReceipt({ hash });

    const updated = decrementActivityQuota(activity);
    recordActivityClaim({
      activityId: activity.id,
      wallet: body.wallet,
      claimedAt: Date.now(),
      voucherId: hash,
    });
    recordIssuedVoucher({
      target: body.wallet,
      type: activity.voucherType,
      issuedAt: Date.now(),
      voucherId: hash,
    });

    logRequest(
      "demo.activities.claim",
      { id: activity.id, wallet: body.wallet, hash, remaining: updated?.remainingQuota ?? 0 },
      trace.traceId,
    );

    return NextResponse.json({ result: "success", voucherId: hash, issuedAt: new Date().toISOString() });
  } catch (error) {
    const message = (error as Error).message || "Failed to claim activity voucher";
    logError("demo.activities.claim.error", { message }, trace.traceId);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
