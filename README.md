# 橙意外卖全端系统

橙意外卖是 Spring Boot + React + Vite + Tailwind CSS 的校园外卖演示系统，包含用户端、骑手端、商家端和后台管理端。前端保留 Stitch 生成的橙色系、卡片化、手机框和 PC 后台布局。

## 运行命令

```bash
cd backend
mvn spring-boot:run
```

```bash
cd frontend
npm install
npm run dev
```

前端默认地址：`http://localhost:3000`  
后端默认地址：`http://localhost:8080/api`

## 默认账号

验证码固定为 `123456`。

| 角色 | 手机号 |
| --- | --- |
| 用户 | `13800000001` |
| 骑手 | `13800000002` |
| 商家 | `13800000003` |
| 管理员 | `13800000004` |

## 配置

后端读取：

- `DB_URL`，默认 `jdbc:mysql://localhost:3306/chengyiwaimai?...`
- `DB_USERNAME`，默认 `root`
- `DB_PASSWORD`，默认 `123456`
- `REDIS_HOST`，默认 `localhost`
- `REDIS_PORT`，默认 `6379`
- `JWT_SECRET`

前端可配置：

- `VITE_API_BASE_URL=/api`
- `VITE_WS_BASE_URL=ws://localhost:8080/api/ws/orders`
- `VITE_AMAP_KEY=你的高德地图Key`（可选；未配置时使用源码内置演示 Key）
- `VITE_AMAP_SECURITY_JS_CODE=如启用安全密钥则填写`

WebSocket 真实握手路径是 `/api/ws/orders`。普通 REST 接口只接受 `Authorization: Bearer <token>`，只有 WebSocket 握手允许 query token。

## Redis

Redis 已用于骑手最新位置缓存，key 为 `rider:location:{orderId}`，过期时间 30 分钟。Redis 不可用时位置缓存自动降级，不影响接单、取餐、送达等主流程。

## 数据库初始化

```bash
mysql -uroot -p < sql/schema.sql
mysql -uroot -p < sql/init.sql
```

已有环境可按需执行迁移：

```bash
mysql -uroot -p < sql/migration-20260512-auth-order-cart.sql
mysql -uroot -p < sql/migration-20260513-review-fixes.sql
mysql -uroot -p < sql/migration-20260514-funds-marketing-dashboard.sql
mysql -uroot -p < sql/migration-20260515-withdraw-owner-cleanup.sql
mysql -uroot -p < sql/migration-20260515-applications-wallet-points.sql
mysql -uroot -p < sql/init.sql
```

本轮迁移新增 `delivery_order.pay_method/coupon_id/discount_amount`、`dish_category`、`user_coupon`、`withdraw_record.owner_type/owner_id/operator_user_id`，并为 `marketing_activity` 增加 `merchant_id` 和 `(merchant_id, name)` 联合唯一键。`withdraw_record.rider_id` 仅保留为历史兼容字段，真实归属以 `owner_type + owner_id` 为准。删除营销活动时服务端会改写历史记录名称释放唯一键，后台看板统计索引也在 `migration-20260514-funds-marketing-dashboard.sql` 中补齐。优惠券抵扣、支付方式、商家/骑手提现和营销活动均以数据库记录为准。

商家入驻申请已写入 `merchant_application`，管理员审核通过后会创建或更新 `merchant`，驳回会保存 `reject_reason`。骑手实名认证写入 `rider_certification`，后台审核会同步认证状态和骑手账号接单状态。骑手等级按真实完成订单数计算。用户余额来自 `user_wallet`，积分来自 `user_points`；余额/校园卡支付会校验并扣减余额，支付成功后按消费金额向下取整增加积分。

WebSocket 演示环境通过 query token 鉴权；生产环境建议改为短期票据、Cookie 或网关鉴权。后端不得打印完整 token。REST 接口仍只接受 Authorization Header，不能通过 `?token=` 认证。

## 构建检查

```bash
cd frontend
npm run lint
npm run build
```

```bash
cd backend
mvn -DskipTests compile
```

## 常见问题

8080 端口占用：修改 `backend/src/main/resources/application.yml` 的 `server.port`，或停止占用进程。

WebSocket 连接失败：确认后端已启动、前端 `VITE_WS_BASE_URL` 指向 `ws://localhost:8080/api/ws/orders`，并且 URL 携带 `orderId` 和 `token`。

REST 返回未登录：重新登录并确认请求头带有 `Authorization: Bearer <token>`，不要在 REST URL 上使用 `?token=`。

库存不足下单失败：确认菜品为上架状态并且库存数量大于购物车数量。
