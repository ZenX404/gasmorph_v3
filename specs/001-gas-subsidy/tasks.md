# Task Breakdown · Gas 补贴演示页面

## Phase 1 · Setup

- [X] T001 初始化目录与依赖（保留现有 stack），确认 `contracts/gas-subsidy` Foundry 子目录存在，预留前端入口 `app/(marketing)/subsidy`
- [X] T002 创建/更新 `.env.example` 增加 RPC 占位（anvil/Sepolia/Monad）、ERC-4337 bundler/paymaster 端点占位、sponsor 私钥占位
- [X] T003 配置 `.env.local` 本地专用说明（不入库），指引记录 anvil 生成的私钥与地址供浏览器插件导入
- [X] T004 安装/验证依赖：`npm install`、Foundry 工具链、确认 Playwright MCP 可用（无需本地安装 Playwright）

## Phase 2 · Foundational

- [X] T005 设计 ERC-4337 代付方案选型与 fallback（文档至 `specs/001-gas-subsidy/research.md` 补充）
- [X] T006 配置链清单与 explorer 基础 URL（anvil/Sepolia/Monad）至 `app/lib/chains.ts` 或等效配置文件
- [X] T007 初始化 Foundry 项目骨架：`contracts/gas-subsidy`（remappings、foundry.toml、script/Deploy.s.sol 占位）
- [X] T008 [P] 编写最小示例合约调用目标（演示用）与接口定义 `contracts/gas-subsidy/src/Demo.sol`
- [X] T009 [P] 设计/实现 paymaster 或 sponsor EOA 代付脚本接口 `contracts/gas-subsidy/src/Paymaster.sol` 或 `script/Sponsor.s.sol`
- [X] T010 配置 typed bindings 生成流程（typechain/viem）指向示例合约与 paymaster ABI
- [X] T011 前端链交互基础封装：wagmi/ethers 客户端、chainId 强校验、EIP-1559 费用策略 `app/lib/wagmiClient.ts`
- [X] T012 日志与 Trace ID 规范：前后端调用携带 requestId，链上操作回执记录 txHash/chainId/blockNumber

## Phase 3 · User Story 1（P1）钱包连接与补贴开关

- [X] T013 [US1] UI：演示页基础框架与布局 `app/(marketing)/subsidy/page.tsx`
- [X] T014 [US1] 组件：钱包连接与网络切换入口（RainbowKit/wagmi），支持 anvil/Sepolia/Monad `app/components/ConnectWalletButton.tsx`
- [X] T015 [US1] 组件：补贴开关（会话内记忆、提示补贴状态与链 ID）`app/components/SubsidyToggle.tsx`
- [X] T016 [US1] 状态：接入链支持校验，非支持网络显示阻断与切链提示 `app/lib/networkGuard.ts`
- [X] T017 [US1] 文案与隐私提示（仅使用地址与链 ID，不收集隐私）`app/(marketing)/subsidy/page.tsx`
- [X] T018 [US1] 测试：Playwright MCP 流程（连接、切链、补贴开关切换）`tests/e2e/subsidy/connect-and-toggle.spec.ts`

## Phase 4 · User Story 2（P1）补贴前后交易体验对比

- [X] T019 [US2] 后端/API：示例操作触发接口 `/api/subsidy/execute`（支持 erc4337 | sponsor-eoa | simulated）`app/api/subsidy/execute/route.ts`
- [X] T020 [US2] 后端/API：状态查询接口 `/api/subsidy/status` 返回 txHash/状态/费用承担方 `app/api/subsidy/status/route.ts`
- [X] T021 [US2] 前端：示例操作触发按钮与进度提示 `app/components/ActionCard.tsx`
- [X] T022 [US2] 前端：交易生命周期回显（提交/待打包/已上链/失败）`app/components/TxStatus.tsx`
- [X] T023 [US2] 集成 ERC-4337 交互：UserOp 构建与提交（可配置 bundler/paymaster），fallback 为 sponsor EOA 或模拟 `app/lib/erc4337Client.ts`
- [X] T024 [US2] 合约脚本：示例操作执行脚本 + 代付路径（Forge script 或 bundler 调用）`contracts/gas-subsidy/script/ExecuteDemo.s.sol`
- [X] T025 [US2] 合约测试：Foundry `forge test --gas-report` 覆盖示例合约与代付路径 `contracts/gas-subsidy/test/Demo.t.sol`
- [X] T026 [US2] E2E：Playwright MCP 覆盖补贴关闭→用户自付、补贴开启→项目方代付双路径 `tests/e2e/subsidy/subsidy-on-off.spec.ts`
- [X] T035 [US2] 异常回退逻辑：钱包拒绝/取消、paymaster 不可用或额度不足、网络不支持时回退为自付或提示中断（前端状态机与提示文案）`app/components/TxStatus.tsx`
- [X] T036 [US2] API 异常处理：/api/subsidy/execute 与 /api/subsidy/status 返回可读错误并标记回退策略（自付/重试/中断）`app/api/subsidy/*`
- [X] T037 [US2] E2E 异常场景：拒绝签名、切换到不支持网络、paymaster 不可用时的 UI/回退验证 `tests/e2e/subsidy/subsidy-fallback.spec.ts`

## Phase 5 · User Story 3（P2）费用对比与可视化

- [X] T027 [US3] 数据模型：OperationRecord 持久于前端 state 结构调整，存储 txHash/blockNumber/gasUsed/gasPayer `app/lib/operations.ts`
- [X] T028 [US3] 组件：费用对比卡片（未补贴 vs 已补贴 vs 节省比例）`app/components/CostComparison.tsx`
- [X] T029 [US3] 组件：交易路径与 explorer 链接展示（含复制哈希、本地 cast 查询提示）`app/components/TxPath.tsx`
- [X] T030 [US3] 刷新与数据一致性：操作后刷新对比数据与图表 `app/(marketing)/subsidy/page.tsx`
- [X] T031 [US3] 测试：前端可视化单测/集成测（数据更新与无负值校验）`tests/integration/subsidy/cost-visual.test.tsx`
- [X] T042 [US3] 交易路径展示校验：显示 txHash/chainId/blockNumber，链接正确跳转 explorer，本地模式提供复制与 cast 提示 `tests/e2e/subsidy/tx-path.spec.ts`

## Final Phase · Polish & Cross-Cutting

- [X] T032 无障碍与响应式检查；移除占位/调试文案 `app/(marketing)/subsidy/page.tsx`
- [X] T033 文档：更新 quickstart/README，补充部署地址、ABI、explorer 链接 `specs/001-gas-subsidy/quickstart.md`
- [X] T034 清理与安全审查：确保无私钥/助记词入库，`.env.example` 占位齐全，提交前跑 lint/typecheck/test/forge
- [X] T038 环境切换脚本：本地 anvil 与 Sepolia/Monad 的部署切换/配置写入（合约地址、ABI、默认网络）`scripts/set-env.ps1`
- [X] T039 前端默认网络切换与链清单校验（含 explorer URL 配置）`app/lib/chains.ts`
- [X] T040 环境验证：在 anvil 与 Sepolia 分别跑通示例操作并记录 txHash/区块号/费用承担方到 quickstart `specs/001-gas-subsidy/quickstart.md`
- [X] T041 性能与观测：记录 UI 状态回显时延与交易提交→回执耗时（简单日志埋点）`app/lib/telemetry.ts`
 - [X] T043 规范化编码：统一 `spec.md` 与 `plan.md` 为 UTF-8，人工复查中文可读性 `specs/001-gas-subsidy/spec.md; plan.md`

## Dependencies

- Phase 1 → Phase 2 → US1/US2（可并行部分，但 US2 需基座完成）→ US3 → Polish  
- US1 与 US2 可并行部分开发，但交付需先完成链配置与代付方案（T005-T012）

## Parallel Execution Examples

- 并行 A：T008/T009（合约实现）与 T011（前端链封装）并行
- 并行 B：T021-T022（前端 UI）与 T019-T020（API）并行，最终在 T026 集成验证
- 并行 C：T028-T029（可视化）与 T027（数据模型）并行，合入前完成联调

## Implementation Strategy

- MVP：完成 US1 + US2 的基础路径（含补贴开关、代付/自付双模式、交易哈希回显与 explorer 链接），本地 anvil + Sepolia 演示任选其一跑通
- 增量：补足 ERC-4337 正式路径与 Monad 网络、完善可视化与对比（US3）、打磨文案与无障碍

## Format Validation

- 所有任务均满足格式：`- [ ] T### [P?] [Story?] 描述含文件路径`
- Story 标签仅用于用户故事阶段（US1/US2/US3）
