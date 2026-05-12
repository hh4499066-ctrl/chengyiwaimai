# 橙意外卖接口文档

基础路径：`http://localhost:8080/api`

统一响应：

```json
{ "code": 0, "message": "success", "data": {} }
```

## 鉴权

登录、商家列表、菜品列表和 WebSocket 握手放行；其他接口需要请求头：

```http
Authorization: Bearer <token>
```

角色边界：

- `/customer/**`：`customer`
- `/merchant-center/**`：`merchant`
- `/rider/**`：`rider`
- `/admin/**`：`admin`
- `/orders/**`：按具体动作校验用户、商家或骑手归属

## 登录

`POST /auth/login`

```json
{ "phone": "13800000001", "code": "123456", "role": "admin" }
```

说明：验证码必须为 `123456`。后端根据手机号查询 `sys_user`，返回数据库中的真实角色，不信任前端传入的 `role`。

响应：

```json
{ "token": "jwt-token", "role": "customer", "nickname": "张同学" }
```

## 商家与菜品

- `GET /merchants`
- `GET /merchants/{merchantId}/dishes`

这两个接口公开可访问。

## 用户端

- `GET /customer/profile`
- `GET /customer/addresses`
- `POST /customer/addresses`
- `GET /customer/coupons`
- `GET /customer/cart`
- `POST /customer/cart`
- `PUT /customer/cart/{dishId}`
- `DELETE /customer/cart/{dishId}`
- `DELETE /customer/cart`
- `GET /customer/reviews`
- `POST /customer/reviews`

购物车新增：

```json
{ "dishId": 101, "name": "招牌红烧牛肉面", "quantity": 1, "price": 28.5 }
```

购物车改数量：

```json
{ "dishId": 101, "quantity": 2 }
```

## 订单流程

- `GET /orders`
- `POST /orders`
- `POST /orders/{orderId}/pay`
- `POST /orders/{orderId}/merchant/accept`
- `POST /orders/{orderId}/merchant/cancel`
- `POST /orders/{orderId}/merchant/reject`
- `POST /orders/{orderId}/merchant/ready`
- `POST /orders/{orderId}/rider/accept`
- `POST /orders/{orderId}/rider/pickup`
- `POST /orders/{orderId}/rider/delivered`
- `POST /orders/{orderId}/location`

创建订单请求：

```json
{
  "merchantId": 1,
  "address": "学校东门 3 号宿舍楼 502",
  "items": [
    { "dishId": 101, "name": "招牌红烧牛肉面", "quantity": 1, "price": 28.5 }
  ]
}
```

响应为 `Order` 对象，订单 ID 字段是 `id`：

```json
{
  "id": "CY202605122030000001234",
  "merchantId": 1,
  "merchantName": "老刘家招牌牛肉面",
  "status": "待支付",
  "totalAmount": 30.0,
  "address": "学校东门 3 号宿舍楼 502",
  "createTime": "2026-05-12T20:30:00"
}
```

状态流转：

- `待支付 -> 待商家接单`
- `待商家接单 -> 商家已接单 / 已取消`
- `商家已接单 -> 商家已出餐`
- `商家已出餐 -> 骑手已接单`
- `骑手已接单 -> 骑手已取餐`
- `骑手已取餐 -> 已完成`

## 后台、商家、骑手

- 后台：`/admin/**`，只允许管理员。
- 商家：`/merchant-center/**`，只允许商家账号，且订单操作校验 `merchant.user_id` 绑定关系。
- 骑手：`/rider/**`，只允许骑手账号；骑手接单后订单绑定当前骑手。

## WebSocket

订单状态推送：`ws://localhost:8080/api/ws/orders`

## 定时任务

每分钟扫描超过 15 分钟仍为 `待支付` 的订单并自动改为 `已取消`，仅在取消数量大于 0 时输出日志。
