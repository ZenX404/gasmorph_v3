"use client";

import type { Address, WalletClient } from "viem";
import { executeDemoAction as executeSdkDemoAction, type ExecuteDemoActionResult } from "@gasmorph/sdk";
import { demoAbi } from "./contracts/demo";
import { voucherAbi, voucherAddress } from "./contracts/voucher";
import type { VoucherKind } from "./voucher/types";
import { logTxPhase } from "./telemetry";

export type StatusResponse = ExecuteDemoActionResult;

function resolveRpcUrl(networkId: number) {
  if (networkId === 1337 || networkId === 31337) {
    return process.env.NEXT_PUBLIC_ANVIL_RPC_URL || "http://127.0.0.1:8545";
  }
  if (networkId === 11155111) {
    return process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL;
  }
  return process.env.NEXT_PUBLIC_MONAD_TESTNET_RPC_URL;
}

export async function executeDemoAction(params: {
  networkId: number;
  account: Address;
  isSubsidized: boolean;
  mode: "erc4337" | "sponsor-eoa" | "simulated";
  walletClient?: WalletClient;
  demoAddress?: Address;
  voucherApplied?: boolean;
  voucherId?: string | null;
  voucherKind?: VoucherKind | null;
  expectedSponsorAddress?: Address | null;
}): Promise<StatusResponse> {
  const rpcUrl = resolveRpcUrl(params.networkId);
  if (!rpcUrl) {
    throw new Error(`RPC not configured for chain ${params.networkId}`);
  }

  const demoAddress =
    params.demoAddress ??
    (process.env.DEMO_CONTRACT_ADDRESS as Address | undefined) ??
    ("0x5FbDB2315678afecb367f032d93F642f64180aa3" as Address);

  const requiresSponsor = Boolean(params.isSubsidized || params.voucherApplied);
  if (requiresSponsor) {
    const res = await fetch("/api/demo/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wallet: params.account,
        networkId: params.networkId,
        isSubsidized: params.isSubsidized,
        voucherApplied: params.voucherApplied ?? false,
        voucherId: params.voucherId ?? null,
        voucherKind: params.voucherKind ?? null,
        expectedSponsorAddress: params.expectedSponsorAddress ?? null,
      }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error || "Failed to submit sponsored transaction.");
    }
    const data = (await res.json()) as StatusResponse;
    logTxPhase("demo-action", "confirmed", {
      networkId: data.networkId,
      subsidized: data.gasPayer === "sponsor",
      voucher: data.gasPayer === "voucher",
      txHash: data.txHash,
    });
    return data;
  }

  return executeSdkDemoAction({
    networkId: params.networkId,
    account: params.account,
    isSubsidized: false,
    mode: params.mode,
    walletClient: params.walletClient,
    demoContract: {
      address: demoAddress,
      abi: demoAbi,
    },
    voucherContract: voucherAddress
      ? {
          address: voucherAddress,
          abi: voucherAbi,
        }
      : null,
    voucherApplied: false,
    voucherId: null,
    voucherKind: null,
    rpcUrl,
    onPhase: (phase, payload) => {
      logTxPhase("demo-action", phase, payload);
    },
  });
}
