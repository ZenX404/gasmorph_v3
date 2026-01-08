import {
  createPublicClient,
  createWalletClient,
  encodeFunctionData,
  http,
  parseEther,
  stringToHex,
  type Address,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import type {
  ActivityClaimPayload,
  ActivityClaimResponse,
  ActivityListResponse,
  CheckInResponse,
  ExecuteDemoActionParams,
  ExecuteDemoActionResult,
  GasMorphClientConfig,
  IssueVoucherPayload,
  IssueVoucherResponse,
  OverviewResponse,
  ProjectConfigResponse,
} from "./types";

export class GasMorphClient {
  private baseUrl: string;
  private fetcher: typeof fetch;

  constructor(config: GasMorphClientConfig = {}) {
    this.baseUrl = config.baseUrl ?? "";
    this.fetcher =
      config.fetcher ??
      ((...args) => {
        if (typeof globalThis.fetch !== "function") {
          throw new Error("Fetch is not available in the current environment.");
        }
        return globalThis.fetch(...args);
      });
  }

  private buildUrl(path: string) {
    if (!this.baseUrl) return path;
    return `${this.baseUrl}${path}`;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await this.fetcher(this.buildUrl(path), {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error || "Request failed");
    }

    return res.json() as Promise<T>;
  }

  async getOverview() {
    return this.request<OverviewResponse>("/api/console/overview");
  }

  async getProjectConfig() {
    return this.request<ProjectConfigResponse>("/api/console/project-config");
  }

  async listActivities(wallet?: string) {
    const query = wallet ? `?wallet=${wallet}` : "";
    return this.request<ActivityListResponse>(`/api/demo/activities${query}`);
  }

  async claimActivity(payload: ActivityClaimPayload) {
    return this.request<ActivityClaimResponse>("/api/demo/activities/claim", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async claimCheckIn(wallet: string) {
    return this.request<CheckInResponse>("/api/demo/checkin", {
      method: "POST",
      body: JSON.stringify({ wallet }),
    });
  }

  async issueVoucher(payload: IssueVoucherPayload) {
    return this.request<IssueVoucherResponse>("/api/console/issue-voucher", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
}

function fakeTxHash(opId: string) {
  const hex = opId.replace(/-/g, "").padEnd(64, "0").slice(0, 64);
  return `0x${hex}`;
}

function resolveExplorerBase(networkId: number) {
  if (networkId === 1337 || networkId === 31337) return null;
  if (networkId === 11155111) return "https://sepolia.etherscan.io";
  return "https://explorer.monad.xyz";
}

async function waitForReceipt(rpcUrl: string, txHash: `0x${string}`) {
  const client = createPublicClient({ transport: http(rpcUrl) });
  return client.waitForTransactionReceipt({ hash: txHash });
}

async function ensureSponsorBalance(rpcUrl: string, sponsor: Address, faucetPrivateKey?: `0x${string}`) {
  if (!faucetPrivateKey) return;
  const client = createPublicClient({ transport: http(rpcUrl) });
  const balance = await client.getBalance({ address: sponsor });
  const min = parseEther("0.1");
  if (balance >= min) return;

  const faucet = privateKeyToAccount(faucetPrivateKey);
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

export async function executeDemoAction(params: ExecuteDemoActionParams): Promise<ExecuteDemoActionResult> {
  const opId = crypto.randomUUID();
  const data = encodeFunctionData({
    abi: params.demoContract.abi,
    functionName: "perform",
    args: [stringToHex("demo-action")],
  });

  const usingVoucher = Boolean(params.voucherApplied && params.voucherId && !params.isSubsidized);

  const sponsorPrivateKey = params.sponsorPrivateKey;
  const sponsor = sponsorPrivateKey ? privateKeyToAccount(sponsorPrivateKey) : null;
  const sponsorClient = sponsor
    ? createWalletClient({
        account: sponsor,
        chain: {
          id: params.networkId,
          name: "sponsor",
          nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
          rpcUrls: { default: { http: [params.rpcUrl] } },
        },
        transport: http(params.rpcUrl),
      })
    : null;

  if ((params.isSubsidized || usingVoucher) && !sponsorClient) {
    throw new Error("Sponsor signer missing.");
  }

  if (usingVoucher) {
    if (!params.voucherContract) {
      throw new Error("Voucher contract address missing.");
    }

    await ensureSponsorBalance(params.rpcUrl, sponsorClient!.account!.address, params.faucetPrivateKey);

    if (params.voucherKind === "single") {
      const consumeHash = await sponsorClient!.writeContract({
        address: params.voucherContract.address,
        abi: params.voucherContract.abi,
        functionName: "consume",
        args: [BigInt(params.voucherId as string)],
      });
      await waitForReceipt(params.rpcUrl, consumeHash as `0x${string}`);
    }

    const txHash = await sponsorClient!.sendTransaction({
      to: params.demoContract.address,
      data,
      value: BigInt(0),
      gas: BigInt(500000),
      gasPrice: BigInt(1_000_000_000),
    });

    params.onPhase?.("submit", { networkId: params.networkId, subsidized: false, voucher: true, txHash });

    const receipt = await waitForReceipt(params.rpcUrl, txHash as `0x${string}`);
    const gasUsed = receipt.gasUsed ?? BigInt(0);
    const gasPrice = receipt.effectiveGasPrice ?? BigInt(1_000_000_000);
    const gasFeeWei = gasUsed * gasPrice;
    const explorerBase = resolveExplorerBase(params.networkId);
    const explorerUrl = explorerBase ? `${explorerBase}/tx/${txHash}` : null;

    params.onPhase?.("confirmed", {
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

  if (params.isSubsidized) {
    await ensureSponsorBalance(params.rpcUrl, sponsorClient!.account!.address, params.faucetPrivateKey);

    const txHash = await sponsorClient!.sendTransaction({
      to: params.demoContract.address,
      data,
      value: BigInt(0),
      gas: BigInt(500000),
      gasPrice: BigInt(1_000_000_000),
    });

    params.onPhase?.("submit", { networkId: params.networkId, subsidized: true, txHash });

    const receipt = await waitForReceipt(params.rpcUrl, txHash as `0x${string}`);
    const gasUsed = receipt.gasUsed ?? BigInt(0);
    const gasPrice = receipt.effectiveGasPrice ?? BigInt(1_000_000_000);
    const gasFeeWei = gasUsed * gasPrice;
    const explorerBase = resolveExplorerBase(params.networkId);
    const explorerUrl = explorerBase ? `${explorerBase}/tx/${txHash}` : null;

    params.onPhase?.("confirmed", {
      txHash,
      blockNumber: receipt.blockNumber,
      gasUsed: gasFeeWei,
      subsidized: true,
    });

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

  if (params.walletClient) {
    txHash = await params.walletClient.sendTransaction({
      account: params.account,
      to: params.demoContract.address,
      data,
      value: BigInt(0),
      gasPrice: BigInt(1_000_000_000),
      chain: {
        id: params.networkId,
        name: "custom",
        nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
        rpcUrls: { default: { http: [params.rpcUrl] } },
      },
    });
  } else {
    txHash = (await window.ethereum?.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: params.account,
          to: params.demoContract.address,
          data,
          value: "0x0",
          gasPrice: "0x3b9aca00",
        },
      ],
    })) as `0x${string}`;
  }

  params.onPhase?.("submit", { networkId: params.networkId, subsidized: params.isSubsidized, txHash });

  if (!txHash) {
    params.onPhase?.("fallback", { reason: "no-tx-hash" });
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

  const receipt = await waitForReceipt(params.rpcUrl, txHash);
  const explorerBase = resolveExplorerBase(params.networkId);
  const explorerUrl = explorerBase ? `${explorerBase}/tx/${txHash}` : null;

  const gasUsed = receipt.gasUsed ?? BigInt(0);
  const gasPrice = receipt.effectiveGasPrice ?? BigInt(1_000_000_000);
  const gasFeeWei = gasUsed * gasPrice;

  params.onPhase?.("confirmed", { txHash, blockNumber: receipt.blockNumber, gasUsed: gasFeeWei, subsidized: false });

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
