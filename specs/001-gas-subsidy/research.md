# Phase 0 Research — Gas 补贴演示页面

## Decisions

1) 代付方案：采用 ERC-4337 账户抽象路径（EntryPoint v0.6 + bundler + paymaster）为主线；本地首选开源 bundler（eth-infinitism 参考实现）+ 最小 paymaster，测试网可切换外部 bundler。提供 EOA sponsor 直接代付脚本作为 fallback，保证离线/不可用时可演示。  
2) 网络策略：开发测试使用 Foundry (anvil) 本地链；支持一键切换至 Sepolia / Monad 测试网部署与演示。固定 chainId 校验，默认首选 Sepolia 公共 RPC，Monad 需配置 RPC。  
3) 交易路径展示：前端在操作完成后显示交易哈希、链 ID、区块号，并提供直达区块浏览器链接（测试网：Etherscan Sepolia / Monad explorer），同时在 UI 展示代付状态与费用承担方。  
4) 钱包与密钥：本地测试账户仅写入 `.env.local`（不入仓）供 anvil 启动和浏览器插件导入；`.env.example` 仅放占位符。演示/测试网使用独立账户，RPC/私钥不入仓。  
5) 客户端栈：Next.js + wagmi/RainbowKit + ethers typed bindings（优先 viem/typechain 生成）。交易跟踪与重试策略按 constitution 执行（生命周期提示、失败回退）。

## Rationale

- ERC-4337 代付是当前主流、与黑客松展示契合，可展示项目方承担 Gas 的真实链上记录。  
- Foundry 提供快速本地反馈与 gas report，满足 constitution 要求且便于 CI。  
- 显式交易路径与浏览器链接可增强可信度，满足演示场景诉求。  
- 严格密钥管理避免违背“链上安全与密钥治理”原则。  
- wagmi/RainbowKit 现有登录体验良好，减少自研成本；typed bindings降低接口不一致风险。

## Alternatives Considered

- 纯模拟代付：实现简单但缺乏说服力，放弃作为主线，仅保留 fallback。  
- 单纯 EOA 代付（无 ERC-4337）：可行但无法体现账户抽象优势，且代付流程不够现代化。  
- 自研轻量签名服务：可减少依赖但安全面增大，且与时间成本不符。

## Follow-ups / Open Items

- 选择具体 ERC-4337 开源实现（如 Stackup、Biconomy、Candide）或自部署 bundler/paymaster：在 Phase 1 设计时结合可用性与许可评估，若外部依赖不可用则使用 eth-infinitism 本地 bundler + 最小 paymaster。  
- 区块浏览器链接：Monad 测试网需确认可用 explorer 基础 URL（计划在部署前确定并配置化）。  
- Playwright MCP 测试：需要可写 test-results 路径；在运行 E2E 前清理旧的只读目录或指定输出目录。
