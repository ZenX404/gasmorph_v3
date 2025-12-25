# API Contracts — Gas 补贴演示页面

格式：REST + JSON（前端可直接调用 Next.js API routes 或直接链上交互）。

## POST /api/subsidy/prepare
- **Purpose**: 前端在本地/测试网前准备补贴配置与链校验。  
- **Request**:
```json
{ "networkId": 11155111, "account": "0x...", "mode": "erc4337|sponsor-eoa|simulated" }
```
- **Response 200**:
```json
{
  "networkId": 11155111,
  "subsidyEnabled": true,
  "paymasterType": "erc4337",
  "sponsorAddress": "0x...",
  "spendLimit": "0x...",
  "gasPriceCap": "0x...",
  "explorerBaseUrl": "https://sepolia.etherscan.io/tx/"
}
```
- **Errors**: 400 (unsupported network), 503 (paymaster unavailable), 429 (limit exceeded).

## POST /api/subsidy/execute
- **Purpose**: 触发示例操作；根据模式返回要签名/提交的交易或 UserOperation。  
- **Request**:
```json
{
  "networkId": 11155111,
  "account": "0x...",
  "isSubsidized": true,
  "mode": "erc4337|sponsor-eoa|simulated",
  "action": "demo-call"
}
```
- **Response 200** (erc4337):
```json
{
  "opId": "uuid",
  "userOp": { "...": "..." },
  "paymasterData": "0x...",
  "entryPoint": "0x...",
  "sponsor": "0x..."
}
```
- **Response 200** (sponsor-eoa):
```json
{
  "opId": "uuid",
  "tx": { "to": "0x...", "data": "0x...", "value": "0x0" },
  "sponsor": "0x..."
}
```
- **Response 200** (simulated):
```json
{ "opId": "uuid", "simulated": true }
```
- **Errors**: 400 (missing params), 409 (subsidy off/limit exceeded), 503 (bundler/paymaster unavailable).

## GET /api/subsidy/status
- **Purpose**: 轮询/查询操作状态，返回交易哈希与可视化数据。  
- **Query**: `opId`, `networkId`  
- **Response 200**:
```json
{
  "opId": "uuid",
  "status": "pending|confirmed|failed|cancelled",
  "txHash": "0x...",
  "blockNumber": 12345,
  "gasUsed": "0x...",
  "gasPayer": "0x...",
  "explorerUrl": "https://sepolia.etherscan.io/tx/0x...",
  "failureReason": null
}
```

## Notes
- 若直接在前端调用 bundler/paymaster，而无需中间 API，可仅使用 `/status` 作为演示数据回显层。  
- 所有响应需含 `networkId`，前端做 chainId 校验。  
- 错误需返回可读提示，避免吞掉失败原因。  
- 交易哈希需用于 UI 的“交易路径”展示和 explorer 链接。
