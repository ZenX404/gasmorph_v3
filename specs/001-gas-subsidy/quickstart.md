# Quickstart · Gas 补贴演示页面

## 1) 环境与依赖
- Node.js（与仓库锁定版本一致），pnpm/npm 安装依赖
- Foundry 工具链（`forge` / `anvil` / `cast`）
- Playwright MCP 可用（无需本地安装 Playwright）
- `.env.example`：仅保留占位符，不放真实私钥
- `.env.local`：填写本地/测试网 RPC 与私钥（仅本机保存，不入库，可用 `scripts/set-env.ps1` 生成）

## 2) 启动 Foundry 本地链（anvil，chainId 1337）
```bash
anvil --chain-id 1337 --accounts 10 --balance 10000 --host 127.0.0.1 --port 8545 \
  --mnemonic "test test test test test test test test test test test junk"
```
- 记录生成的账户私钥与地址（见 anvil 日志），导入浏览器插件钱包后用于演示/自动化
- 默认账户0私钥：`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
- 仅本地使用，请勿提交任何私钥助记词

## 3) 部署合约（本地）
```bash
cd contracts/gas-subsidy
forge test --gas-report
forge script Deploy --rpc-url http://127.0.0.1:8545 --private-key $LOCAL_PK --broadcast
```
- 本地 Demo 地址：`0x5FbDB2315678afecb367f032d93F642f64180aa3`
- 如需 ERC-4337 bundler/paymaster，本地可运行简易 paymaster 或接入开源本地实现

## 4) 配置环境变量
使用脚本生成/更新（仅写入本机）：
```bash
./scripts/set-env.ps1 -Network anvil -RpcUrl http://127.0.0.1:8545 `
  -DemoAddress 0x5FbDB2315678afecb367f032d93F642f64180aa3 `
  -SponsorPrivateKey 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603c9a21c087 `
  -FaucetPrivateKey 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 `
  -DefaultChainId 1337 -Write
```
- `.env.local` 不入库；`.env.example` 保留占位符

## 5) 启动前端
```bash
npm install
npm run dev
```
- 访问 `http://localhost:3000/subsidy`
- 本地调试可通过 `.env.local` 切换到 anvil
- 开发校验：`npm run lint && npm run typecheck`

## 6) 交易路径与查询
- 执行示例操作后，页面显示：txHash、chainId、blockNumber（若有）、费用承担方、补贴开关状态
- 本地查询：`cast receipt <txHash> --rpc-url http://127.0.0.1:8545`

## 7) Playwright MCP 测试
- 确保前端与插件钱包已加载 anvil 账户
- 运行：`npm run playwright -- --reporter=line --output=./tmp-playwright`
- 覆盖：连/断链、补贴开关切换、补贴开/关的交易提交、断开

## 8) 切换到真实测试网
- 更新 `.env.local`：Sepolia/Monad RPC、demo 合约地址、sponsor 私钥（不入库）
- 重新部署到测试网，记录地址与 ABI，更新前端 explorer 链接
- 回归校验：`forge test --gas-report`、`npm run lint && npm run typecheck`、Playwright MCP

## 9) 环境记录与校验
| 环境 | RPC | 合约地址 | EntryPoint / Paymaster | 示例 txHash | 费用承担方 | 备注 |
|------|-----|----------|------------------------|-------------|------------|------|
| anvil (1337) | http://127.0.0.1:8545 | 0x5FbDB2315678afecb367f032d93F642f64180aa3 | N/A（未启用 paymaster） | TODO | TODO | 本地演示 |
| Sepolia | TODO | TODO | TODO | TODO | TODO | 对外演示 |
| Monad Testnet | TODO | TODO | TODO | TODO | TODO | 需在 `.env.local` 配置 |

> 上表为运行记录，请在完成部署与示例交易后补充 txHash 与费用承担方。

## 当前补贴实现说明（EOA 代付）
- 模式：补贴开时由 sponsor EOA 直接发链上交易付 gas（非 ERC-4337）；关闭补贴时由用户钱包发送并自付。
- 默认 sponsor（anvil #1）：  
  - 地址：`0x70997970c51812dc3a010c7d01b50e0d17dc79c8`  
  - 私钥：`0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603c9a21c087`  
  - 可通过 `NEXT_PUBLIC_SPONSOR_PRIVATE_KEY` 覆盖。
- 兜底注资：若 sponsor 余额 < 0.1 ETH，会自动用 faucet 账户（anvil #0，地址 `0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266`，私钥 `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`）转入 1 ETH。
- Gas 设置：补贴与自付路径均强制 `gasPrice = 1 gwei`，确保有真实扣费。
- 验证扣费：  
  1) 开补贴执行操作后，复制交易哈希。  
  2) `cast receipt <txHash> --rpc-url http://127.0.0.1:8545`，确认 `from` = sponsor，`gasUsed` > 0，`gasPrice` = 1 gwei。  
  3) `cast balance <sponsorAddress> --rpc-url http://127.0.0.1:8545`，余额会按 `gasUsed * 1 gwei` 小幅下降；用户地址余额保持不变。
- 若需 ERC-4337：需额外引入 EntryPoint + Bundler + Paymaster，并在补贴模式下改为发送 UserOperation（可后续扩展）。

## 补贴账户备份（当前生效）
- Sponsor（补贴账户，anvil #1）：地址 `0x70997970c51812dc3a010c7d01b50e0d17dc79c8`；私钥 `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603c9a21c087`。
- Faucet（兜底注资账户，anvil #0）：地址 `0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266`；私钥 `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`。
- 可用环境变量覆盖：`NEXT_PUBLIC_SPONSOR_PRIVATE_KEY`（补贴账户），`NEXT_PUBLIC_FAUCET_PRIVATE_KEY`（兜底账户）。
- 验证扣费：`cast receipt <txHash> --rpc-url http://127.0.0.1:8545` 确认 `from`；`cast balance <补贴地址> --rpc-url http://127.0.0.1:8545` 查看余额下降。
