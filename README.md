# 橙意外卖全端系统

橙意外卖是 Spring Boot 期末大作业项目，包含用户端、骑手端、商家端和后台管理端。前端基于 Stitch 高保真原型继续开发，后端基于 Spring Boot 提供演示接口。

## 目录

- `frontend`：React + Vite + Tailwind CSS 前端
- `backend`：Spring Boot 后端
- `sql`：建表脚本和初始化数据
- `docs`：接口文档、报告初稿、演示脚本

## 前端运行

```bash
cd frontend
npm install
npm run dev
```

默认地址：`http://localhost:3000`

## 后端运行

准备 MySQL 和 Redis，创建数据库并导入：

```bash
mysql -uroot -p < sql/schema.sql
mysql -uroot -p < sql/init.sql
```

启动后端：

```bash
cd backend
mvn spring-boot:run
```

默认接口地址：`http://localhost:8080/api`

## 演示流程

用户登录 → 浏览商家 → 查看菜品 → 加入购物车 → 确认订单 → 模拟支付 → 查看订单状态 → 商家接单 → 商家出餐 → 骑手接单 → 骑手取餐 → 骑手送达 → 用户评价 → 后台查看数据和管理订单。
