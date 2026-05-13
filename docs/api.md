# 橙意外卖接口文档

基础路径：`http://localhost:8080/api`

统一响应：

```json
{ "code": 0, "message": "success", "data": {} }
```

除 `/auth/login`、`/merchants`、`/merchants/{id}/dishes` 和 WebSocket 握手外，均需要：

```http
Authorization: Bearer <token>
```

## 用户端

- `GET /customer/addresses`
- `POST /customer/addresses`
- `GET /customer/coupons`
- `GET /customer/cart`
- `POST /customer/cart`
- `PATCH /customer/cart/{dishId}`
- `DELETE /customer/cart/{dishId}`
- `GET /customer/reviews`
- `POST /customer/reviews`

购物车数量：

```json
{ "dishId": 101, "quantity": 2 }
```

评价：

```json
{ "orderId": "CY202605130001", "rating": 5, "content": "味道不错" }
```

## 订单

- `GET /orders`
- `POST /orders`
- `POST /orders/{id}/pay`
- `POST /orders/{id}/merchant/accept`
- `POST /orders/{id}/merchant/reject`
- `POST /orders/{id}/merchant/ready`
- `POST /orders/{id}/rider/accept`
- `POST /orders/{id}/rider/pickup`
- `POST /orders/{id}/rider/delivered`
- `POST /orders/{id}/location`
- `GET /orders/{id}/location`

创建订单：

```json
{
  "merchantId": 1,
  "address": "学校东门 3 号宿舍楼 502",
  "remark": "少辣",
  "payMethod": "wechat",
  "items": [{ "dishId": 101, "name": "招牌牛肉面", "quantity": 1, "price": 28.5 }]
}
```

支付：

```json
{ "payMethod": "wechat" }
```

位置上报：

```json
{ "orderId": "CY202605130001", "longitude": 113.3245, "latitude": 23.1064 }
```

## 商家端

- `GET /merchant-center/orders`
- `GET /merchant-center/dishes`
- `POST /merchant-center/dishes`
- `PATCH /merchant-center/dishes/{id}/status`
- `PATCH /merchant-center/dishes/{id}/stock`
- `GET /merchant-center/categories`
- `POST /merchant-center/categories`
- `GET /merchant-center/stats`
- `GET /merchant-center/reviews`
- `POST /merchant-center/reviews/{id}/reply`
- `POST /merchant-center/business-settings`

## 骑手端

- `GET /rider/lobby`
- `GET /rider/tasks`
- `GET /rider/income`
- `POST /rider/withdraw`
- `POST /rider/location`

## 后台

- `GET /admin/dashboard`
- `GET /admin/users`
- `GET /admin/orders`
- `GET /admin/merchants`
- `GET /admin/riders`
- `GET /admin/marketing`
- `POST /admin/{module}/{id}/audit`

## WebSocket

订单推送：

```text
ws://localhost:8080/api/ws/orders?orderId=CY202605130001&token=<jwt>
```

WebSocket 必须携带 `orderId` 和 `token`。用户只能订阅自己的订单，商家只能订阅本店订单，骑手只能订阅自己接到的订单，管理员可订阅任意订单。
