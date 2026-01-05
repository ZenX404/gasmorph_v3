# Purpose: helper to prepare .env.local for local/testnet usage (do NOT commit generated files)

param(
  [string]$EnvFile = ".env.local",
  [string]$AnvilRpc = "http://127.0.0.1:8545",
  [string]$SepoliaRpc = "https://sepolia.infura.io/v3/YOUR_KEY",
  [string]$MonadRpc = "",
  [string]$BundlerRpc = "",
  [string]$PaymasterRpc = "",
  [string]$SponsorPk = "",
  [string]$VoucherAddress = "",
  [string]$DemoAddress = "",
  [string]$EntryPoint = "",
  [string]$PaymasterAddress = "",
  [string]$DefaultChainId = "1337"
)

$content = @"
NEXT_PUBLIC_ANVIL_RPC_URL=$AnvilRpc
NEXT_PUBLIC_SEPOLIA_RPC_URL=$SepoliaRpc
NEXT_PUBLIC_MONAD_TESTNET_RPC_URL=$MonadRpc
BUNDLER_RPC_URL=$BundlerRpc
PAYMASTER_RPC_URL=$PaymasterRpc
SPONSOR_PRIVATE_KEY=$SponsorPk
NEXT_PUBLIC_VOUCHER_CONTRACT_ADDRESS=$VoucherAddress
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=demo
DEMO_CONTRACT_ADDRESS=$DemoAddress
ENTRYPOINT_ADDRESS=$EntryPoint
PAYMASTER_ADDRESS=$PaymasterAddress
DEFAULT_CHAIN_ID=$DefaultChainId
"@

Write-Host "Writing env file to $EnvFile (will overwrite existing file)"
$content | Out-File -Encoding UTF8 -FilePath $EnvFile -Force
Write-Host "Done. Reminder: DO NOT COMMIT $EnvFile to git."
