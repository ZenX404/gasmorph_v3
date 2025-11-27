---

description: "Task list for Wallet 登录与初始落地页"

---

# Tasks: Wallet 登录与初始落地页

**Input**: Design documents from `/specs/001-wallet-login/`  
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/  

**Tests**: 包含单元/组件与 Playwright E2E（用户要求验证钱包连接流程）；Foundry 用于本地链模拟。  
**Organization**: Tasks 按用户故事分组，保证每个故事可独立实现和验证。  

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 更新 `.env.example` 增加 `NEXT_PUBLIC_SEPOLIA_RPC_URL`、`NEXT_PUBLIC_MONAD_TESTNET_RPC_URL`、`NEXT_PUBLIC_APP_NAME`、`NEXT_PUBLIC_APP_DESC`（.env.example）
- [ ] T002 安装并锁定依赖：`@rainbow-me/rainbowkit`、`wagmi`、`viem`（package.json）
- [ ] T003 配置 Tailwind 主题基础变量与暗色渐变/玻璃拟态支持（tailwind.config.*）
- [ ] T004 创建全局样式覆盖，定义背景渐变与卡片玻璃拟态样式（app/globals.css）

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T005 建立链配置与常量：Sepolia(11155111)、Monad 测试网(20143 待确认，可用环境变量覆盖)、anvil(31337)（app/lib/chains.ts）
- [ ] T006 初始化 wagmi + RainbowKit Provider，封装根级 providers（app/providers.tsx）
- [ ] T007 注入链 ID 校验与不兼容网络提示的通用 hook（app/lib/useNetworkGuard.ts）
- [ ] T008 设置结构化日志/埋点占位，记录连接状态/链 ID/账户（app/lib/logging.ts）
- [ ] T009 质量门禁脚本：统一执行 `npm run lint`、`npm run typecheck`、`npm test`（如无测试可占位）、`forge test --gas-report`（若有合约），并写入 README/quickstart 说明（package.json, docs）
- [ ] T010 Playwright 配置：无头模式、trace/video 输出、使用本地 anvil/测试网 provider mock 可运行（playwright.config.*）
- [ ] T011 anvil 启动脚本与资金账户示例：提供 chainId/预置账户/资金说明，供 E2E 使用（contracts/README.md, specs/001-wallet-login/quickstart.md）

## Phase 3: User Story 1 - 首屏展示与钱包登录 (Priority: P1) 🥇 MVP

Goal: 访客看到落地页价值主张，点击连接钱包并成功显示连接状态；拒绝授权有清晰提示。  
Independent Test: 打开首页，点击连接 -> 成功显示地址；拒绝授权 -> 留在未登录并提示。  

### Tests for User Story 1

- [ ] T012 [P] [US1] 组件测试：按钮文案/禁用态/错误提示渲染（tests/unit/landing.spec.tsx）
- [ ] T013 [P] [US1] Playwright：连接成功流程（tests/e2e/wallet-connect.spec.ts）
- [ ] T014 [P] [US1] Playwright：拒绝授权/关闭弹窗反馈（tests/e2e/wallet-connect.spec.ts）
- [ ] T015 [P] [US1] Playwright：隐私告知可见性（不收集私钥，仅读取公开信息）（tests/e2e/wallet-connect.spec.ts）

### Implementation for User Story 1

- [ ] T016 [US1] 构建落地页 Hero/摘要区块与 CTA（app/page.tsx）
- [ ] T017 [P] [US1] 封装 RainbowKit ConnectButton 样式与状态展示（app/components/ConnectWalletButton.tsx）
- [ ] T018 [US1] 登录成功状态显示钱包标识/地址与欢迎语（app/components/WalletBadge.tsx）
- [ ] T019 [US1] 错误/拒绝授权提示交互（app/components/StatusToast.tsx）
- [ ] T020 [US1] 显式隐私告知文案（不收集私钥，仅在授权后读取公开地址）（app/components/PrivacyNotice.tsx 或 app/page.tsx）

## Phase 4: User Story 2 - 连接状态保持与账号/网络变更提示 (Priority: P2)

Goal: 刷新/账户/网络切换时保持或更新状态，不兼容网络给出指引。  
Independent Test: 登录后刷新仍保持或提示重连；切换账户/网络时 UI 同步，并提示切换到受支持链。  

### Tests for User Story 2

- [ ] T021 [P] [US2] Playwright：刷新后自动恢复或提供重连入口（tests/e2e/wallet-persistence.spec.ts）
- [ ] T022 [P] [US2] Playwright：账户/网络切换状态更新与不兼容提示（tests/e2e/wallet-persistence.spec.ts）

### Implementation for User Story 2

- [ ] T023 [US2] 启用 wagmi 最近连接持久化与自动重连逻辑（app/lib/wagmiClient.ts）
- [ ] T024 [P] [US2] 账户/网络变更监听并同步 UI 状态（app/lib/useWalletEvents.ts）
- [ ] T025 [US2] 不兼容网络提示与链切换指引 UI（app/components/NetworkGuardBanner.tsx）

## Phase 5: User Story 3 - 退出与基础信息呈现 (Priority: P3)

Goal: 用户可主动断开连接，登录后看到简要项目/简历摘要与后续行动入口。  
Independent Test: 登录后可查看摘要与 CTA；点击退出恢复未登录视图。  

### Tests for User Story 3

- [ ] T026 [P] [US3] 组件测试：摘要/CTA 区块渲染与登录态切换（tests/unit/showcase.spec.tsx）
- [ ] T027 [P] [US3] Playwright：断开连接后状态重置（tests/e2e/wallet-disconnect.spec.ts）

### Implementation for User Story 3

- [ ] T028 [US3] 摘要/CTA 模块（app/components/ShowcaseSummary.tsx）
- [ ] T029 [US3] 退出/断开交互并清理会话状态（app/components/DisconnectButton.tsx）
- [ ] T030 [P] [US3] 登录后欢迎语与摘要联动（app/page.tsx）

## Phase N: Polish & Cross-Cutting Concerns

- [ ] T031 [P] A11y 与键盘操作检查，确保按钮/提示可聚焦（app/page.tsx, app/components/*）
- [ ] T032 [P] 响应式与移动端浏览器/钱包深链提示优化（app/components/*）
- [ ] T033 [P] 更新 quickstart.md/README 登录与测试说明（specs/001-wallet-login/quickstart.md, README.md）
- [ ] T034 Playwright 在 CI 无头模式通过 US1/US2/US3 场景，启用 trace/video（playwright.config.*）
- [ ] T035 Foundry anvil 本地链脚本/命令文档化（chainId/账户/资金示例）并可被 Playwright 使用（specs/001-wallet-login/quickstart.md, contracts/README.md）

## Dependencies & Execution Order

- Story 顺序：US1 ➜ US2 ➜ US3（US1 为 MVP）。
- 阶段依赖：Phase 1/2 完成后才能开始各用户故事；T009-T011 为质量与运行前置检查。

## Parallel Opportunities

- T002/T003/T004 可并行；T005-T008 完成以支撑后续，T009-T011 串行完成。
- US1：T012-T015 可并行（测试），T017 与 T018 并行，其余串行。
- US2：T021/T022 并行；T023-T025 串行。
- US3：T026/T027 并行；T028-T030 串行。

## Implementation Strategy

1. 完成 Phase 1-2，确保 provider/链配置/主题与质量门禁脚本就绪。  
2. 实现 US1（MVP）：落地页 + 连接/错误/隐私提示 + 基础测试。  
3. 扩展 US2：持久化与账户/网络变更提示。  
4. 完成 US3：退出与摘要/CTA。  
5. Polish：a11y、移动端、CI/Playwright、anvil 文档与脚本完善。
