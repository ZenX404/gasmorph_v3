import type { Address } from "viem";
import type { GasMorphClient } from "./client";
import type {
  IssueVoucherPayload,
  IssueVoucherResponse,
  VoucherBurnParams,
  VoucherOwnershipParams,
  VoucherTransferParams,
} from "./types";

export async function issueVoucher(client: GasMorphClient, payload: IssueVoucherPayload): Promise<IssueVoucherResponse> {
  return client.issueVoucher(payload);
}

export async function transferVoucher(params: VoucherTransferParams) {
  const { walletClient, voucherContract, from, to, tokenId } = params;
  return walletClient.writeContract({
    address: voucherContract.address,
    abi: voucherContract.abi,
    functionName: "transferFrom",
    args: [from as Address, to as Address, tokenId],
    account: from as Address,
    chain: null,
  });
}

export async function burnVoucher(params: VoucherBurnParams) {
  const { walletClient, voucherContract, tokenId } = params;
  return walletClient.writeContract({
    address: voucherContract.address,
    abi: voucherContract.abi,
    functionName: "burn",
    args: [tokenId],
    account: walletClient.account ?? null,
    chain: null,
  });
}

export async function hasVoucher(params: VoucherOwnershipParams) {
  const tokenIds = (await params.client.readContract({
    address: params.voucherContract.address,
    abi: params.voucherContract.abi,
    functionName: "tokensOfOwner",
    args: [params.owner],
  })) as bigint[];

  return tokenIds.length > 0;
}
