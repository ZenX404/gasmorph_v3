# research.md - Wallet 登录与初始落地页

## 背景与范围
- 目标：测试网环境（Sepolia、Monad 测试网）和本地 Foundry/anvil 的钱包连接与状态保持；不触及主网与真实资产。
- 场景：落地页 + 钱包连接/断开、刷新/账户/网络切换提示、项目/简历摘要呈现。

## 研究结论

### 1) 钱包连接栈（RainbowKit + wagmi + viem）
- **Decision**: 采用 RainbowKit（UI + 账户/网络切换控件） + wagmi（客户端与缓存） + viem（provider/ABI 类型安全）；保留 ethers 兼容层仅在必要时使用。
- **Rationale**: RainbowKit 自带常用钱包与网络切换 UI，wagmi/viem 在 Next App Router 友好且类型化；满足宪法的类型安全与链 ID 校验需求。
- **Alternatives**: 
  - Web3Modal + ethers：UI 需自定义，链配置需额外处理；类型安全较弱。
  - 纯 wagmi 自定义 UI：开发成本更高，影响进度。

### 2) 网络配置（Sepolia、Monad 测试网、本地 anvil）
- **Decision**: 默认启用 Sepolia (chainId 11155111)；Monad 测试网暂用 chainId 20143（官方若有更新再同步）；本地开发使用 Foundry anvil（chainId 默认 31337）。
- **Rationale**: 用户明确测试网；需要固定 chainId 以满足宪法的链交互一致性要求；本地链用于 E2E/模拟。
- **Alternatives**:
  - 仅单测试网：降低演示力。
  - 手动切换不校验 chainId：违背宪法要求且易误用主网。

### 3) UI 风格与组件
- **Decision**: 采用暗色渐变 + 玻璃拟态卡片，强调项目/简历摘要与 CTA（连接钱包 / 查看详情 / 联系）。
- **Rationale**: 突出展示与简历场景，适配 RainbowKit 暗色主题；符合现代 Web3 视觉。
- **Alternatives**:
  - 纯浅色简约：对钱包组件暗色对比度较差。
  - 重装饰霓虹风：可读性与无障碍较差。

### 4) 状态保持与刷新/变更策略
- **Decision**: 利用 wagmi connector 状态 + RainbowKit 内建的最近连接持久化；刷新后自动恢复；账户/网络变更通过 wagmi 事件更新 UI，不自动发交易。
- **Rationale**: 与库默认行为一致，减少自实现错误；满足“刷新后保持或重连提示”需求。
- **Alternatives**:
  - 自行存储钱包地址于 localStorage：有同步风险，且与库重复。

### 5) 测试策略（Playwright + Foundry）
- **Decision**: 
  - 单元/组件：Jest/RTL 验证文案、按钮状态、错误提示。
  - E2E：Playwright 使用 RainbowKit 测试模式/Injected provider mock，覆盖连接成功、拒绝、网络不兼容、刷新保持、账户/网络切换。
  - 合约/链模拟：Foundry `anvil` 提供本地 RPC，必要时用 `forge test` 为后续补贴逻辑打桩。
- **Rationale**: 对应用户要求“通过具体测试用例和 Playwright MCP 调用浏览器”；契合宪法的测试与链一致性。
- **Alternatives**:
  - 仅单元测试：无法覆盖钱包弹窗/状态持久化。
  - 实测公共测试网：不稳定且慢，作为补充而非唯一手段。

### 6) 安全与隐私声明
- **Decision**: 前端仅读取公开地址与链 ID；显式提示“不收集私钥/签名仅在用户授权时发生”；不存储敏感数据。
- **Rationale**: 对齐宪法“链上安全与密钥治理”非谈判项。
- **Alternatives**: 无合理替代。

## 待关注/假设
- Monad 测试网 chainId 暂定 20143，若官方变更需更新配置与校验。
- UI 使用 Tailwind + 自定义主题（暗色渐变/玻璃拟态）作为默认方案。
- 测试网 RPC URL、项目品牌文案需在实现时注入 `.env.*`（无敏感信息入仓）。

## 参考输出（后续文件将复用）
- 链配置：Sepolia 11155111，Monad 测试网 20143（待确认），本地 anvil 31337。
- 测试重点：连接成功/拒绝/超时、不兼容网络提示、刷新恢复、账户/网络切换、主动断开。
