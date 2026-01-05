# Research Notes: 补贴控制台与券NFT

## Decision: 券 NFT 标准采用 ERC-721
**Rationale**: 券本质为不可替代资产，需具备唯一标识与转赠能力；ERC-721 是主流标准且与钱包/浏览器生态兼容性最佳。  
**Alternatives considered**: ERC-1155（更适合半同质资产与批量发放，但与“NFT”叙述不完全一致）。

## Decision: 采用可销毁的 ERC-721（Burnable）
**Rationale**: 需要支持“使用后销毁”或“过期销毁”的券生命周期；主流实现提供标准化接口，便于前端展示与后续扩展。  
**Alternatives considered**: 仅标记为已使用/过期（不销毁），但不满足“销毁”功能要求。

## Decision: 发券（铸造）面向演示场景开放调用
**Rationale**: 控制台公开且允许发券，需支持任意访客操作；演示环境下以公开 mint/issue 方式满足需求。  
**Alternatives considered**: 仅管理员铸造（需鉴权，不符合“控制台无需登录”设定）。

## Decision: 重复发券累加规则
**Rationale**: 已明确“单次券累加次数、时间段券累加时长”，需在合约或业务逻辑中累加记录。  
**Alternatives considered**: 覆盖旧券或拒绝重复发放（与已澄清规则不符）。

## Decision: 时间段券有效期从发放时刻开始
**Rationale**: 规则直观，易于展示与验证；适合演示目的。  
**Alternatives considered**: 首次使用时开始计时、用户手动激活（复杂且增加歧义）。

## Decision: 券抵扣额度为 100% Gas
**Rationale**: 与“抵消 GAS 费”描述一致，演示效果明确；减少费用计算复杂度。  
**Alternatives considered**: 固定额度或比例抵扣（需要额外规则与边界处理）。

## Decision: 控制台指标与交易明细以链上事件为主
**Rationale**: 依赖链上事件即可回溯补贴与券行为，不引入额外数据库；便于演示与扩展。  
**Alternatives considered**: 引入数据库进行聚合（超出演示范围且增加运维成本）。

## Decision: 预留扩展位采用“指标卡 + 图表数据适配层”
**Rationale**: 未来新增补贴方式或指标时，只需追加指标定义与图表数据映射，无需改动页面布局结构。  
**Alternatives considered**: 页面硬编码指标（扩展成本高）。
