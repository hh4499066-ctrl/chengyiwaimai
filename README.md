# 橙意外卖全端系统

橙意外卖是基于 Stitch 前端视觉稿继续开发的校园外卖演示项目，包含用户端、骑手端、商家端和后台管理端。前端使用 React + Vite + Tailwind CSS，后端使用 Spring Boot + MyBatis-Plus + MySQL。

## 目录

- `frontend`：React + Vite + Tailwind CSS 前端
- `backend`：Spring Boot 后端
- `sql`：建表脚本和初始化数据
- `docs`：接口文档、测试流程和演示脚本

## 环境要求

- JDK 17
- Maven 3.8+
- Node.js 18+
- MySQL 8.x
- Redis 6.x 或 7.x（当前项目保留 Redis 配置，核心流程不强依赖 Redis）

## 初始化数据库

```bash
mysql -uroot -p < sql/schema.sql
mysql -uroot -p < sql/init.sql
```

默认数据库连接在 `backend/src/main/resources/application.yml` 中配置：

- 数据库：`chengyiwaimai`
- 用户名：`root`
- 密码：`123456`
- 后端端口：`8080`
- API 前缀：`/api`

## 启动后端

```bash
cd backend
mvn spring-boot:run
```

后端地址：`http://localhost:8080/api`

## 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端地址：`http://localhost:3000`

如需指定后端地址，可在 `frontend/.env` 中配置：

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

## 默认演示账号

登录接口会查询 `sys_user` 表，角色以数据库为准，不信任前端传入的 `role`。

| 角色 | 手机号 | 验证码 |
| --- | --- | --- |
| 用户 | `13800000001` | `123456` |
| 骑手 | `13800000002` | `123456` |
| 商家 | `13800000003` | `123456` |
| 管理员 | `13800000004` | `123456` |

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

1. 前端接口 404：确认后端已启动，并检查 `VITE_API_BASE_URL` 是否指向 `http://localhost:8080/api`。
2. 后端启动数据库连接失败：确认 MySQL 已启动、账号密码匹配，并已导入 `sql/schema.sql` 和 `sql/init.sql`。
3. 登录提示用户不存在：确认 `sys_user` 表中存在对应手机号，且 `status=1`、`deleted=0`。
4. 创建订单失败：确认商家和菜品数据存在，且菜品属于当前商家、状态为 `on_sale`。
5. 订单状态操作失败：订单状态必须按规则流转，不能跳过中间状态。
