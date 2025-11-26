<!--
Sync Impact Report
- Version change: N/A -> 1.0.0
- Modified principles: 首次定义（5项核心原则）
- Added sections: 技术栈与安全约束; 开发流程与质量门禁
- Removed sections: 无
- Templates requiring updates: ✅ .specify/templates/plan-template.md（宪法检查需覆盖密钥治理、Foundry测试、类型安全、观测与版本要求）；✅ .specify/templates/spec-template.md（用户故事与验收需映射链上/前后端测试）；✅ .specify/templates/tasks-template.md（任务需按用户故事分组，包含合约/链交互/前端/后端与测试分层）；⚠️ 无
- Follow-up TODOs: TODO(RATIFICATION_DATE) 待项目负责人确认
-->
# GasMorph v3 Dapp Constitution

## Core Principles

### 链上安全与密钥治理（非谈判项）
- MUST 在任何环境中禁止提交/记录私钥、助记词、JWT、RPC 密钥到仓库或日志；生产签名密钥必须隔离在 HSM/硬件钱包或受控密钥管道，测试网使用独立账户。
- MUST 以最小权限配置 RPC/第三方服务，默认启用速率限制与访问控制；敏感配置仅通过环境变量或密钥管控服务下发，并保持 `.env.example` 同步。
- MUST 对交易签名与广播步骤进行分权：前端不持有生产私钥，后端仅代理签名且需显式权限验证；前端仅调用签名消息/交易的受限接口。
**Rationale**：保护链上资产与用户资金安全，避免凭据泄露导致不可逆损失。

### 智能合约质量与可审计性
- MUST 采用 Solidity ^0.8.x，使用 Foundry 作为唯一测试框架，`forge test --gas-report` 必须通过且核心合约行覆盖率≥85%，关键路径需属性测试或模糊测试。
- MUST 在合约中为状态改变与关键校验事件发出 `event`，并遵循显式错误信息（自定义错误/`require`）规范；禁止未使用的代码与死路径进入主网。
- SHOULD 在合约变更前运行静态分析（如 slither）和格式化（`forge fmt`）；部署脚本需可复现并记录链上地址、ABI 与部署参数。
**Rationale**：确保合约可验证、可追责，并降低审计与主网事故风险。

### 链上交互一致性（ethers.js）
- MUST 使用类型安全的 ABI（`typechain`/`viem` 生成）与固定 chainId 校验，禁止硬编码地址未经配置文件引用；交易提交需设置 gas 估算失败兜底策略。
- MUST 实现交易生命周期跟踪：提交、待打包、已上链、确认（主网至少 3 个确认，测试网至少 1 个），并对重组/失败做回滚与用户提示。
- SHOULD 为读取路径增加 RPC 读写分离与多提供商降级（主备节点切换），对签名消息采用 EIP-712 优先。
**Rationale**：保证链上交互的可靠性、一致性与可观察性，减少用户侧失败体验。

### 全栈 TypeScript + Next.js/Node.js 规范
- MUST 全仓库 TypeScript，无 `any`/`unknown` 漏洞；前端使用 Next.js App Router，服务端 API/后端服务使用 Node.js + TypeScript，输入输出需通过模式校验（推荐 zod/类似方案）。
- MUST 维护共享类型/ABI 层（如 `@/lib/contracts`），前后端共用，避免重复定义；数据获取需声明缓存策略与错误兜底（SSR/CSR 明确）。
- MUST 保持基础工程质量门禁：`npm test`、`npm run lint`、`npm run typecheck` 全绿方可合并；前端组件与合约调用需有最小可行单元测试或合约交互冒烟测试。
**Rationale**：提升可维护性与一致性，减少运行时类型错误。

### 可观察性、版本与发布管理
- MUST 使用结构化日志，关键路径需携带请求/交易 Trace ID；对链上操作记录交易哈希、链 ID、区块号，便于追踪。
- MUST 采用语义化版本：应用与后端遵循 SemVer，合约版本以标签/ABI 版本号同步；任何破坏性合约变更需要 MAJOR 提升并提供迁移方案。
- SHOULD 在发布前产出发布说明，包含迁移步骤、已知风险、回滚策略；生产环境需配置最小监控集（错误率、延迟、关键业务指标）。
**Rationale**：确保可追踪的发布节奏与运行可视性，降低回滚与排障成本。

## 技术栈与安全约束
- 前端：Next.js（App Router），首选 React Server Components，使用 Tailwind/成熟 UI 库即可，但必须兼容链上交互组件。
- 后端：Node.js + TypeScript，优先使用轻量 API 层（Next API Route / Edge Function / minimal server），所有外部请求需超时与重试策略。
- 链端：Solidity ^0.8.x，Foundry 作为唯一合约测试与部署框架；链上交互使用 ethers.js（或附带的 typed 生成器），EIP-1559 费用模型默认开启。
- 安全：禁止在仓库存储助记词/私钥/生产 RPC Key；不同环境（dev/test/mainnet）必须使用独立账户与配置；关键依赖需定期审计与版本锁定。

## 开发流程与质量门禁
- 所有功能需先通过计划/spec/tasks 模板，明确 Constitution Check：密钥治理、防泄漏；Foundry 测试与 gas 报告；类型校验；链上交互回滚/确认策略；日志与指标要求。
- PR 必须附带：`npm run lint`、`npm run typecheck`、`npm test`、`forge test --gas-report` 的通过证据；涉及合约/链交互的变更需附交易模拟或测试网交易记录。
- 代码评审：至少 1 名合约/链上 reviewer + 1 名前后端 reviewer；安全相关改动需额外安全复核。
- 文档：更新 README/spec/tasks 中的接口、环境变量、部署流程；合约发布需记录部署地址、ABI、验证链接。

## Governance
- 本宪法优先级高于其他流程文档；任何例外必须在 PR 中注明并获双人批准（含至少一名技术负责人）。
- 修订流程：通过 PR 提交，说明变更与预期影响；根据变更幅度调整版本号（SemVer）；通过后更新 Last Amended 并触发一次 Constitution Check 对齐。
- 合规审查：每次发布前、每次合约部署前必须复核宪法遵循情况（安全、测试、类型、日志、版本）。
- 版本政策：MAJOR 代表核心原则或治理破坏性调整；MINOR 代表新增/扩充原则或流程；PATCH 代表措辞澄清或微调，不改变约束。

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE) | **Last Amended**: 2025-11-26
