import type { Address, WalletClient, PublicClient, Abi } from "viem";

export type VoucherKind = "single" | "time_window_1m" | "time_window_2h" | "time_window_7d";

export type ActivityStatus = "draft" | "active" | "paused" | "ended" | "deleted";

export type ActivityErrorCode =
  | "activity_not_found"
  | "activity_paused"
  | "activity_ended"
  | "quota_exhausted"
  | "already_claimed"
  | "invalid_activity"
  | "checkin_disabled";

export type ProjectConfigResponse = {
  subsidyAccount: { address: string; note?: string } | null;
  checkInEnabled: boolean;
  updatedAt: string;
};

export type OverviewResponse = {
  subsidyEnabled: boolean;
  sponsorSummary?: {
    address?: string;
  };
};

export type ActivityItem = {
  id: string;
  name: string;
  startsAt: number;
  endsAt: number;
  voucherType: VoucherKind;
  totalQuota: number;
  remainingQuota: number;
  status: ActivityStatus;
  createdAt: number;
  updatedAt: number;
  claimed: boolean;
  claimable: boolean;
  claimError?: ActivityErrorCode | null;
};

export type ActivityListResponse = {
  items: ActivityItem[];
};

export type ActivityClaimPayload = {
  activityId: string;
  wallet: Address | string;
};

export type ActivityClaimResponse = {
  result: "success";
  voucherId: string;
  issuedAt: string;
};

export type CheckInResponse = {
  result: "success";
  voucherId: string;
  issuedAt: string;
};

export type IssueVoucherPayload = {
  target: string;
  type: VoucherKind;
};

export type IssueVoucherResponse = {
  result: "success";
  voucherId: string;
  issuedAt: string;
};

export type GasMorphClientConfig = {
  baseUrl?: string;
  fetcher?: typeof fetch;
};

export type ContractConfig = {
  address: Address;
  abi: Abi;
};

export type ExecuteDemoActionParams = {
  networkId: number;
  account: Address;
  isSubsidized: boolean;
  mode: "erc4337" | "sponsor-eoa" | "simulated";
  walletClient?: WalletClient;
  demoContract: ContractConfig;
  voucherContract?: ContractConfig | null;
  voucherApplied?: boolean;
  voucherId?: string | null;
  voucherKind?: VoucherKind | null;
  rpcUrl: string;
  sponsorPrivateKey?: `0x${string}`;
  faucetPrivateKey?: `0x${string}`;
  onPhase?: (phase: "submit" | "confirmed" | "fallback", payload: Record<string, unknown>) => void;
};

export type ExecuteDemoActionResult = {
  opId: string;
  networkId: number | string;
  status: "pending" | "confirmed" | "failed" | "cancelled";
  txHash: string | null;
  blockNumber: number | null;
  gasUsed: string | null;
  gasPayer: string | null;
  explorerUrl: string | null;
  failureReason?: string | null;
};

export type VoucherTransferParams = {
  walletClient: WalletClient;
  voucherContract: ContractConfig;
  from: Address;
  to: Address;
  tokenId: bigint;
};

export type VoucherBurnParams = {
  walletClient: WalletClient;
  voucherContract: ContractConfig;
  tokenId: bigint;
};

export type VoucherOwnershipParams = {
  client: PublicClient;
  voucherContract: ContractConfig;
  owner: Address;
};
