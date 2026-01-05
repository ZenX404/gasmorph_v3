# Quickstart · 补贴控制台与消费券 NFT

## 1) 环境准备
- Node.js（与仓库锁定版本一致）
- Foundry 工具链（forge/anvil/cast）
- `.env.local` 仅本机保存，不入库

## 2) 启动本地链（anvil）
```bash
D:\software\Foundry\anvil.exe --chain-id 1337 --accounts 10 --balance 10000 --host 127.0.0.1 --port 8545 --mnemonic "test test test test test test test test test test test junk"
```

## 3) 部署合约（本地）
```bash
cd contracts/gas-subsidy
forge test --gas-report
forge script Deploy --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast
forge script DeployVoucher --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast
# 记录 DeployVoucher 输出的 VoucherNFT 地址
```

## 4) 配置环境变量
```bash
./scripts/set-env.ps1 -Network anvil -RpcUrl http://127.0.0.1:8545 `
  -DemoAddress 0x5FbDB2315678afecb367f032d93F642f64180aa3 `
  -SponsorPrivateKey 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603c9a21c087 `
  -VoucherAddress 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 `
  -DefaultChainId 1337 -Write
```

## 5) 启动前端
```bash
npm install
npm run dev
```
- 演示页面：`http://localhost:3000/subsidy`
- 控制台：`http://localhost:3000/console`

- 使用消费券抵扣前需先在钱包中授权补贴账户一次（授权成功后，抵扣动作不再弹出钱包交易确认）。
