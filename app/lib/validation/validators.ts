import { z } from "zod";
import { voucherKindOrder } from "../voucher/types";

const addressRegex = /^0x[a-fA-F0-9]{40}$/;
const tokenIdRegex = /^(0x)?[0-9a-fA-F]+$/;

// 说明: 服务端请求校验规则。
export const addressSchema = z.string().regex(addressRegex, "Invalid address");

export const toggleSchema = z.object({
  enabled: z.boolean(),
});

export const issueVoucherSchema = z.object({
  target: addressSchema,
  type: z.enum(voucherKindOrder as [string, ...string[]]),
});

export const checkInSchema = z.object({
  wallet: addressSchema,
});

export const transferVoucherSchema = z.object({
  voucherId: z.string().regex(tokenIdRegex, "Invalid voucher id"),
  from: addressSchema,
  to: addressSchema,
});

export const burnVoucherSchema = z.object({
  voucherId: z.string().regex(tokenIdRegex, "Invalid voucher id"),
});

export const recordTransactionSchema = z.object({
  txHash: z.string().min(6),
  sender: addressSchema,
  status: z.enum(["confirmed", "failed", "pending"]),
  gasPayer: z.enum(["sponsor", "user", "voucher"]),
  voucherId: z.string().regex(tokenIdRegex, "Invalid voucher id").nullable().optional(),
  gasUsed: z.string().regex(/^\d+$/, "Invalid gas used").nullable().optional(),
  networkId: z.number().int().positive().optional(),
  explorerUrl: z.string().url().nullable().optional(),
  blockNumber: z.number().int().nonnegative().nullable().optional(),
  createdAt: z.number().optional(),
});
