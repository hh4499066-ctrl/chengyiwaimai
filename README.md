# 橙意外卖全端系统

橙意外卖是基于 Stitch 前端视觉稿继续开发的校园外卖演示项目，包含用户端、骑手端、商家端和后台管理端。前端使用 React + Vite + Tailwind CSS，后端使用 Spring Boot + MyBatis-Plus + MySQL。

## 环境要求

- JDK 17
- Maven 3.8+
- Node.js 18+
- MySQL 8.x
- Redis 6.x 或 7.x（当前核心流程不依赖 Redis）

## 数据库初始化与升级

新环境初始化：

```bash
mysql -uroot -p < sql/schema.sql
mysql -uroot -p < sql/init.sql
```

已有环境升级本轮鉴权、订单和购物车结构：

```bash
mysql -uroot -p < sql/migration-20260512-auth-order-cart.sql
mysql -uroot -p < sql/init.sql
```

默认数据库连接支持环境变量覆盖：

- `DB_URL`，默认 `jdbc:mysql://localhost:3306/chengyiwaimai?...`
- `DB_USERNAME`，默认 `root`
- `DB_PASSWORD`，默认 `123456`
- `JWT_SECRET`，默认演示密钥

## 启动

```bash
cd backend
mvn spring-boot:run
```

```bash
cd frontend
npm install
npm run dev
```

前端地址：`http://localhost:3000`  
后端地址：`http://localhost:8080/api`

## 默认演示账号

登录接口查询 `sys_user` 表，角色以数据库为准。验证码固定为 `123456`。

| 角色 | 手机号 | 验证码 |
| --- | --- | --- |
| 用户 | `13800000001` | `123456` |
| 骑手 | `13800000002` | `123456` |
| 商家 | `13800000003` | `123456` |
| 管理员 | `13800000004` | `123456` |

## 鉴权说明

- `/auth/login`、`/merchants/**`、`/ws/orders` 放行。
- 其他接口需要 `Authorization: Bearer <token>`。
- `/customer/**` 只允许用户，`/merchant-center/**` 只允许商家，`/rider/**` 只允许骑手，`/admin/**` 只允许管理员。
- `/orders` 根据具体动作校验角色、订单归属、商家归属和骑手归属。

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

1. 登录失败：确认验证码是 `123456`，并且 `sys_user` 中有对应手机号。
2. 业务接口返回未登录：确认前端 localStorage 中有 `chengyi_token`，或重新登录。
3. 创建订单失败：确认菜品上架、库存充足，购物车商品属于当前商家。
4. 商家账号无法操作订单：确认 `merchant.user_id` 已绑定商家账号 `13800000003`。
5. 已有库缺字段或缺表：先执行 `sql/migration-20260512-auth-order-cart.sql`。
