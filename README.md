# ERP 管理系统

基于 Spring Boot + React 的 ERP 管理系统。

## 技术栈

* 前端：`erp-web`（React + Vite + TypeScript）
* 后端：Spring Boot、Spring Security、Redis & JWT、MyBatis
* 数据库：MySQL（库名：`erp`）

## 后端模块

| 模块 | 说明 |
| :--- | :--- |
| erp-admin | Web 入口 / 启动模块 |
| erp-framework | 安全、AOP、数据源等框架层 |
| erp-system | 业务系统模块 |
| erp-common | 通用工具与配置 |
| erp-generator | 代码生成器 |

## 快速开始

### 1. 数据库

创建数据库：

```sql
CREATE DATABASE `erp` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

如有旧库 `smart-property`，可迁移数据：

```sql
-- 已从 smart-property 复制到 erp
-- 数据源配置见：erp-admin/src/main/resources/application-druid.yml
```

数据源配置见：`erp-admin/src/main/resources/application-druid.yml`

### 2. 后端

```bash
mvn clean package -DskipTests
java -jar erp-admin/target/erp-admin.jar
```

默认接口前缀：`http://localhost:8080/api`  
接口文档：`http://localhost:8080/api/doc.html`

### 3. 前端

```bash
cd erp-web
npm install
npm run dev
```

## 配置说明

项目配置前缀为 `erp`（见 `application.yml`），例如上传路径、验证码开关等。
