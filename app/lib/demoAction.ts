"use client";

import {
  createPublicClient,
  createWalletClient,
  encodeFunctionData,
  http,
  parseEther,
  stringToHex,
  type Address,
  type WalletClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { demoAbi } from "./contracts/demo";
import { voucherAbi, voucherAddress } from "./contracts/voucher";
import type { VoucherKind } from "./voucher/types";
import { logTxPhase } from "./telemetry";

type StatusResponse = {
  opId: string;
  networkId: number | string;
  status: "pending" | "confirmed" | "failed" | "cancelled";
  txHash: string | null;
  blockNumber: number | null;
  gasUsed: string | null; // wei amount
  gasPayer: string | null;
  explorerUrl: string | null;
  failureReason?: string | null;
};

function fakeTxHash(opId: string) {
  const hex = opId.replace(/-/g, "").padEnd(64, "0").slice(0, 64);
  return `0x${hex}`;
}

async function waitForReceipt(rpcUrl: string, txHash: `0x${string}`) {
  const client = createPublicClient({
    transport: http(rpcUrl),
  });
  return client.waitForTransactionReceipt({ hash: txHash });
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
}): Promise<StatusResponse> {
  const opId = crypto.randomUUID();
  const data = encodeFunctionData({
    abi: demoAbi,
    functionName: "perform",
    args: [stringToHex("demo-action")],
  });

  const rpcFromEnv =
    params.networkId === 1337 || params.networkId === 31337
      ? process.env.NEXT_PUBLIC_ANVIL_RPC_URL || "http://127.0.0.1:8545"
      : params.networkId === 11155111
        ? process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL
        : process.env.NEXT_PUBLIC_MONAD_TESTNET_RPC_URL;

  if (!rpcFromEnv) {
    throw new Error(`RPC not configured for chain ${params.networkId}`);
  }

  const demoAddress =
    params.demoAddress ??
    (process.env.DEMO_CONTRACT_ADDRESS as Address | undefined) ??
    ("0x5FbDB2315678afecb367f032d93F642f64180aa3" as Address);

  const sponsorPk =
    process.env.NEXT_PUBLIC_SPONSOR_PRIVATE_KEY ??
    "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603c9a21c087";
  const sponsor = privateKeyToAccount(sponsorPk as `0x${string}`);
  const sponsorClient = createWalletClient({
    account: sponsor,
    chain: {
      id: params.networkId,
      name: "anvil-subsidy",
      nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
      rpcUrls: { default: { http: [rpcFromEnv] } },
    },
    transport: http(rpcFromEnv),
  });

  const usingVoucher = Boolean(params.voucherApplied && params.voucherId && !params.isSubsidized);

  if (usingVoucher) {
    if (!voucherAddress) {
      throw new Error("Voucher contract address missing.");
    }

    await ensureSponsorBalance(rpcFromEnv, sponsor.address);

    if (params.voucherKind === "single") {
      const consumeHash = await sponsorClient.writeContract({
        address: voucherAddress,
        abi: voucherAbi,
        functionName: "consume",
        args: [BigInt(params.voucherId as string)],
      });
      await waitForReceipt(rpcFromEnv, consumeHash);
    }

    const txHash = await sponsorClient.sendTransaction({
      to: demoAddress,
      data,
      value: BigInt(0),
      gas: BigInt(500000),
      gasPrice: BigInt(1_000_000_000),
    });

    logTxPhase("demo-action", "submit", { networkId: params.networkId, subsidized: false, voucher: true, txHash });

    const receipt = await waitForReceipt(rpcFromEnv, txHash);
    const gasUsed = receipt.gasUsed ?? BigInt(0);
    const gasPrice = receipt.effectiveGasPrice ?? BigInt(1_000_000_000);
    const gasFeeWei = gasUsed * gasPrice;

    const explorerBase =
      params.networkId === 1337 || params.networkId === 31337
        ? null
        : params.networkId === 11155111
          ? "https://sepolia.etherscan.io"
          : "https://explorer.monad.xyz";
    const explorerUrl = explorerBase ? `${explorerBase}/tx/${txHash}` : null;

    logTxPhase("demo-action", "confirmed", {
      txHash,
      blockNumber: receipt.blockNumber,
      gasUsed: gasFeeWei,
      subsidized: false,
      voucher: true,
    });

    return {
      opId,
      networkId: params.networkId,
      status: "confirmed",
      txHash,
      blockNumber: Number(receipt.blockNumber),
      gasUsed: gasFeeWei.toString(),
      gasPayer: "voucher",
      explorerUrl,
      failureReason: null,
    };
  }

  // Subsidy mode: real on-chain tx paid by sponsor account (no user popup)
  if (params.isSubsidized) {
    await ensureSponsorBalance(rpcFromEnv, sponsor.address);

    const txHash = await sponsorClient.sendTransaction({
      to: demoAddress,
      data,
      value: BigInt(0),
      gas: BigInt(500000),
      gasPrice: BigInt(1_000_000_000), // 1 gwei
    });

    logTxPhase("demo-action", "submit", { networkId: params.networkId, subsidized: true, txHash });

    const receipt = await waitForReceipt(rpcFromEnv, txHash);
    const gasUsed = receipt.gasUsed ?? BigInt(0);
    const gasPrice = receipt.effectiveGasPrice ?? BigInt(1_000_000_000);
    const gasFeeWei = gasUsed * gasPrice;

    const explorerBase =
      params.networkId === 1337 || params.networkId === 31337
        ? null
        : params.networkId === 11155111
          ? "https://sepolia.etherscan.io"
          : "https://explorer.monad.xyz";
    const explorerUrl = explorerBase ? `${explorerBase}/tx/${txHash}` : null;

    logTxPhase("demo-action", "confirmed", { txHash, blockNumber: receipt.blockNumber, gasUsed: gasFeeWei, subsidized: true });

    return {
      opId,
      networkId: params.networkId,
      status: "confirmed",
      txHash,
      blockNumber: Number(receipt.blockNumber),
      gasUsed: gasFeeWei.toString(),
      gasPayer: "sponsor",
      explorerUrl,
      failureReason: null,
    };
  }

  let txHash: `0x${string}` | undefined;

  // Real transaction (non-subsidized, user pays)
  if (params.walletClient) {
    txHash = await params.walletClient.sendTransaction({
      account: params.account,
      to: demoAddress,
      data,
      value: BigInt(0),
      gasPrice: BigInt(1_000_000_000),
      chain: {
        id: params.networkId,
        name: "custom",
        nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
        rpcUrls: { default: { http: [rpcFromEnv] } },
      },
    });
  } else {
    txHash = (await window.ethereum?.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: params.account,
          to: demoAddress,
          data,
          value: "0x0",
          gasPrice: "0x3b9aca00", // 1 gwei
        },
      ],
    })) as `0x${string}`;
  }

  logTxPhase("demo-action", "submit", { networkId: params.networkId, subsidized: params.isSubsidized, txHash });

  // Fallback to fake when wallet not available
  if (!txHash) {
    logTxPhase("demo-action", "fallback", { reason: "no-tx-hash" });
    return {
      opId: crypto.randomUUID(),
      networkId: params.networkId,
      status: "pending",
      txHash: fakeTxHash(crypto.randomUUID()),
      blockNumber: null,
      gasUsed: null,
      gasPayer: params.isSubsidized ? "sponsor" : params.voucherApplied ? "voucher" : "user",
      explorerUrl: null,
    };
  }

  // Wait for receipt
  const receipt = await waitForReceipt(rpcFromEnv, txHash);
  const explorerBase =
    params.networkId === 1337 || params.networkId === 31337
      ? null
      : params.networkId === 11155111
        ? "https://sepolia.etherscan.io"
        : "https://explorer.monad.xyz";
  const explorerUrl = explorerBase ? `${explorerBase}/tx/${txHash}` : null;

  const gasUsed = receipt.gasUsed ?? BigInt(0);
  const gasPrice = receipt.effectiveGasPrice ?? BigInt(1_000_000_000); // default 1 gwei if missing
  const gasFeeWei = gasUsed * gasPrice;

  logTxPhase("demo-action", "confirmed", { txHash, blockNumber: receipt.blockNumber, gasUsed: gasFeeWei, subsidized: false });

  return {
    opId,
    networkId: params.networkId,
    status: "confirmed",
    txHash,
    blockNumber: Number(receipt.blockNumber),
    gasUsed: gasFeeWei.toString(),
    gasPayer: params.voucherApplied ? "voucher" : "user",
    explorerUrl,
  };
}

async function ensureSponsorBalance(rpcUrl: string, sponsor: Address) {
  const client = createPublicClient({ transport: http(rpcUrl) });
  const balance = await client.getBalance({ address: sponsor });
  const min = parseEther("0.1");
  if (balance >= min) return;

  const faucetPk =
    process.env.NEXT_PUBLIC_FAUCET_PRIVATE_KEY ??
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const faucet = privateKeyToAccount(faucetPk as `0x${string}`);
  const faucetClient = createWalletClient({
    account: faucet,
    chain: {
      id: 1337,
      name: "anvil-faucet",
      nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
      rpcUrls: { default: { http: [rpcUrl] } },
    },
    transport: http(rpcUrl),
  });

  await faucetClient.sendTransaction({
    to: sponsor,
    value: parseEther("1.0"),
  });
}
