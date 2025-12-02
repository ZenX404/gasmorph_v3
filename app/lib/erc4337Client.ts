// Placeholder ERC-4337 client; replace with real bundler/paymaster调用
export type Mode = "erc4337" | "sponsor-eoa" | "simulated";

export type ExecuteRequest = {
  networkId: number;
  account: string;
  isSubsidized: boolean;
  mode: Mode;
  action: string;
};

export type ExecuteResult = {
  opId: string;
  txHash: string;
  status: "pending" | "confirmed" | "failed";
  gasPayer: string;
  explorerUrl?: string | null;
  failureReason?: string | null;
};

export async function submitUserOperation(req: ExecuteRequest): Promise<ExecuteResult> {
  const fakeHash = `0x${req.account.slice(2).padEnd(64, "0")}`;
  return {
    opId: crypto.randomUUID(),
    txHash: fakeHash,
    status: "confirmed",
    gasPayer: req.isSubsidized ? "项目方" : "用户",
    explorerUrl: null,
    failureReason: null,
  };
}
