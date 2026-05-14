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
- `JWT_SECRET`

前端可配置：

- `VITE_API_BASE_URL=/api`
- `VITE_WS_BASE_URL=ws://localhost:8080/api/ws/orders`

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
mysql -uroot -p < sql/init.sql
```

本轮迁移新增 `delivery_order.pay_method/coupon_id/discount_amount`、`dish_category`、`withdraw_record.owner_type/owner_id`，并为 `marketing_activity` 增加 `merchant_id` 和 `(merchant_id, name)` 联合唯一键。优惠券抵扣、支付方式、商家/骑手提现和营销活动均以数据库记录为准。

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
