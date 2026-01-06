# API Contracts: 补贴活动与SDK接入

## GET /api/console/project-config
**Purpose**: 获取项目配置（补贴账户公开信息、签到开关）。

**Response 200**
```json
{
  "subsidyAccount": {
    "address": "0x...",
    "note": "optional"
  },
  "checkInEnabled": true,
  "updatedAt": "2026-01-06T10:00:00.000Z"
}
```

## PUT /api/console/project-config
**Purpose**: 更新补贴账户公开信息与签到开关。不得提交敏感信息。

**Request**
```json
{
  "subsidyAccount": { "address": "0x...", "note": "optional" },
  "checkInEnabled": true
}
```

**Response 200**
```json
{ "result": "success", "updatedAt": "2026-01-06T10:00:00.000Z" }
```

## GET /api/console/activities
**Purpose**: 获取控制台活动列表（含状态与剩余数量）。

**Response 200**
```json
{
  "items": [
    {
      "id": "act_001",
      "name": "每日签到",
      "startsAt": "2026-01-06T00:00:00.000Z",
      "endsAt": "2026-01-31T23:59:59.000Z",
      "voucherType": "single|time_window_1m|time_window_2h|time_window_7d",
      "totalQuota": 1000,
      "remainingQuota": 900,
      "status": "active"
    }
  ]
}
```

## POST /api/console/activities
**Purpose**: 创建新活动。

**Request**
```json
{
  "name": "新活动",
  "startsAt": "2026-01-10T00:00:00.000Z",
  "endsAt": "2026-01-20T23:59:59.000Z",
  "voucherType": "single",
  "totalQuota": 200
}
```

**Response 200**
```json
{ "result": "success", "id": "act_002" }
```

## PUT /api/console/activities/{id}
**Purpose**: 更新活动状态或配置（如暂停/启用/调整时间）。

**Request**
```json
{
  "status": "active|paused|ended",
  "startsAt": "2026-01-10T00:00:00.000Z",
  "endsAt": "2026-01-20T23:59:59.000Z"
}
```

**Response 200**
```json
{ "result": "success" }
```

## DELETE /api/console/activities/{id}
**Purpose**: 删除活动（软删除）。

**Response 200**
```json
{ "result": "success" }
```

## GET /api/demo/activities
**Purpose**: 演示页面获取活动列表（含可领取与已暂停/结束）。

**Response 200**
```json
{
  "available": [
    {
      "id": "act_001",
      "name": "每日签到",
      "startsAt": "2026-01-06T00:00:00.000Z",
      "endsAt": "2026-01-31T23:59:59.000Z",
      "voucherType": "single",
      "remainingQuota": 900,
      "status": "active"
    }
  ],
  "inactive": [
    {
      "id": "act_099",
      "name": "已结束活动",
      "startsAt": "2025-12-01T00:00:00.000Z",
      "endsAt": "2025-12-31T23:59:59.000Z",
      "voucherType": "single",
      "remainingQuota": 0,
      "status": "ended"
    }
  ]
}
```

## POST /api/demo/activities/claim
**Purpose**: 演示页面完成活动并领取消费券。

**Request**
```json
{ "activityId": "act_001", "wallet": "0x..." }
```

**Response 200**
```json
{ "result": "success", "voucherId": "0x...", "issuedAt": "2026-01-06T10:00:00.000Z" }
```

**Errors**
- 400: missing params / invalid address
- 409: activity paused or ended / quota exhausted / already claimed
- 500: internal error
