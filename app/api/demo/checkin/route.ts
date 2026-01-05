import { NextResponse } from "next/server";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { checkInSchema } from "@/app/lib/validation/validators";
import { voucherAbi, voucherAddress } from "@/app/lib/contracts/voucher";
import { createTraceContext, logError, logRequest } from "@/app/lib/telemetry/logger";
import { hasCheckedIn, recordCheckIn } from "@/app/lib/voucher/checkinStore";
import { getShanghaiDayKey } from "@/app/lib/voucher/time";

function getRpcUrl() {
  return process.env.NEXT_PUBLIC_ANVIL_RPC_URL || "http://127.0.0.1:8545";
}

const fallbackSponsorPk = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603c9a21c087";

export async function POST(req: Request) {
  const trace = createTraceContext();
  try {
    const body = checkInSchema.parse(await req.json());
    const dayKey = getShanghaiDayKey();

    if (hasCheckedIn(body.wallet, dayKey)) {
      return NextResponse.json({ error: "Daily check-in already claimed" }, { status: 409 });
    }

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

    const hash = await client.writeContract({
      address: voucherAddress,
      abi: voucherAbi,
      functionName: "issueVoucher",
      args: [body.wallet as `0x${string}`, 0],
      chain: null,
    });

    const publicClient = createPublicClient({ transport: http(getRpcUrl()) });
    await publicClient.waitForTransactionReceipt({ hash });

    recordCheckIn({ wallet: body.wallet, dayKey, voucherId: hash, createdAt: Date.now() });
    logRequest("demo.checkin", { wallet: body.wallet, hash, dayKey }, trace.traceId);

    return NextResponse.json({ result: "success", voucherId: hash, issuedAt: new Date().toISOString() });
  } catch (error) {
    logError("demo.checkin.error", { message: (error as Error).message }, trace.traceId);
    return NextResponse.json({ error: "Failed to claim voucher" }, { status: 400 });
  }
}
