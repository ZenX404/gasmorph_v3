import { NextResponse } from "next/server";
import type { Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { executeDemoAction } from "@gasmorph/sdk";
import { demoAbi } from "@/app/lib/contracts/demo";
import { voucherAbi, voucherAddress } from "@/app/lib/contracts/voucher";
import { getProjectConfig } from "@/app/lib/console/projectConfigStore";
import { createTraceContext, logError, logRequest } from "@/app/lib/telemetry/logger";
import { demoExecuteSchema } from "@/app/lib/validation/validators";

function resolveRpcUrl(networkId: number) {
  if (networkId === 1337 || networkId === 31337) {
    return process.env.NEXT_PUBLIC_ANVIL_RPC_URL || "http://127.0.0.1:8545";
  }
  if (networkId === 11155111) {
    return process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL;
  }
  return process.env.NEXT_PUBLIC_MONAD_TESTNET_RPC_URL;
}

const fallbackSponsorPk = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603c9a21c087";
const fallbackFaucetPk = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

export async function POST(req: Request) {
  const trace = createTraceContext();
  try {
    const raw = (await req.json()) as Record<string, unknown>;
    const parsed = demoExecuteSchema.parse(raw);

    const usingSponsor = Boolean(parsed.isSubsidized || parsed.voucherApplied);
    if (!usingSponsor) {
      return NextResponse.json({ error: "User-paid actions must be signed in wallet." }, { status: 400 });
    }

    if (parsed.voucherApplied) {
      if (!parsed.voucherId) {
        return NextResponse.json({ error: "Voucher id required for voucher execution." }, { status: 400 });
      }
      if (!parsed.voucherKind) {
        return NextResponse.json({ error: "Voucher kind required for voucher execution." }, { status: 400 });
      }
      if (!voucherAddress) {
        return NextResponse.json({ error: "Voucher contract address missing." }, { status: 400 });
      }
    }

    const config = getProjectConfig();
    const sponsorPrivateKey =
      config.sponsorPrivateKey ||
      process.env.SPONSOR_PRIVATE_KEY ||
      process.env.NEXT_PUBLIC_SPONSOR_PRIVATE_KEY ||
      fallbackSponsorPk;

    if (!sponsorPrivateKey) {
      return NextResponse.json({ error: "Sponsor private key not configured." }, { status: 400 });
    }

    const sponsorAddress = privateKeyToAccount(sponsorPrivateKey as `0x${string}`).address.toLowerCase();
    if (config.subsidyAccount?.address && config.subsidyAccount.address.toLowerCase() !== sponsorAddress) {
      return NextResponse.json(
        { error: "Configured sponsor address does not match sponsor private key." },
        { status: 400 },
      );
    }
    if (
      parsed.expectedSponsorAddress &&
      parsed.expectedSponsorAddress.toLowerCase() !== sponsorAddress
    ) {
      return NextResponse.json(
        { error: "Configured sponsor address does not match sponsor private key." },
        { status: 400 },
      );
    }

    const rpcUrl = resolveRpcUrl(parsed.networkId);
    if (!rpcUrl) {
      return NextResponse.json({ error: `RPC not configured for chain ${parsed.networkId}` }, { status: 400 });
    }

    const demoAddress =
      (process.env.DEMO_CONTRACT_ADDRESS as Address | undefined) ??
      ("0x5FbDB2315678afecb367f032d93F642f64180aa3" as Address);

    const faucetPrivateKey =
      process.env.FAUCET_PRIVATE_KEY ||
      process.env.NEXT_PUBLIC_FAUCET_PRIVATE_KEY ||
      fallbackFaucetPk;

    const result = await executeDemoAction({
      networkId: parsed.networkId,
      account: parsed.wallet as Address,
      isSubsidized: parsed.isSubsidized,
      mode: "erc4337",
      demoContract: { address: demoAddress, abi: demoAbi },
      voucherContract: voucherAddress
        ? {
            address: voucherAddress,
            abi: voucherAbi,
          }
        : null,
      voucherApplied: parsed.voucherApplied ?? false,
      voucherId: parsed.voucherId ?? null,
      voucherKind: parsed.voucherKind ?? null,
      rpcUrl,
      sponsorPrivateKey: sponsorPrivateKey as `0x${string}`,
      faucetPrivateKey: faucetPrivateKey as `0x${string}`,
    });

    logRequest(
      "demo.execute",
      {
        wallet: parsed.wallet,
        networkId: parsed.networkId,
        gasPayer: result.gasPayer ?? null,
        txHash: result.txHash ?? null,
      },
      trace.traceId,
    );

    return NextResponse.json(result);
  } catch (error) {
    logError("demo.execute.error", { message: (error as Error).message }, trace.traceId);
    return NextResponse.json({ error: (error as Error).message || "Failed to execute demo action." }, { status: 400 });
  }
}
