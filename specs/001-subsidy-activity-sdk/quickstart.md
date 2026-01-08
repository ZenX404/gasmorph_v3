# Quickstart · 补贴活动与SDK接入

## 1) 环境准备
- Node.js（与仓库锁定版本一致）
- Foundry 工具链（forge/anvil/cast）
- `.env.local` 仅本机保存，不入库

## 2) 启动本地链（anvil）
```bash
D:\software\Foundry\anvil.exe --chain-id 1337 --accounts 10 --balance 10000 --host 127.0.0.1 --port 8545 --mnemonic "test test test test test test test test test test test junk"
```

## 3) 自动部署并写入配置（推荐）
脚本会部署合约、写入 `.env.local`，并自动更新本文件中的最新地址。
```bash
./scripts/bootstrap-anvil.ps1 -RpcUrl http://127.0.0.1:8545 -UpdateDocs
```

## 本地部署输出（自动写入）
- Demo 合约地址：`0xdc64a140aa3e981100a9beca4e685f962f0cf6c9`
- Voucher 合约地址：`0x5fc8d32690cc91d4c39d9d3abcbd16989f875707`
- Sponsor 私钥：`0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603c9a21c087`

## 4) 启动前端
```bash
npm install
npm run dev
```
- 演示页面：`http://localhost:3000/subsidy`
- 控制台：`http://localhost:3000/console`

## 5) 演示流程
1) 控制台填写补贴账户公开信息并保存（不录入任何密钥）。
2) 在控制台创建活动（名称/时间/券类型/总量），开启活动。
3) 演示页面刷新后显示活动卡片，点击“完成活动”领取消费券。
4) 演示页面通过 SDK 调用补贴、签到与活动发券逻辑并展示结果。

## 6) SDK 使用（本地演示）
```ts
import { GasMorphClient } from "@gasmorph/sdk";

const sdk = new GasMorphClient();
const activities = await sdk.listActivities(\"0x...\");
```

## 7) 测试
- 类型检查：`npm run typecheck`
- Lint：`npm run lint`
- 单元测试：`npm test`
- 页面级 E2E：`npm run playwright`（需先运行 dev）




