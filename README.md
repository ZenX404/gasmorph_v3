# GasMorph v3 Dapp（Gas 补贴演示）

基于 Next.js App Router 的 Web3 演示项目，聚焦测试网钱包登录与 Gas 补贴体验（Sepolia、Monad 测试网、本地 anvil）。

## 快速开始
```bash
npm install
cp .env.example .env.local   # 填写公开 RPC，占位留空，真实私钥仅放 .env.local（不入库）
npm run dev
# 访问 http://localhost:3000/subsidy
# 控制台 http://localhost:3000/console
```
更多细节见 `specs/001-gas-subsidy/quickstart.md`。

## 环境变量（仅放公开信息）
- `NEXT_PUBLIC_ANVIL_RPC_URL`
- `NEXT_PUBLIC_SEPOLIA_RPC_URL`
- `NEXT_PUBLIC_MONAD_TESTNET_RPC_URL`（可留空，未配则不启用）
- `NEXT_PUBLIC_VOUCHER_CONTRACT_ADDRESS`（仅本地/测试网，券 NFT 地址）
- `NEXT_PUBLIC_APP_NAME`、`NEXT_PUBLIC_APP_DESC`
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- `BUNDLER_RPC_URL`、`PAYMASTER_RPC_URL`、`SPONSOR_PRIVATE_KEY`（仅本地/测试网，勿提交）

> 推荐使用 `scripts/set-env.ps1` 生成/更新 `.env.local`（仅本地保存，勿入库）。

## 链与钱包
- 支持链：Sepolia (11155111)、Monad 测试网 (20143)、本地 anvil (1337)
- 本地 anvil 示例：`anvil --chain-id 1337 --port 8545 --accounts 10 --balance 10000 --mnemonic "test test ... junk"`
- 不支持的网络会提示切换；拒绝授权保持未登录并提示错误

## 测试
- 类型检查：`npm run typecheck`
- Lint：`npm run lint`
- 单元/组件：`npm test`
- E2E：`npm run playwright`（需 dev 运行，或用 Playwright MCP 远程驱动；默认 skip，需真实钱包与支持网络后开启）
- 合约：`forge test --gas-report`

## 隐私与安全
- 前端不收集或存储私钥，仅在授权后读取公开账户信息
- 禁止将私钥/助记词/RPC 凭据提交到仓库；`.env.example` 仅含公开项

## 贡献
主要入口：`app/(marketing)/subsidy/page.tsx`、`app/components/*`、`app/api/*`。提交前请跑 `npm run lint && npm run typecheck`，如涉及合约请跑 `forge test --gas-report`。


## 质量门禁
- 新功能必须包含单元测试与页面级 E2E
- 提交前必须通过 `npm run lint` 与 `npm run typecheck`
