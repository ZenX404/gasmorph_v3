# API Contracts — Gas 补贴演示页面

格式：REST + JSON（前端直接调用 Next.js API routes）。

## POST /api/subsidy/execute
**Purpose**: 触发演示动作并返回操作 ID。  

**Request**
```json
{
  "networkId": 11155111,
  "account": "0x...",
  "isSubsidized": true,
  "mode": "erc4337|sponsor-eoa|simulated",
  "action": "demo-call"
}
```

**Response 200**
```json
{
  "opId": "uuid",
  "mode": "sponsor-eoa",
  "isSubsidized": true,
  "action": "demo-call",
  "networkId": 11155111,
  "status": "pending"
}
```

**Errors**: 400（missing params / unsupported network）

## GET /api/subsidy/status
**Purpose**: 查询操作状态，返回交易回显信息。  
**Query**: `opId`, `networkId`, `isSubsidized`

**Response 200**
```json
{
  "opId": "uuid",
  "networkId": 11155111,
  "status": "confirmed",
  "txHash": "0x...",
  "blockNumber": 0,
  "gasUsed": null,
  "gasPayer": "sponsor|user",
  "explorerUrl": null,
  "failureReason": null
}
```

**Errors**: 400（missing params / unsupported network）

## Notes
- 当前为演示用回显接口，交易详情以 UI 为主。  
- 错误提示必须清晰可读，避免吞掉失败原因。  
