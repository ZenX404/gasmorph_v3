# Data Model — Gas 补贴演示页面

## Entities

### SubsidyConfig
- `networkId` (uint256 / string): 目标链 ID（固定支持 anvil/Sepolia/Monad）。  
- `subsidyEnabled` (bool): 补贴开关。  
- `sponsorAddress` (address): 代付账户/合约地址（paymaster 或 EOA sponsor）。  
- `paymasterType` (enum): `erc4337` | `sponsor-eoa` | `simulated`.  
- `spendLimit` (uint256): 可选，每次/每日补贴上限。  
- `gasPriceCap` (uint256): 可选，补贴容忍的 gasPrice 上限。  
- `environment` (enum): `local` | `testnet`.  
- `updatedAt` (timestamp): 最近配置时间。

### OperationRecord
- `opId` (string/uuid): 客户端生成的操作标识。  
- `sender` (address): 用户地址。  
- `networkId` (uint256): 操作所在链。  
- `isSubsidized` (bool): 是否补贴。  
- `txHash` (bytes32?): 交易哈希（可能为空：模拟模式）。  
- `blockNumber` (uint64?): 包含区块号（模拟则为空）。  
- `gasUsed` (uint256?): 实际耗费 Gas（模拟可为预估值）。  
- `gasPayer` (address): 费用承担方（用户/项目方）。  
- `status` (enum): `pending` | `confirmed` | `failed` | `cancelled`.  
- `failureReason` (string?): 失败/拒绝原因。  
- `createdAt` / `confirmedAt` (timestamp?): 时间戳。  
- `explorerUrl` (string?): 区块浏览器链接便于前端展示。

### WalletAccount (测试用途)
- `privateKey` (string, secret): 仅在本地 `.env.local` 存储，不入仓。  
- `address` (address): 公钥地址。  
- `mnemonic` (string?, secret): 若使用 anvil 预置助记词，同样仅本地使用。  
- **Note**: 此实体仅用于文档描述测试账户，符合密钥治理原则。

## Relationships
- 一个 `SubsidyConfig` 适用于特定 `networkId`，前端根据当前链选择。  
- `OperationRecord` 由用户发起的单次操作生成，可绑定当前 `SubsidyConfig` 的 `paymasterType` 与 `gasPayer`。  
- `WalletAccount` 仅在本地测试上下文引用，不与生产数据关联。

## Validation Rules
- `networkId` 必须是允许列表（anvil/Sepolia/Monad），否则阻断操作。  
- 当 `paymasterType = erc4337` 时必须提供有效的 paymaster/bundler 端点；当 `sponsor-eoa` 时需确保余额充足且仅在测试/演示环境使用。  
- `txHash`、`blockNumber`、`explorerUrl` 需成对出现；模拟模式需明确标识并避免伪造真实链接。  
- `spendLimit` 与 `gasPriceCap` 仅在补贴开启时生效；超过限制需回退到用户自付或提示失败。  
- 密钥类字段禁止写入仓库；文档和 `.env.example` 仅保留占位符。
