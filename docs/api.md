# 橙意外卖接口文档

基础路径：`http://localhost:8080/api`

统一响应：

```json
{ "code": 0, "message": "success", "data": {} }
```

## 登录

`POST /auth/login`

```json
{ "phone": "13800000001", "code": "123456", "role": "customer" }
```

## 商家与菜品

- `GET /merchants`
- `GET /merchants/{merchantId}/dishes`

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

## 订单流程

- `GET /orders`
- `POST /orders` 创建订单
- `POST /orders/{orderId}/pay` 模拟支付
- `POST /orders/{orderId}/merchant/accept` 商家接单
- `POST /orders/{orderId}/merchant/reject` 商家拒单
- `POST /orders/{orderId}/merchant/ready` 商家出餐
- `POST /orders/{orderId}/rider/accept` 骑手接单
- `POST /orders/{orderId}/rider/pickup` 骑手取餐
- `POST /orders/{orderId}/rider/delivered` 骑手送达
- `POST /orders/{orderId}/location` 模拟上传骑手位置

## 后台

- `GET /admin/dashboard`
- `GET /admin/users`
- `GET /admin/merchants`
- `GET /admin/riders`
- `GET /admin/orders`
- `GET /admin/marketing`
- `POST /admin/{module}`
- `PUT /admin/{module}/{id}`
- `DELETE /admin/{module}/{id}`
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
