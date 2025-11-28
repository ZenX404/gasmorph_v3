# Implementation Plan: Gas 补贴演示页面

**Branch**: `001-gas-subsidy` | **Date**: 2025-11-28 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-gas-subsidy/spec.md`

## Summary

- 目标：在演示页面直观展示 Gas 补贴开启/关闭的差异，包含真实测试网交易路径、交易哈希与可追溯查询，证明项目方代付。  
- 范围：支持 Foundry 本地测试网开发与自动化测试，一键切换至 Sepolia / Monad 测试网部署演示；采用成熟的账户抽象（ERC-4337）方案为代付主路径，保留模拟/本地 fallback 以便离线和快速迭代。  
- 产出：页面交互（补贴开关、操作触发、费用对比）、合约与代付路径、可视化与查询入口（含 tx hash 链接）、测试与快速启动文档。

## Technical Context

**Language/Version**: TypeScript（前后端全栈），Solidity ^0.8.x  
**Primary Dependencies**: Next.js App Router + Tailwind，ethers.js（typed bindings），RainbowKit/wagmi，Foundry (forge/cast/anvil)，ERC-4337 stack（bundler + paymaster，可选开源实现），Playwright MCP  
**Storage**: 暂无持久化（前端状态为主；链上数据由 RPC 查询）  
**Testing**: Foundry (`forge test --gas-report`)，Playwright MCP（E2E，含真实浏览器扩展与模拟双模式），前端单测/集成测按需  
**Target Platform**: Web (Next.js) + EVM 测试网（Foundry 本地、Sepolia、Monad）  
**Project Type**: Web 前后端一体（Next.js）+ 合约/脚本  
**Performance Goals**: UI 状态回显 < 2s；交易提交到回执在测试网 < 10s；演示首屏 < 3s  
**Constraints**: 禁止提交私钥/助记词；钱包/网络仅限 Foundry 本地、Sepolia、Monad；必须输出交易哈希与可查链接；代付路径优先 ERC-4337，需有本地/模拟 fallback；链上交互需 chainId 校验  
**Scale/Scope**: 单页演示 + 最小必要合约/脚本 + 代付路径与可视化

## Constitution Check

GATE（必须满足；本计划均遵守）：  
- 密钥管理：不得提交私钥；本地测试私钥仅写入 `.env.local`/`.env.example` 占位并用于导入浏览器插件，演示/测试网账户隔离。  
- 合约质量：Solidity ^0.8.x；Foundry 唯一测试框架；`forge test --gas-report` 必须通过，核心合约行覆盖率≥85%，重要路径需事件与错误提示。  
- 链上交互一致性：固定 chainId 校验；EIP-1559 费用；交易生命周期跟踪（提交/待打包/上链/确认），失败需回滚提示。  
- 可观测性：输出交易哈希、链 ID、区块号；日志含 Trace ID；提供交易详情查询入口。  
- 版本与文档：SemVer；发布前更新 README/spec/tasks，记录合约地址、ABI、部署参数；前后端共享类型/ABI。  
结论：无豁免项，允许进入 Phase 0。

## Project Structure

### Documentation (this feature)

```text
specs/001-gas-subsidy/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md          # /speckit.tasks 生成
```

### Source Code (repository root)

```text
contracts/
└── gas-subsidy/          # Foundry 子项目：paymaster/示例合约、脚本、tests

app/
├── (marketing)/subsidy/  # 演示页面路由
├── components/           # UI：补贴开关、交易路径卡片、费用对比
├── lib/                  # 链配置、ERC-4337 客户端、ethers 封装、tx tracker
└── api/                  # （若需）后台代理/签名/链上查询 API routes

tests/
├── e2e/                  # Playwright MCP：连接/切链/补贴开关/交易路径
├── integration/          # 前端/接口集成
└── unit/                 # 组件与纯函数单测（按需）
```

**Structure Decision**: Next.js 单仓前后端一体；新增 `contracts/gas-subsidy` Foundry 目录；前端在 `app/(marketing)/subsidy` 落地页面与组件；链上交互封装在 `app/lib`；E2E 于 `tests/e2e`。

## Complexity Tracking

当前无需复杂度豁免。
