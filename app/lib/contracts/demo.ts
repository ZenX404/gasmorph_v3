import type { Abi } from "viem";

// Typed ABI for Demo contract (for viem/ethers typed usage)
export const demoAbi = [
  {
    type: "constructor",
    inputs: [{ name: "_rewardWei", type: "uint256", internalType: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "ActionPerformed",
    inputs: [
      { indexed: true, name: "sender", type: "address", internalType: "address" },
      { indexed: false, name: "value", type: "uint256", internalType: "uint256" },
      { indexed: false, name: "action", type: "string", internalType: "string" },
    ],
    anonymous: false,
  },
  {
    type: "function",
    name: "perform",
    inputs: [{ name: "action", type: "bytes", internalType: "bytes" }],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "rewardWei",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "setReward",
    inputs: [{ name: "_rewardWei", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
] as const satisfies Abi;

export type DemoAbi = typeof demoAbi;
