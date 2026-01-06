# Data Model: 补贴活动与SDK接入

## 项目配置
- **id**: 唯一标识
- **subsidyAccountAddress**: 补贴账户公开地址
- **subsidyAccountNote**: 备注（可选）
- **checkInEnabled**: 每日签到活动开关
- **updatedAt**: 最近更新时间

## 活动
- **id**: 活动唯一标识
- **name**: 活动名称
- **startsAt**: 开始时间（Asia/Shanghai）
- **endsAt**: 结束时间（Asia/Shanghai）
- **voucherType**: 发放消费券类型
- **totalQuota**: 活动总量
- **remainingQuota**: 剩余数量
- **status**: draft | active | paused | ended | deleted
- **createdAt**: 创建时间
- **updatedAt**: 更新时间

## 活动领取记录
- **activityId**: 关联活动
- **wallet**: 用户地址
- **claimedAt**: 领取时间
- **voucherId**: 发放的消费券标识

## SDK 配置
- **projectId**: 项目标识（非敏感）
- **subsidyMode**: 补贴模式标记（由控制台配置与链上状态决定）
- **defaultNetworkId**: 默认链 ID

## Relationships
- 项目配置 1: N 活动
- 活动 1: N 活动领取记录
- 活动领取记录与用户钱包一一对应（同一用户同一活动仅一条记录）
