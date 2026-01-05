import type { Address, PublicClient } from "viem";
import { voucherAbi, voucherAddress } from "@/app/lib/contracts/voucher";
import { normalizeVoucher, type VoucherChainData } from "@/app/lib/voucher/logic";
import type { VoucherToken } from "@/app/lib/voucher/types";

export async function fetchVoucherTokens(params: {
  client: PublicClient;
  owner: Address;
  nowMs?: number;
}): Promise<VoucherToken[]> {
  if (!voucherAddress) return [];

  const tokenIds = (await params.client.readContract({
    address: voucherAddress,
    abi: voucherAbi,
    functionName: "tokensOfOwner",
    args: [params.owner],
  })) as bigint[];

  if (!tokenIds.length) return [];

  const nowMs = params.nowMs ?? Date.now();
  const tokens = await Promise.all(
    tokenIds.map(async (tokenId) => {
      const [data, owner] = (await params.client.readContract({
        address: voucherAddress,
        abi: voucherAbi,
        functionName: "getVoucher",
        args: [tokenId],
      })) as readonly [{ kind: number; issuedAt: bigint; durationSeconds: bigint; usesRemaining: number }, Address];

      const payload: VoucherChainData = {
        tokenId,
        owner,
        kindIndex: data.kind,
        issuedAt: Number(data.issuedAt),
        durationSeconds: Number(data.durationSeconds),
        usesRemaining: Number(data.usesRemaining),
      };

      return normalizeVoucher(payload, nowMs);
    }),
  );

  return tokens;
}
