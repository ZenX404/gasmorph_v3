# data-model.md - Wallet 登录与初始落地页

## 实体概览

### 访客会话 (VisitorSession)
- **字段**：
  - `sessionId`：前端生成的会话标识（用于日志/埋点）。
  - `status`：`unauthenticated | connecting | connected | error`.
  - `lastConnectedAt`：最近一次连接完成时间。
  - `network`：当前链信息（chainId、名称、是否受支持）。
  - `account`：当前钱包地址（公开）。
  - `error`：最近一次错误的可展示文案。
- **规则**：
  - 刷新后可恢复；错误状态需可清除。
  - 不存储私钥/签名，仅公开信息。

### 钱包身份 (WalletIdentity)
- **字段**：
  - `address`：当前账户地址。
  - `ensOrName`：可选的名称/ENS（若可用）。
  - `avatar`：可选头像。
- **规则**：
  - 来源于钱包授权；可变更时需触发 UI 更新。

### 网络配置 (NetworkConfig)
- **字段**：
  - `chainId`：11155111（Sepolia），20143（Monad 测试网，待确认），31337（本地 anvil）。
  - `rpcUrl`：从环境变量注入；不入仓。
  - `blockExplorer`：可选，仅用于显示。
  - `supported`：是否允许连接。
- **规则**：
  - 非受支持网络需给出切换指引，不发起交易。

### 展示摘要 (ShowcaseSummary)
- **字段**：
  - `headline`：项目主标题。
  - `bullets`：3-5 条卖点/能力点。
  - `ctaLinks`：如“查看详情”“联系”。
- **规则**：
  - 登录前后均可见，登录后可显示钱包标识和欢迎语。

## 状态流与关系
- VisitorSession 关联 WalletIdentity 与 NetworkConfig；ShowcaseSummary 独立但依赖 session 状态做文案调整。
- 账户/网络变更 -> 更新 VisitorSession 与 WalletIdentity/NetworkConfig。
- 退出 -> 清理 VisitorSession/WalletIdentity 状态，恢复未登录视图。
