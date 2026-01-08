# @gasmorph/sdk

用于项目方快速接入 GasMorph 补贴与消费券能力的 TypeScript SDK。

## 安全说明
- SDK 不接收、不保存任何私钥或助记词。
- 所有签名行为必须由项目方自身环境完成。

## 使用方式（演示）
```ts
import { GasMorphClient } from "@gasmorph/sdk";

const client = new GasMorphClient({
  baseUrl: "http://localhost:3000",
  projectId: "demo"
});
```
