# 演示接口测试流程

以下示例默认后端运行在 `http://localhost:8080/api`。

## 1. 登录和角色可信性

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"13800000001\",\"code\":\"123456\",\"role\":\"admin\"}"
```

预期：返回 `role=customer`，角色来自数据库。

错误验证码：

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"13800000001\",\"code\":\"000000\",\"role\":\"customer\"}"
```

预期：返回 `验证码错误`。

## 2. 获取 Token

```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"13800000001\",\"code\":\"123456\",\"role\":\"customer\"}" | jq -r ".data.token")
```

Windows PowerShell 可手动复制 `data.token`。

## 3. 权限校验

无 token：

```bash
curl http://localhost:8080/api/orders
```

预期：未登录。

用户 token 调后台：

```bash
curl http://localhost:8080/api/admin/orders -H "Authorization: Bearer $TOKEN"
```

预期：无权访问。

## 4. 商家和菜品公开访问

```bash
curl http://localhost:8080/api/merchants
curl http://localhost:8080/api/merchants/1/dishes
```

预期：无需 token 即可访问。

## 5. 购物车

```bash
curl -X POST http://localhost:8080/api/customer/cart \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"dishId\":101,\"name\":\"招牌红烧牛肉面\",\"quantity\":1,\"price\":28.5}"
```

```bash
curl -X PUT http://localhost:8080/api/customer/cart/101 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"dishId\":101,\"quantity\":2}"
```

## 6. 创建订单

```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"merchantId\":1,\"address\":\"学校东门 3 号宿舍楼 502\",\"items\":[{\"dishId\":101,\"name\":\"招牌红烧牛肉面\",\"quantity\":1,\"price\":28.5}]}"
```

预期：订单 `userId` 为当前登录用户，库存减少，返回字段包含 `id`。

## 7. 支付与状态流转

```bash
curl -X POST http://localhost:8080/api/orders/{id}/pay -H "Authorization: Bearer $TOKEN"
```

商家账号登录后：

```bash
curl -X POST http://localhost:8080/api/orders/{id}/merchant/accept -H "Authorization: Bearer $MERCHANT_TOKEN"
curl -X POST http://localhost:8080/api/orders/{id}/merchant/ready -H "Authorization: Bearer $MERCHANT_TOKEN"
```

骑手账号登录后：

```bash
curl -X POST http://localhost:8080/api/orders/{id}/rider/accept -H "Authorization: Bearer $RIDER_TOKEN"
curl -X POST http://localhost:8080/api/orders/{id}/rider/pickup -H "Authorization: Bearer $RIDER_TOKEN"
curl -X POST http://localhost:8080/api/orders/{id}/rider/delivered -H "Authorization: Bearer $RIDER_TOKEN"
```

## 8. 异常场景

- 重复支付同一订单：预期返回 `订单状态已变化，请刷新`。
- 跳过状态直接骑手接单：预期失败。
- 不存在订单支付：预期返回 `订单不存在`。
- 库存不足下单：预期失败且不写入订单。
