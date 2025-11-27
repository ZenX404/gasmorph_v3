# GasMorph v3 Dapp（Wallet 登录与初始落地页）

基于 Next.js App Router 的 Web3 展示项目，当前阶段聚焦测试网钱包登录与落地页体验（Sepolia、Monad 测试网、本地 anvil）。

## 快速开始

```bash
npm install
cp .env.example .env.local  # 填写公开 RPC 与文案
npm run dev
# 打开 http://localhost:3000
```

环境变量（仅放公开信息）：
- `NEXT_PUBLIC_SEPOLIA_RPC_URL`
- `NEXT_PUBLIC_MONAD_TESTNET_RPC_URL`（可留空，未定时不启用）
- `NEXT_PUBLIC_APP_NAME`、`NEXT_PUBLIC_APP_DESC`

## 测试
- 单元/组件：`npm test`
- 类型检查：`npm run typecheck`
- E2E：`npx playwright test`（需运行 dev，或用 Playwright MCP 远程驱动）
- 合约（若有）：`forge test --gas-report`

## 钱包与网络
- 支持链：Sepolia (11155111)、Monad 测试网 (20143，若官方更新请同步)、本地 anvil (31337)。
- 不支持网络会提示切换；拒绝授权保持未登录并提示错误。

## 隐私与安全
- 前端不会收集或存储私钥，仅在用户授权后读取公开账户信息。
- 禁止将私钥/助记词/RPC 机密提交到仓库；`.env.example` 仅含公开项。

## 贡献
修改入口：`app/page.tsx`、`app/components/*`。执行 `npm run lint && npm run typecheck && npm test` 确认无报错；合约存在时执行 `forge test --gas-report`。***
