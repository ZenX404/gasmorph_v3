# Implementation Plan: 补贴活动与SDK接入

**Branch**: `001-subsidy-activity-sdk` | **Date**: 2026-01-06 | **Spec**: D:\workspace\GasMorph_v3\gasmorph_v3\specs\001-subsidy-activity-sdk\spec.md
**Input**: Feature specification from `D:\workspace\GasMorph_v3\gasmorph_v3\specs\001-subsidy-activity-sdk\spec.md`

## Summary

在保持现有补贴演示方案不变的前提下，新增控制台补贴账户公开配置、签到开关、活动管理与演示页活动领取，并提供 `@gasmorph/sdk` TypeScript 类库以低侵入方式接入补贴与消费券能力。SDK 与活动配置一一对应，演示页面使用 SDK 完成发券与补贴流程。

## Technical Context

**Language/Version**: TypeScript 5.x（严格模式），Node.js 20+  
**Primary Dependencies**: Next.js 16 App Router、React 19、viem、wagmi、RainbowKit、zod  
**Storage**: 演示环境以内存存储为主（现有 store 方案），敏感信息不落库  
**Testing**: Jest（单元/组件）、Playwright（页面级 E2E）、Foundry（合约）  
**Target Platform**: Web（浏览器 + Node.js API routes）  
**Project Type**: Web 应用 + SDK 子包  
**Performance Goals**: 控制台配置/活动变更 2 秒内反映；演示页活动列表 5 秒内同步  
**Constraints**: 中文 UI、英文错误提示；不存储敏感补贴账户信息；SDK 不暴露项目方密钥  
**Scale/Scope**: 单项目演示视角；未来可扩展多项目与权限

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- 密钥治理：补贴账户敏感信息不存储、不记录日志，生产密钥不进入前端或 SDK
- 中文 UI / 英文错误提示：新增页面与提示遵循规范
- 新功能测试：单元测试 + 页面级 E2E
- 工程质量：TypeScript 严格模式，lint + typecheck 通过
- Phase 0: Pass
- Phase 1: Pass

## Project Structure

### Documentation (this feature)

```text
specs/001-subsidy-activity-sdk/
  plan.md              # This file (/speckit.plan command output)
  research.md          # Phase 0 output (/speckit.plan command)
  data-model.md        # Phase 1 output (/speckit.plan command)
  quickstart.md        # Phase 1 output (/speckit.plan command)
  contracts/           # Phase 1 output (/speckit.plan command)
  tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
  (marketing)/
    subsidy/
    console/
  api/
    console/
    demo/
    subsidy/
  components/
  lib/

packages/
  sdk/                  # @gasmorph/sdk TypeScript library

contracts/
  gas-subsidy/

tests/
  unit/
  integration/
  e2e/
```

**Structure Decision**: 使用现有 Next.js App Router 结构，并新增 `packages/sdk` 作为 SDK 子包。

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
