# Implementation Plan: Wallet 登录与初始落地页

**Branch**: `001-wallet-login` | **Date**: 2025-11-26 | **Spec**: specs/001-wallet-login/spec.md  
**Input**: Feature specification from `/specs/001-wallet-login/spec.md`

**Note**: 本计划遵循宪法与命令模板要求，完成到 Phase 1（设计与契约）。后续 `/speckit.tasks` 生成 tasks.md。

## Summary

- 目标：搭建首屏落地页，完成钱包连接/断开与状态保持（刷新、账户/网络切换），展示项目摘要与后续行动入口。
- 技术路径：Next.js App Router + 全仓 TypeScript；RainbowKit + wagmi/viem（支持 Sepolia、Monad 测试网、Foundry 本地 anvil）；UI 采用简洁现代的暗色渐变 + 玻璃拟态卡片；测试覆盖组件、Playwright E2E、Foundry 本地链模拟。

## Technical Context

**Language/Version**: TypeScript（Next.js App Router，Node.js 20+ runtime）  
**Primary Dependencies**: Next.js、React、wagmi + RainbowKit + viem（ethers 兼容层视需要）、Tailwind（拟）、eslint/jest/Playwright、Foundry（合约与本地链）  
**Storage**: 暂无后端存储，前端会话/链状态为主，后续补贴逻辑再扩展  
**Testing**: 单元/组件（Jest/RTL）、E2E（Playwright，含钱包交互模拟/状态验证）、合约与链路模拟（Foundry `forge test`、`anvil`）  
**Target Platform**: Web 桌面/移动，兼容常见 EVM 钱包（浏览器扩展/移动深链）  
**Project Type**: Web 应用（前端为主，预留合约与 API 扩展）  
**Performance Goals**: 首屏可交互 < 2.5s（宽带场景）；钱包连接/退出可见反馈 < 2s；无长于 10s 的无响应等待  
**Constraints**: 仅使用测试网（Sepolia、Monad 测试网、Foundry 本地）；严禁提交私钥/助记词/RPC 机密；类型安全、链 ID 校验、状态反馈与结构化日志需符合宪法  
**Scale/Scope**: 单页落地 + 基础登录流 + 状态保持/退出 + 简要摘要展示

## Constitution Check

- 密钥与安全：禁止私钥/助记词/RPC Key 入仓；`.env.example` 同步；前端不持有生产私钥，测试使用独立账户；RainbowKit/wagmi 配置中不写死敏感信息。  
- 类型与质量：全仓库 TypeScript，无 `any/unknown` 漏洞；`npm run lint`、`npm run typecheck`、`npm test`、`forge test --gas-report`（合约存在时）为合并门禁。  
- 链上交互：固定 chainId 校验（Sepolia 11155111；Monad 测试网 20143，若官方更新再调整，可通过环境变量覆盖）；使用类型安全 ABI；连接/断开/错误需有状态提示。  
- 合约与测试：Foundry 作为唯一合约框架；交易生命周期与复现记录在补贴阶段落实。  
- 观测与版本：结构化日志记录连接状态/链 ID/账户（公开信息）；遵循 SemVer。

Gate 评估：当前阶段不触及真实交易与合约部署，规划满足 Gate，可进入 Phase 0/1。

## Project Structure

### Documentation (this feature)

```text
specs/001-wallet-login/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md   # 由 /speckit.tasks 生成
```

### Source Code (repository root)

```text
app/                     # Next.js App Router
├── page.tsx             # 首屏落地页与连接入口
├── components/          # UI 组件（按钮、状态提示、摘要卡片）
└── lib/                 # 链配置、钱包 hooks、主题配置

contracts/               # Foundry 项目（后续补贴逻辑/模拟）
├── script/
├── src/
└── test/

tests/
├── unit/                # 组件/逻辑单元测试
└── e2e/                 # Playwright E2E（钱包连接流程）
```

**Structure Decision**: 单仓前端为主，预留 Foundry contracts/ 与 Playwright e2e/，沿用 app/ 目录。

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| （空） | 当前阶段无超出宪法的例外 | N/A |
