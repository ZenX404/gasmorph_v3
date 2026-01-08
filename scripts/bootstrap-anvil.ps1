# Purpose: deploy local contracts and sync env/docs (local only).

param(
  [string]$RpcUrl = "http://127.0.0.1:8545",
  [string]$ChainId = "1337",
  [string]$DeployerPrivateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  [string]$SponsorPrivateKey = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603c9a21c087",
  [string]$EnvFile = ".env.local",
  [switch]$UpdateDocs
)

function Resolve-ForgePath {
  $cmd = Get-Command forge -ErrorAction SilentlyContinue
  if ($cmd) {
    return $cmd.Source
  }
  $fallback = "D:\\software\\Foundry\\forge.exe"
  if (Test-Path $fallback) {
    return $fallback
  }
  throw "forge not found. Install Foundry or add forge to PATH."
}

function Get-ContractAddressFromRun([string]$Path) {
  if (!(Test-Path $Path)) {
    throw "Run file not found: $Path"
  }
  $json = Get-Content -Raw -Path $Path | ConvertFrom-Json
  $tx = $json.transactions | Where-Object { $_.contractAddress } | Select-Object -First 1
  if (-not $tx -or -not $tx.contractAddress) {
    throw "No contractAddress found in $Path"
  }
  return $tx.contractAddress
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$contractsDir = Join-Path $repoRoot "contracts\\gas-subsidy"
$forge = Resolve-ForgePath

Push-Location $contractsDir
& $forge script Deploy --rpc-url $RpcUrl --private-key $DeployerPrivateKey --broadcast
& $forge script DeployVoucher --rpc-url $RpcUrl --private-key $DeployerPrivateKey --broadcast
Pop-Location

$demoRun = Join-Path $contractsDir "broadcast\\Deploy.s.sol\\$ChainId\\run-latest.json"
$voucherRun = Join-Path $contractsDir "broadcast\\DeployVoucher.s.sol\\$ChainId\\run-latest.json"

$demoAddress = Get-ContractAddressFromRun $demoRun
$voucherAddress = Get-ContractAddressFromRun $voucherRun

$envPath = if ([System.IO.Path]::IsPathRooted($EnvFile)) { $EnvFile } else { Join-Path $repoRoot $EnvFile }
$setEnv = Join-Path $repoRoot "scripts\\set-env.ps1"

& $setEnv `
  -EnvFile $envPath `
  -AnvilRpc $RpcUrl `
  -SponsorPk $SponsorPrivateKey `
  -FaucetPk $DeployerPrivateKey `
  -VoucherAddress $voucherAddress `
  -DemoAddress $demoAddress `
  -DefaultChainId $ChainId

if ($UpdateDocs) {
  $docPath = Join-Path $repoRoot "specs\\001-subsidy-activity-sdk\\quickstart.md"
  if (Test-Path $docPath) {
    $doc = Get-Content -Raw -Path $docPath
    $doc = $doc -replace "\{\{DEMO_ADDRESS\}\}", $demoAddress
    $doc = $doc -replace "\{\{VOUCHER_ADDRESS\}\}", $voucherAddress
    $doc = $doc -replace "\{\{SPONSOR_PRIVATE_KEY\}\}", $SponsorPrivateKey
    $doc | Out-File -Encoding UTF8 -FilePath $docPath -Force
  }
}

Write-Host "Demo contract: $demoAddress"
Write-Host "Voucher contract: $voucherAddress"
