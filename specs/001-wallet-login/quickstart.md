# quickstart.md - Wallet 登录与初始落地页

## 环境准备
1) Node.js 20+，npm/pnpm 任一。  
2) 安装依赖：`npm install`。  
3) 复制 `.env.example` -> `.env.local`，填写：
   - `NEXT_PUBLIC_SEPOLIA_RPC_URL`（公开测试网 RPC，可使用公共节点）  
   - `NEXT_PUBLIC_MONAD_TESTNET_RPC_URL`（测试网 RPC，若未定可留空并暂不启用）  
   - `NEXT_PUBLIC_APP_NAME`、`NEXT_PUBLIC_APP_DESC`（展示文案）
4) 可选：本地链 `anvil`（Foundry）用于 E2E/模拟，命令：`anvil --chain-id 31337`.

## 运行开发环境
```bash
npm run dev
# 打开 http://localhost:3000
```

## 测试
- 单元/组件：`npm test`
- 类型检查：`npm run typecheck`
- 端到端（Playwright）：`npx playwright test`（需先运行 dev，或使用 Playwright MCP 远程驱动浏览器）
- 合约（若有）：`forge test --gas-report`

## 钱包/网络说明
- 默认支持：Sepolia (11155111)、Monad 测试网 (20143 待确认)、本地 anvil (31337)。
- 不支持网络时，会提示切换；拒绝授权会保持未登录状态并提示错误。

## 预期体验
- 首屏展示项目/简历摘要 + 连接钱包按钮。
- 连接成功后显示钱包地址/标识；刷新后自动恢复或提示重连。
- 账户/网络切换实时更新状态；可随时断开。
