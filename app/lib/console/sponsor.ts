import type { Address } from "viem";
import { createPublicClient, createWalletClient, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { getProjectConfig } from "./projectConfigStore";

const fallbackSponsorPk = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603c9a21c087";
const fallbackFaucetPk = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

export function resolveSponsorAccount() {
  const config = getProjectConfig();
  const sponsorPk =
    config.sponsorPrivateKey ||
    process.env.SPONSOR_PRIVATE_KEY ||
    process.env.NEXT_PUBLIC_SPONSOR_PRIVATE_KEY ||
    fallbackSponsorPk;
  const account = privateKeyToAccount(sponsorPk as `0x${string}`);
  const configuredAddress = config.subsidyAccount?.address as Address | undefined;
  const matchesConfig =
    !configuredAddress || configuredAddress.toLowerCase() === account.address.toLowerCase();
  return { account, configuredAddress, matchesConfig };
}

export async function ensureSponsorBalance(rpcUrl: string, sponsor: Address) {
  const faucetPk =
    process.env.FAUCET_PRIVATE_KEY ||
    process.env.NEXT_PUBLIC_FAUCET_PRIVATE_KEY ||
    fallbackFaucetPk;
  if (!faucetPk) return;

  const client = createPublicClient({ transport: http(rpcUrl) });
  const balance = await client.getBalance({ address: sponsor });
  const minBalance = parseEther("0.05");
  if (balance >= minBalance) return;

  const faucet = privateKeyToAccount(faucetPk as `0x${string}`);
  const faucetClient = createWalletClient({
    account: faucet,
    chain: {
      id: 1337,
      name: "anvil",
      nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
      rpcUrls: { default: { http: [rpcUrl] } },
    },
    transport: http(rpcUrl),
  });

  await faucetClient.sendTransaction({
    to: sponsor,
    value: parseEther("1"),
  });
}
