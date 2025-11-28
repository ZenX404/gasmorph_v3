# Quickstart — Gas 补贴演示页面

## 1) 环境与依赖
- Node.js (与仓库一致版本)，pnpm/npm 安装依赖。  
- Foundry 安装完成（包含 `forge`/`anvil`/`cast`）。  
- Playwright MCP 已可用（无需本地安装 Playwright）。  
- `.env.local`：填写本地/测试网 RPC、测试私钥（仅本地保存）。  
- `.env.example`：保留占位符，不放真实私钥。

## 2) 启动 Foundry 本地链 (anvil)
```bash
anvil --chain-id 31337 --accounts 10 --balance 1000000000000000000000 \
  --mnemonic "test test test test test test test test test test test junk"
```
- 记录生成账户私钥与地址（anvil 启动日志），导入浏览器插件钱包用于 Playwright MCP。  
- 仅本地使用，勿提交日志/私钥。

## 3) 部署合约（本地）
```bash
cd contracts/gas-subsidy
forge test --gas-report      # 确保通过
forge script Deploy --rpc-url http://127.0.0.1:8545 --private-key $LOCAL_PK --broadcast
```
- 输出部署地址、paymaster/示例合约地址、EntryPoint（若使用 ERC-4337），记录到 README/spec/tasks。  
- 若使用 ERC-4337 bundler/paymaster，本地可运行最简 paymaster 或使用开源实现的本地模式。

## 4) 前端开发
```bash
npm install
npm run dev
```
- 打开 `http://localhost:3000/subsidy` 演示页面。  
- 默认首选 Sepolia 网络配置；本地调试可在 UI/`.env.local` 切换到 anvil。

## 5) 交易路径与查询
- 执行示例操作后，页面显示：交易哈希、链 ID、区块号、费用承担方、补贴开关状态。  
- 点击交易哈希可跳转区块浏览器（Sepolia/Monad 配置对应 base URL；本地可展示复制哈希与 cast 查询提示）。

## 6) Playwright MCP 测试
- 确保本地链/前端已运行，浏览器插件钱包导入 anvil 账户。  
- 运行 E2E（可指定输出目录避免只读路径）：`npm run playwright -- --reporter=line --output=./tmp-playwright`  
- 覆盖：连接/切链/补贴开关/交易提交/断开。

## 7) 切换到真实测试网
- 更新 `.env.local` RPC、paymaster/bundler、sponsor 私钥（不可入仓）。  
- 重新部署合约到 Sepolia / Monad，记录地址与 ABI。  
- 前端将默认网络切换为 Sepolia，保留 Monad 选项；确认 explorer 链接可用。  
- 回归测试：`forge test --gas-report`、`npm run lint && npm run typecheck`、Playwright MCP。
