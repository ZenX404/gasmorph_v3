import { z } from "zod";
import { voucherKindOrder } from "../voucher/types";

const addressRegex = /^0x[a-fA-F0-9]{40}$/;
const tokenIdRegex = /^(0x)?[0-9a-fA-F]+$/;
const privateKeyRegex = /^(0x)?[a-fA-F0-9]{64}$/;

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

export const subsidyAccountSchema = z
  .object({
    address: addressSchema,
    note: z.string().max(120, "Note too long").optional(),
  })
  .strict();

export const projectConfigSchema = z
  .object({
    subsidyAccount: subsidyAccountSchema.nullable().optional(),
    checkInEnabled: z.boolean().optional(),
    sponsorPrivateKey: z.string().regex(privateKeyRegex, "Invalid private key").optional().nullable(),
  })
  .strict();

export const activityCreateSchema = z
  .object({
    name: z.string().min(1, "Name required").max(60, "Name too long"),
    startsAt: z.number().int().nonnegative(),
    endsAt: z.number().int().nonnegative(),
    voucherType: z.enum(voucherKindOrder as [string, ...string[]]),
    totalQuota: z.number().int().positive(),
  })
  .strict();

export const activityUpdateSchema = z
  .object({
    status: z.enum(["active", "paused", "ended"]).optional(),
    startsAt: z.number().int().nonnegative().optional(),
    endsAt: z.number().int().nonnegative().optional(),
  })
  .strict();

export const activityClaimSchema = z
  .object({
    activityId: z.string().min(3, "Invalid activity id"),
    wallet: addressSchema,
  })
  .strict();

export const demoExecuteSchema = z
  .object({
    wallet: addressSchema,
    networkId: z.number().int().positive(),
    isSubsidized: z.boolean(),
    voucherApplied: z.boolean().optional(),
    voucherId: z.string().regex(tokenIdRegex, "Invalid voucher id").nullable().optional(),
    voucherKind: z.enum(voucherKindOrder as [string, ...string[]]).nullable().optional(),
    expectedSponsorAddress: addressSchema.nullable().optional(),
  })
  .strict();

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
