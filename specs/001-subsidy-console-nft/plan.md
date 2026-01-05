# Implementation Plan: 补贴控制台与券NFT

**Branch**: `001-subsidy-console-nft` | **Date**: 2025-12-26 10:34:56 | **Spec**: specs/001-subsidy-console-nft/spec.md
**Input**: Feature specification from `/specs/001-subsidy-console-nft/spec.md`

## Summary

新增独立控制台与演示页分离的体验，控制台提供补贴开关、补贴账户摘要、交易明细与发券能力；演示页强化补贴展示并新增签到券 NFT（铸造/转赠/销毁）功能。补贴核心逻辑保持既有模式，NFT 采用主流链上标准实现，预留图表与补贴策略扩展位。

## Technical Context

**Language/Version**: TypeScript 5.x，Solidity ^0.8.x  
**Primary Dependencies**: Next.js 16 App Router，React 19，wagmi 2，viem 2，RainbowKit 2，Tailwind CSS 4，Foundry  
**Storage**: 主要链上存储（券 NFT 与补贴事件）；无持久化数据库（可通过事件聚合生成控制台视图）  
**Testing**: Jest，Playwright，Foundry (`forge test --gas-report`)  
**Target Platform**: 现代浏览器 Web 应用（本地 anvil/测试网）
**Project Type**: Web application  
**Performance Goals**: 页面首屏 < 2s；关键交互（签到/发券/切换）在 3s 内反馈  
**Constraints**: 控制台公开访问且可操作；补贴核心逻辑保持现状；敏感信息不得出现在仓库或页面  
**Scale/Scope**: 演示级规模（单链、单实例、有限用户量）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- 密钥与敏感配置不得入库或输出日志（必须使用环境变量）
- 合约使用 Solidity ^0.8.x 且 Foundry 测试通过（含 gas report）
- 全仓 TypeScript、无 `any/unknown` 漏洞；输入输出需校验
- 交易生命周期与失败处理需可追踪并明确提示
- 发布前需通过 `npm run lint`/`npm run typecheck`/`npm test`

## Project Structure

### Documentation (this feature)

```text
specs/001-subsidy-console-nft/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── api/
├── components/
├── lib/
└── (marketing)/

contracts/
└── gas-subsidy/

public/
styles/

scripts/

tests/
```

**Structure Decision**: 使用现有 Next.js App Router 结构；新增控制台与 NFT 相关页面与组件，合约扩展位于 `contracts/gas-subsidy`。

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
