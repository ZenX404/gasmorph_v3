import type { Abi, Address } from "viem";

export const voucherAbi = [
  {
    type: "function",
    name: "issueVoucher",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address", internalType: "address" },
      { name: "kind", type: "uint8", internalType: "enum VoucherNFT.VoucherKind" },
    ],
    outputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
  },
  {
    type: "function",
    name: "consume",
    stateMutability: "nonpayable",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "burn",
    stateMutability: "nonpayable",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "getVoucher",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [
      {
        name: "data",
        type: "tuple",
        internalType: "struct VoucherNFT.VoucherData",
        components: [
          { name: "kind", type: "uint8", internalType: "enum VoucherNFT.VoucherKind" },
          { name: "issuedAt", type: "uint64", internalType: "uint64" },
          { name: "durationSeconds", type: "uint64", internalType: "uint64" },
          { name: "usesRemaining", type: "uint32", internalType: "uint32" },
        ],
      },
      { name: "owner", type: "address", internalType: "address" },
    ],
  },
  {
    type: "function",
    name: "getApproved",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "approved", type: "address", internalType: "address" }],
  },
  {
    type: "function",
    name: "isApprovedForAll",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address", internalType: "address" },
      { name: "operator", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "approved", type: "bool", internalType: "bool" }],
  },
  {
    type: "function",
    name: "setApprovalForAll",
    stateMutability: "nonpayable",
    inputs: [
      { name: "operator", type: "address", internalType: "address" },
      { name: "approved", type: "bool", internalType: "bool" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "ownerOf",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "owner", type: "address", internalType: "address" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address", internalType: "address" }],
    outputs: [{ name: "balance", type: "uint256", internalType: "uint256" }],
  },
  {
    type: "function",
    name: "tokensOfOwner",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address", internalType: "address" }],
    outputs: [{ name: "tokenIds", type: "uint256[]", internalType: "uint256[]" }],
  },
  {
    type: "function",
    name: "transferFrom",
    stateMutability: "nonpayable",
    inputs: [
      { name: "from", type: "address", internalType: "address" },
      { name: "to", type: "address", internalType: "address" },
      { name: "tokenId", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "event",
    name: "VoucherIssued",
    anonymous: false,
    inputs: [
      { indexed: true, name: "to", type: "address", internalType: "address" },
      { indexed: true, name: "tokenId", type: "uint256", internalType: "uint256" },
      { indexed: false, name: "kind", type: "uint8", internalType: "enum VoucherNFT.VoucherKind" },
      { indexed: false, name: "durationSeconds", type: "uint256", internalType: "uint256" },
      { indexed: false, name: "usesRemaining", type: "uint256", internalType: "uint256" },
    ],
  },
  {
    type: "event",
    name: "VoucherBurned",
    anonymous: false,
    inputs: [{ indexed: true, name: "tokenId", type: "uint256", internalType: "uint256" }],
  },
  {
    type: "event",
    name: "VoucherConsumed",
    anonymous: false,
    inputs: [
      { indexed: true, name: "tokenId", type: "uint256", internalType: "uint256" },
      { indexed: false, name: "usesRemaining", type: "uint256", internalType: "uint256" },
    ],
  },
] as const satisfies Abi;

export type VoucherAbi = typeof voucherAbi;

export const voucherAddress = (process.env.NEXT_PUBLIC_VOUCHER_CONTRACT_ADDRESS ||
  process.env.VOUCHER_CONTRACT_ADDRESS ||
  "") as Address;
