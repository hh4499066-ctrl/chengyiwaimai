# 橙意外卖接口文档

基础路径：`http://localhost:8080/api`

统一响应：

```json
{ "code": 0, "message": "success", "data": {} }
```

失败响应仍使用统一结构，`code` 为非 0，错误原因在 `message` 中。

## 登录

`POST /auth/login`

请求：

```json
{ "phone": "13800000001", "code": "123456", "role": "customer" }
```

说明：后端根据 `phone` 查询 `sys_user`，返回角色来自数据库，不信任前端传入的 `role`。

响应：

```json
{
  "token": "jwt-token",
  "role": "customer",
  "nickname": "张同学"
}
```

## 商家与菜品

### 商家列表

`GET /merchants`

返回 `merchant` 表中审核通过且营业中的商家。

### 菜品列表

`GET /merchants/{merchantId}/dishes`

返回指定商家上架中的菜品。

## 用户端

- `GET /customer/profile`
- `GET /customer/addresses`
- `POST /customer/addresses`
- `GET /customer/coupons`
- `GET /customer/cart`
- `POST /customer/cart`
- `DELETE /customer/cart`
- `GET /customer/reviews`
- `POST /customer/reviews`

购物车请求示例：

```json
{ "dishId": 101, "name": "招牌红烧牛肉面", "quantity": 1, "price": 28.5 }
```

评价请求示例：

```json
{ "orderId": "CY20260512193000001", "rating": 5, "content": "味道不错，配送很快。" }
```

## 订单流程

### 订单列表

`GET /orders`

### 创建订单

`POST /orders`

请求：

```json
{
  "merchantId": 1,
  "address": "学校东门 3 号宿舍楼 502",
  "items": [
    { "dishId": 101, "name": "招牌红烧牛肉面", "quantity": 1, "price": 28.5 }
  ]
}
```

响应为后端 `Order` 对象，订单 ID 字段是 `id`：

```json
{
  "id": "CY20260512193000001",
  "merchantId": 1,
  "merchantName": "老刘家招牌牛肉面",
  "status": "待支付",
  "totalAmount": 30.0,
  "address": "学校东门 3 号宿舍楼 502",
  "createTime": "2026-05-12T19:30:00"
}
```

### 支付订单

`POST /orders/{orderId}/pay`

状态：`待支付 -> 待商家接单`

### 商家操作

- `POST /orders/{orderId}/merchant/accept`：`待商家接单 -> 商家已接单`
- `POST /orders/{orderId}/merchant/cancel`：`待商家接单 -> 已取消`
- `POST /orders/{orderId}/merchant/reject`：兼容旧按钮，等同取消
- `POST /orders/{orderId}/merchant/ready`：`商家已接单 -> 商家已出餐`

### 骑手操作

- `POST /orders/{orderId}/rider/accept`：`商家已出餐 -> 骑手已接单`
- `POST /orders/{orderId}/rider/pickup`：`骑手已接单 -> 骑手已取餐`
- `POST /orders/{orderId}/rider/delivered`：`骑手已取餐 -> 已完成`

### 骑手位置

`POST /orders/{orderId}/location`

```json
{ "orderId": "CY20260512193000001", "longitude": 113.3, "latitude": 23.1 }
```

## 后台

- `GET /admin/dashboard`
- `GET /admin/users`
- `GET /admin/merchants`
- `GET /admin/riders`
- `GET /admin/orders`
- `GET /admin/{module}`
- `POST /admin/{module}`
- `POST /admin/{module}/{id}/audit`

## 骑手端

- `POST /rider/certification`
- `GET /rider/audit-status`
- `GET /rider/lobby`
- `GET /rider/tasks`
- `POST /rider/location`
- `GET /rider/income`
- `POST /rider/withdraw`
- `GET /rider/level`

## 商家端

- `POST /merchant-center/apply`
- `GET /merchant-center/audit-status`
- `GET /merchant-center/workbench`
- `GET /merchant-center/orders`
- `GET /merchant-center/dishes`
- `POST /merchant-center/dishes`
- `GET /merchant-center/categories`
- `POST /merchant-center/categories`
- `GET /merchant-center/business-settings`
- `POST /merchant-center/business-settings`
- `GET /merchant-center/stats`
- `GET /merchant-center/reviews`
- `POST /merchant-center/reviews/{reviewId}/reply`
- `GET /merchant-center/profile`
- `POST /merchant-center/profile`

## WebSocket

订单状态推送：`ws://localhost:8080/api/ws/orders`

## 定时任务

后端每分钟扫描一次超过 15 分钟仍为 `待支付` 的订单，并自动更新为 `已取消`。
