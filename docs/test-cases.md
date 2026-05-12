# 演示接口测试流程

以下示例默认后端运行在 `http://localhost:8080/api`，并已导入 `sql/schema.sql` 和 `sql/init.sql`。

## 1. 登录

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"13800000001\",\"code\":\"123456\",\"role\":\"admin\"}"
```

预期：返回 `role=customer`，证明角色来自数据库而不是前端传参。

## 2. 查询商家和菜品

```bash
curl http://localhost:8080/api/merchants
curl http://localhost:8080/api/merchants/1/dishes
```

预期：商家来自 `merchant` 表，菜品来自 `dish` 表。

## 3. 加入购物车

```bash
curl -X POST http://localhost:8080/api/customer/cart \
  -H "Content-Type: application/json" \
  -d "{\"dishId\":101,\"name\":\"招牌红烧牛肉面\",\"quantity\":1,\"price\":28.5}"
```

## 4. 创建订单

```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d "{\"merchantId\":1,\"address\":\"学校东门 3 号宿舍楼 502\",\"items\":[{\"dishId\":101,\"name\":\"招牌红烧牛肉面\",\"quantity\":1,\"price\":28.5}]}"
```

预期：返回 `Order` 对象，订单 ID 字段为 `id`，状态为 `待支付`。

## 5. 支付与状态流转

将上一步返回的 `id` 替换到下面命令中：

```bash
curl -X POST http://localhost:8080/api/orders/{id}/pay
curl -X POST http://localhost:8080/api/orders/{id}/merchant/accept
curl -X POST http://localhost:8080/api/orders/{id}/merchant/ready
curl -X POST http://localhost:8080/api/orders/{id}/rider/accept
curl -X POST http://localhost:8080/api/orders/{id}/rider/pickup
curl -X POST http://localhost:8080/api/orders/{id}/rider/delivered
```

预期状态依次为：`待商家接单`、`商家已接单`、`商家已出餐`、`骑手已接单`、`骑手已取餐`、`已完成`。

## 6. 非法状态校验

对已完成订单再次调用：

```bash
curl -X POST http://localhost:8080/api/orders/{id}/pay
```

预期：返回错误，不允许重复支付或跳过状态。

## 7. 不存在订单校验

```bash
curl -X POST http://localhost:8080/api/orders/NO_SUCH_ORDER/pay
```

预期：返回 `订单不存在`，不会自动创建假订单。

## 8. 查看订单列表

```bash
curl http://localhost:8080/api/orders
```

预期：返回数据库中的真实订单列表。
