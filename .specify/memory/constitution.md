<!--
Sync Impact Report
- Version change: 1.0.0 -> 1.1.0
- Modified principles: 现有原则用语清理与统一（链上安全与密钥治理、智能合约质量与可审计性、链上交互一致性、全栈 TypeScript 与工程质量、可观测性与版本发布管理）
- Added sections: 新增“前端语言与可用性规范”、“测试与质量验证”原则
- Removed sections: 无
- Templates requiring updates: updated .specify/templates/plan-template.md; updated .specify/templates/spec-template.md; updated .specify/templates/tasks-template.md; updated README.md
- Follow-up TODOs: TODO(RATIFICATION_DATE) 待项目负责人确认
-->
# GasMorph v3 Dapp Constitution

## Core Principles

### 链上安全与密钥治理（非谈判项）
- MUST 在任何环境中禁止提交/记录私钥、助记词、JWT、RPC 密钥到仓库或日志；生产签名密钥必须隔离在 HSM/硬件钱包或受控密钥管理通道，测试网使用独立账户。
- MUST 以最小权限配置 RPC/第三方服务，默认启用速率限制与访问控制；敏感配置仅通过环境变量或密钥管控服务下发，并保持 `.env.example` 同步。
- MUST 对交易签名与广播步骤进行分权：前端不持有生产私钥，后端仅代理签名且需显式权限校验；前端仅调用受限的签名消息/交易接口。
**Rationale**：保护链上资产与用户资金安全，避免凭据泄露导致不可逆损失。

### 智能合约质量与可审计性
- MUST 采用 Solidity ^0.8.x，使用 Foundry 作为唯一合约测试框架，`forge test --gas-report` 必须通过且核心合约行覆盖率 ≥ 85%，关键路径需属性测试或模糊测试。
- MUST 在合约中为状态变更与关键校验事件发出 `event`，并遵循显式错误信息（自定义错误/`require`）规范；禁止未使用代码与死路径进入主网。
- SHOULD 在合约变更前运行静态分析（如 slither）与格式化（`forge fmt`）；部署脚本需可复现并记录链上地址、ABI 与部署参数。
**Rationale**：确保合约可验证、可追责，并降低审计与主网事故风险。

### 链上交互一致性
- MUST 使用类型安全 ABI（如 typechain/viem 生成）与固定 chainId 校验，禁止硬编码地址未经过配置文件引用；交易提交需设置 gas 估算失败兜底策略。
- MUST 实现交易生命周期跟踪：提交、待打包、已上链、确认（主网至少 3 个确认，测试网至少 1 个），并对重复失败做回滚与用户提示。
- SHOULD 为读取路径增加 RPC 读写分离与多提供商降级（主备节点切换），对签名消息优先采用 EIP-712。
**Rationale**：保证链上交互的可靠性、一致性与可观察性，减少用户侧失败体验。

### 全栈 TypeScript 与工程质量
- MUST 全仓库使用 TypeScript 且开启严格模式（`tsconfig.json` 中 `strict: true`）；禁止 `any`/`unknown` 漏洞与未声明类型的 API 输出。
- MUST 统一 ESLint + Prettier 或 Biome 规则，格式化与 lint 规则必须在提交前一致执行。
- MUST 通过 `npm run lint` 与 `npm run typecheck` 后方可提交/合并。
**Rationale**：提升可维护性与一致性，减少运行时类型错误。

### 前端语言与可用性规范
- MUST 所有前端页面默认使用中文界面文案与说明。
- MUST 错误提示与异常信息保持英文输出，以便对接日志与调试系统。
- SHOULD 保持关键信息（地址、交易哈希、金额）可复制且显示格式一致。
**Rationale**：面向中文用户的可读性与可达性，同时保持错误信息的工程可追踪性。

### 测试与质量验证
- MUST 所有新功能附带单元测试与页面级 E2E 测试；E2E 必须覆盖主要用户流程与关键异常路径。
- MUST PR 中包含测试运行证明（单元测试 + E2E），失败即阻断合并。
- SHOULD 对链上与后台逻辑提供最小回归测试以防止回滚。
**Rationale**：确保功能稳定性与关键路径可回归验证。

### 可观测性、版本与发布管理
- MUST 使用结构化日志，关键路径需携带请求/交易 Trace ID；对链上操作记录交易哈希、链 ID、区块号，便于追踪。
- MUST 采用语义化版本：应用与后端遵循 SemVer，合约版本以标签/ABI 版本号同步；任何破坏性合约变更需 MAJOR 提升并提供迁移方案。
- SHOULD 在发布前产出发布说明，包括迁移步骤、已知风险、回滚策略；生产环境需配置最小监控集（错误率、延迟、关键业务指标）。
**Rationale**：确保可追踪的发布节奏与运行可视性，降低回滚与排障成本。

## 技术栈与安全约束
- 前端：Next.js（App Router），优先 React Server Components；允许 Tailwind/成熟 UI 库，但必须兼容链上交互组件。
- 后端：Node.js + TypeScript，优先轻量 API 层（Next API Route / Edge Function / minimal server），所有外部请求需超时与重试策略。
- 链端：Solidity ^0.8.x，Foundry 作为唯一合约测试与部署框架；链上交互使用 viem/ethers 且强制类型安全。
- 安全：禁止在仓库存储助记词/私钥/生产 RPC Key；不同环境（dev/test/mainnet）必须使用独立账户与配置；关键依赖需定期审计与版本锁定。

## 开发流程与质量门禁
- 所有功能需先通过 spec/plan/tasks 模板，明确 Constitution Check：密钥治理与防泄漏；Foundry 测试与 gas 报告；严格 TS 与 lint/typecheck；单元测试 + 页面级 E2E；中文页面要求。
- PR 必须附带：`npm run lint`、`npm run typecheck`、`npm test`、E2E 测试结果、`forge test --gas-report`（涉及合约时）。
- 代码评审：至少 1 名合约/链上 reviewer + 1 名前端/后端 reviewer；安全相关改动需额外安全复核。
- 文档：更新 README/spec/tasks 中的接口、环境变量、部署流程；合约发布需记录部署地址、ABI、验证链接。

## Governance
- 本宪法优先级高于其他流程文档；任何例外必须在 PR 中注明并获双人批准（含至少一名技术负责人）。
- 修订流程：通过 PR 提交，说明变更与预期影响；根据变更幅度调整版本号（SemVer）；通过后更新 Last Amended 并触发一次 Constitution Check 对齐。
- 合规审查：每次发布前、每次合约部署前必须复核宪法遵循情况（安全、测试、类型、日志、版本）。
- 版本政策：MAJOR 表示核心原则或治理破坏性调整；MINOR 表示新增/扩充原则或流程；PATCH 表示措辞澄清或微调，不改变约束。

**Version**: 1.1.0 | **Ratified**: TODO(RATIFICATION_DATE) | **Last Amended**: 2025-12-26 14:20:52


