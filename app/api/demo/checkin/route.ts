import { NextResponse } from "next/server";
import { createPublicClient, createWalletClient, http } from "viem";
import { checkInSchema } from "@/app/lib/validation/validators";
import { voucherAbi, voucherAddress } from "@/app/lib/contracts/voucher";
import { createTraceContext, logError, logRequest } from "@/app/lib/telemetry/logger";
import { hasCheckedIn, recordCheckIn } from "@/app/lib/voucher/checkinStore";
import { getShanghaiDayKey } from "@/app/lib/voucher/time";
import { getProjectConfig } from "@/app/lib/console/projectConfigStore";
import { ensureSponsorBalance, resolveSponsorAccount } from "@/app/lib/console/sponsor";

function getRpcUrl() {
  return process.env.NEXT_PUBLIC_ANVIL_RPC_URL || "http://127.0.0.1:8545";
}

export async function POST(req: Request) {
  const trace = createTraceContext();
  try {
    const body = checkInSchema.parse(await req.json());
    const dayKey = getShanghaiDayKey();
    const config = getProjectConfig();

    if (!config.checkInEnabled) {
      return NextResponse.json({ error: "Daily check-in disabled" }, { status: 403 });
    }

    if (hasCheckedIn(body.wallet, dayKey)) {
      return NextResponse.json({ error: "Daily check-in already claimed" }, { status: 409 });
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

    const hash = await client.writeContract({
      address: voucherAddress,
      abi: voucherAbi,
      functionName: "issueVoucher",
      args: [body.wallet as `0x${string}`, 0],
      chain: null,
    });

    await publicClient.waitForTransactionReceipt({ hash });

    recordCheckIn({ wallet: body.wallet, dayKey, voucherId: hash, createdAt: Date.now() });
    logRequest("demo.checkin", { wallet: body.wallet, hash, dayKey }, trace.traceId);

    return NextResponse.json({ result: "success", voucherId: hash, issuedAt: new Date().toISOString() });
  } catch (error) {
    const message = (error as Error).message || "Failed to claim voucher";
    logError("demo.checkin.error", { message }, trace.traceId);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
