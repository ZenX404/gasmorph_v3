# Research: 补贴活动与SDK接入

## Decision 1: SDK 技术栈与打包方式
**Decision**: 使用 TypeScript 编写 `@gasmorph/sdk`，作为单独子包提供 ESM/CJS 与类型定义输出。SDK 依赖保持精简，链上交互复用现有 viem 生态。
**Rationale**: TypeScript 在前端/Node 场景普遍接受，配套类型定义降低接入成本；复用 viem 与现有工程一致，便于维护与调试。
**Alternatives considered**: 
- JavaScript SDK：类型安全不足，不满足当前工程质量要求。
- 多语言 SDK：超出展示范围，增加维护成本。

## Decision 2: 补贴账户敏感信息保护
**Decision**: 控制台仅保存补贴账户公开信息（地址与备注），SDK 不接收也不持有项目方私钥；所有签名行为由项目方自有环境或外部钱包完成。
**Rationale**: 满足“GasMorph 不掌握密钥”的安全要求，降低资金风险。
**Alternatives considered**:
- 服务端代管私钥：违背安全约束，风险不可控。

## Decision 3: 活动与签到统一模型
**Decision**: 将每日签到视为可配置活动之一，并提供独立开关；活动均包含名称、起止时间、券类型、总量与状态。
**Rationale**: 统一模型便于扩展，减少多套逻辑分裂。
**Alternatives considered**:
- 单独实现签到系统：逻辑重复、管理成本更高。

## Decision 4: 活动领取规则
**Decision**: 默认每用户每活动仅可领取一次；总量耗尽或活动暂停/结束即不可领取。
**Rationale**: 规则简单可验证，符合演示需求。
**Alternatives considered**:
- 配置每用户可领取次数：增加复杂度，留待后续扩展。

## Decision 5: SDK 与演示页面联动
**Decision**: 演示页面使用 SDK 完成补贴与发券流程，SDK 的活动发券流程与控制台活动配置一一对应。
**Rationale**: 可直观展示“低侵入接入”的价值。
**Alternatives considered**:
- 演示页面绕过 SDK 直连 API：削弱 SDK 展示意义。
