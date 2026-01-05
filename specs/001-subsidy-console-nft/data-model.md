# Data Model: 补贴控制台与券NFT

## 实体与字段

### 券 NFT
- **id**: 券唯一标识
- **type**: `single` | `time_window` | `time_window_1m` | `time_window_2h` | `time_window_7d`
- **owner**: 当前持有人地址
- **status**: `available` | `used` | `expired` | `burned`
- **issuedAt**: 发放时间
- **expiresAt**: 过期时间（时间段券必填）
- **usesRemaining**: 可用次数（单次券为 1；时间段券为无限次但可视化为 `unlimited`）
- **durationSeconds**: 时间段券累加总时长

**Validation rules**:
- 单次券 `usesRemaining` 必须为正整数
- 时间段券必须包含 `durationSeconds` 且 `expiresAt = issuedAt + durationSeconds`
- `owner` 必须为有效地址

### 签到记录
- **wallet**: 钱包地址
- **dayKey**: Asia/Shanghai 自然日标识（YYYY-MM-DD）
- **voucherId**: 发放的券标识
- **createdAt**: 记录时间

**Validation rules**:
- 同一 `wallet + dayKey` 仅允许一条记录

### 补贴交易记录
- **txHash**: 交易哈希
- **sender**: 发起方地址
- **networkId**: 链 ID
- **status**: `pending` | `confirmed` | `failed`
- **gasPayer**: 付费方（补贴/用户/券）
- **voucherId**: 使用的券（可选）
- **createdAt**: 记录时间

### 补贴账户摘要
- **address**: 补贴账户地址
- **balanceDelta**: 余额变动
- **lastTxAt**: 最近交易时间

### 控制台配置
- **subsidyEnabled**: 补贴开关状态
- **updatedAt**: 最后更新时间

### 发券记录
- **targetAddress**: 接收地址
- **voucherType**: 券类型
- **issuedAt**: 发放时间
- **result**: `success` | `failed`

## 关系
- 券 NFT 属于一个持有人地址（owner）
- 签到记录与券 NFT 一对一关联
- 发券记录可指向生成的券 NFT
- 补贴交易记录可引用券 NFT（可选）

## 状态流转

### 券 NFT
`available` → `used` → `burned`
`available` → `expired` → `burned`
`available` → `burned`（管理员/系统回收）

### 签到记录
`created`（单态）

### 补贴交易
`pending` → `confirmed`
`pending` → `failed`
