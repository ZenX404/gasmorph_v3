# API Contracts: 补贴控制台与券NFT

## GET /api/console/overview
**Purpose**: 获取控制台概览信息（补贴开关、指标卡、补贴账户摘要）。

**Response 200**
```json
{
  "subsidyEnabled": true,
  "metrics": [
    { "key": "subsidyCount", "label": "补贴覆盖动作", "value": 120 },
    { "key": "totalTx", "label": "总动作数", "value": 180 },
    { "key": "successRate", "label": "成功率", "value": "98%" }
  ],
  "sponsorSummary": {
    "address": "0x...",
    "balanceDelta": "-0.03",
    "lastTxAt": "2025-12-26T10:00:00.000Z"
  }
}
```

## POST /api/console/subsidy-toggle
**Purpose**: 切换补贴开关状态。

**Request**
```json
{ "enabled": true }
```

**Response 200**
```json
{ "enabled": true, "updatedAt": "2025-12-26 10:00:00" }
```

## POST /api/console/issue-voucher
**Purpose**: 向指定地址发放指定类型券 NFT。

**Request**
```json
{ "target": "0x...", "type": "single|time_window_1m|time_window_2h|time_window_7d" }
```

**Response 200**
```json
{ "result": "success", "voucherId": "0x...", "issuedAt": "2025-12-26 10:00:00" }
```

## GET /api/console/transactions
**Purpose**: 获取补贴交易明细列表（不含敏感字段）。

**Response 200**
```json
{
  "items": [
    {
      "txHash": "0x...",
      "sender": "0x...",
      "status": "confirmed",
      "gasPayer": "sponsor|user|voucher",
      "gasUsed": "21000",
      "networkId": 1337,
      "explorerUrl": null,
      "blockNumber": 12345,
      "voucherId": "0x...",
      "createdAt": 1735207200000
    }
  ]
}
```

## POST /api/demo/checkin
**Purpose**: 演示页签到并领取券。

**Request**
```json
{ "wallet": "0x..." }
```

**Response 200**
```json
{ "result": "success", "voucherId": "0x...", "issuedAt": "2025-12-26 10:00:00" }
```

## POST /api/demo/checkin-reset
**Purpose**: 仅在本地/非生产环境重置当日签到记录（用于演示测试）。 

**Request**
```json
{ "wallet": "0x..." }
```

**Response 200**
```json
{ "result": "success", "removed": 1, "dayKey": "2025-12-26" }
```

## POST /api/demo/transfer-voucher
**Purpose**: 转赠券 NFT。

**Request**
```json
{ "voucherId": "0x...", "to": "0x..." }
```

**Response 200**
```json
{ "result": "success", "to": "0x..." }
```

## POST /api/demo/burn-voucher
**Purpose**: 销毁券 NFT。

**Request**
```json
{ "voucherId": "0x..." }
```

**Response 200**
```json
{ "result": "success", "burnedAt": "2025-12-26 10:00:00" }
```
