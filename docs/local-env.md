# 本地环境配置说明（不入仓）

> 用于指导填写 `.env.local`，仅存放在开发机，不要提交到仓库或分享。

## 必填项
- `NEXT_PUBLIC_ANVIL_RPC_URL`：本地 anvil RPC，例如 `http://127.0.0.1:8545`  
- `NEXT_PUBLIC_SEPOLIA_RPC_URL`：Sepolia 公共 RPC（Infura/Alchemy 等，测试 Key）  
- `NEXT_PUBLIC_MONAD_TESTNET_RPC_URL`：Monad 测试网 RPC（如未提供可留空）  
- `NEXT_PUBLIC_VOUCHER_CONTRACT_ADDRESS`：消费券 NFT 合约地址（本地/测试网）  
- `BUNDLER_RPC_URL`：ERC-4337 bundler 端点（本地 eth-infinitism 或外部测试网服务）  
- `PAYMASTER_RPC_URL`：paymaster 服务端点（本地/外部，若使用）  
- `SPONSOR_PRIVATE_KEY`：本地/测试网 sponsor 账户私钥（仅本地；确保独立于生产账号）  
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`：RainbowKit 连接所需 project id（可用测试值）

## anvil 账户
- 启动 anvil 后，记录日志中的测试账户地址与私钥，将需要导入浏览器钱包的私钥写入 `.env.local`，方便 Playwright MCP 使用浏览器插件钱包测试。  
- 不要将私钥、助记词或 anvil 日志提交到仓库。

## 浏览器钱包导入
- 在浏览器插件（如 MetaMask）中导入上述私钥；切换到 ChainId 1337（anvil）。  
- 若测试网（Sepolia/Monad）需要资金，请使用水龙头，不要复用本地私钥。

## 提示
- 所有 `.env.*` 文件默认在 `.gitignore` 覆盖；仅 `.env.example` 允许入仓放占位符。  
- 部署到测试网后，请将合约地址、ABI、默认网络记录到 `specs/001-gas-subsidy/quickstart.md`。 

