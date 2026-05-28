# 薄荷集市店铺管理系统

> 一套完整的店铺管理系统,适用于时尚饰品零售行业,支持商品管理、库存管理、销售管理、会员管理等核心功能。

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.10-2D3748.svg)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 📋 目录

- [项目概述](#项目概述)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [功能模块](#功能模块)
- [项目结构](#项目结构)
- [开发指南](#开发指南)
- [部署说明](#部署说明)
- [更新日志](#更新日志)

---

## 🎯 项目概述

薄荷集市店铺管理系统是一套为时尚饰品零售店铺设计的完整管理解决方案,主要特点:

- ✅ **前后端分离**: React + Node.js 架构
- ✅ **类型安全**: 全栈 TypeScript 开发
- ✅ **本地部署**: SQLite 数据库,适合本地运行
- ✅ **自动备份**: 每日自动备份数据库
- ✅ **操作日志**: 完整的操作审计追踪
- ✅ **分层架构**: Route -> Service -> Data 清晰分层

---

## 🛠 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI组件**: Ant Design
- **状态管理**: Zustand
- **图表**: ECharts
- **HTTP客户端**: Axios

### 后端
- **运行时**: Node.js 20
- **框架**: Express
- **ORM**: Prisma
- **数据库**: SQLite
- **认证**: Basic Auth + bcrypt
- **定时任务**: node-cron

---

## 🚀 快速开始

### 前置要求

- Node.js >= 20.0.0
- npm >= 10.0.0
- macOS 10.15+ (当前版本针对Mac优化)

### 安装步骤

**1. 克隆项目**

```bash
git clone <repository-url>
cd BoHeJiShi
```

**2. 安装后端依赖**

```bash
cd backend
npm install
```

**3. 初始化数据目录**

```bash
# 创建必要的目录结构
npx tsx src/scripts/init-dirs.ts
```

**4. 初始化数据库**

```bash
# 生成 Prisma Client
npx prisma generate

# 创建数据库和表结构
npx prisma db push

# 创建默认管理员账户
npx tsx src/scripts/init-admin.ts
```

**5. 安装前端依赖**

```bash
cd ../frontend
npm install
```

**6. 启动开发服务**

```bash
# 终端1 - 启动后端 (端口 3001)
cd backend
npm run dev

# 终端2 - 启动前端 (端口 5173)
cd frontend
npm run dev
```

**7. 访问系统**

- 前端地址: http://localhost:5173
- 后端API: http://localhost:3001/api
- 默认账户: `admin` / `admin123`

---

## 📦 功能模块

### 核心功能 (P0)

| 模块 | 功能 | 状态 |
|------|------|------|
| **系统管理** | 登录认证、用户管理、系统配置 | ✅ |
| **主数据管理** | 商品分类、品牌管理(分类关联)、材质管理(分类关联) | ✅ |
| **商品管理** | 商品CRUD、品牌材质联动选择、属性管理 | ✅ |
| **库存管理** | 库存查询、入库、出库、盘点、预警、调拨 | ✅ |
| **销售管理** | POS收银、订单管理、退货、挂单/取单 | ✅ |

### 重要功能 (P1)

| 模块 | 功能 | 状态 |
|------|------|------|
| **会员管理** | 会员档案、积分管理、等级管理、储值 | ✅ |
| **营销管理** | 促销活动、优惠券管理 | ✅ |
| **财务报表** | 日结账、销售报表、库存报表 | ✅ |
| **数据分析** | 经营大屏、销售分析、库存分析 | ✅ |

### 可选功能 (P2)

| 模块 | 功能 | 状态 |
|------|------|------|
| **采购管理** | 供应商管理、采购订单 | ⏳ 待开发 |

---

## 📁 项目结构

```
BoHeJiShi/
├── backend/                  # 后端项目
│   ├── src/
│   │   ├── index.ts         # 入口文件
│   │   ├── app.ts           # Express应用配置
│   │   ├── config/          # 配置文件
│   │   ├── routes/          # 路由层 (HTTP处理)
│   │   ├── services/        # 服务层 (业务逻辑) ⭐新增
│   │   ├── middleware/      # 中间件
│   │   ├── utils/           # 工具函数
│   │   ├── tasks/           # 定时任务
│   │   └── scripts/         # 脚本工具
│   ├── prisma/
│   │   └── schema.prisma    # 数据库Schema
│   ├── tests/               # 测试文件
│   └── package.json
│
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── main.tsx         # 入口文件
│   │   ├── App.tsx          # 根组件
│   │   ├── pages/           # 页面组件
│   │   ├── components/      # 公共组件
│   │   ├── api/             # API封装
│   │   ├── stores/          # 状态管理
│   │   ├── types/           # TypeScript类型
│   │   └── utils/           # 工具函数
│   └── package.json
│
├── 系统设计/                 # 设计文档
│   ├── 系统架构设计文档.md
│   ├── 系统功能设计文档.md
│   ├── 开发说明书.md
│   ├── 项目开发计划.md
│   ├── 项目审查报告.md
│   └── 项目完善总结.md
│
├── 主数据管理设计文档.md    # 主数据管理模块设计 ⭐新增
└── README.md                # 本文档

```bash
# 终端1 - 启动后端（热重载）
cd backend
npm run dev
# 服务运行在 http://localhost:3000

# 终端2 - 启动前端（热重载）
cd frontend
npm run dev
# 服务运行在 http://localhost:5173
```

### 3.2 生产构建

```bash
# 后端构建
cd backend
npm run build
# 编译输出到 dist/

# 前端构建
cd frontend
npm run build
# 编译输出到 dist/
```

## 四、测试

### 4.1 运行单元测试

```bash
# 后端测试
cd backend
npm test
# 输出: Tests 38 passed

# 前端测试
cd frontend
npm test
```

### 4.2 带覆盖率的测试

```bash
# 后端覆盖率
cd backend
npm run test:coverage
# 查看 coverage/index.html

# 前端覆盖率
cd frontend
npm run test:coverage
```

### 4.3 测试文件说明

#### 后端测试 (backend/tests/)
| 文件 | 测试内容 | 测试数 |
|------|----------|--------|
| validate.test.ts | 数据验证（手机号、邮箱、价格等） | 17 |
| redis.test.ts | 缓存工具（设置、获取、删除） | 8 |
| code.test.ts | 编码生成（订单号、优惠券码） | 7 |
| response.test.ts | 响应工具（成功、错误、分页） | 6 |

#### 前端测试 (frontend/src/utils/)
| 文件 | 测试内容 |
|------|----------|
| helpers.test.ts | 前端工具函数 |

## 五、项目结构

```
薄荷集市/
├── backend/
│   ├── src/
│   │   ├── routes/          # API路由
│   │   ├── middleware/       # 中间件
│   │   ├── utils/           # 工具函数
│   │   └── config/          # 配置
│   ├── tests/               # 单元测试
│   ├── prisma/              # 数据库模型
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/           # 页面组件
│   │   ├── api/             # API调用
│   │   ├── stores/          # 状态管理
│   │   └── utils/           # 工具函数
│   └── package.json
└── README.md
```

## 六、常用命令

### 后端
```bash
cd backend

npm run dev          # 开发模式（热重载）
npm run build        # 生产构建
npm run start        # 生产运行
npm run test         # 运行测试
npm run test:watch   # 监视模式
npm run init-db      # 初始化数据库
npx prisma studio    # 打开数据库管理界面
```

### 前端
```bash
cd frontend

npm run dev          # 开发模式
npm run build        # 生产构建
npm run preview      # 预览生产构建
npm run test         # 运行测试
```

## 七、API文档

启动后端后访问：
- Swagger UI: http://localhost:3000/api-docs
- API Base: http://localhost:3000/api

### 主要API端点

| 模块 | 端点 | 方法 |
|------|------|------|
| 认证 | /api/auth/login | POST |
| 商品 | /api/products | GET, POST |
| 库存 | /api/inventory | GET, POST |
| 销售 | /api/sale/orders | GET, POST |
| 会员 | /api/members | GET, POST |
| 报表 | /api/reports/dashboard | GET |

## 八、默认账号

初始化数据库后使用：
- 用户名: admin
- 密码: admin123

## 九、常见问题

### Q: 依赖安装失败？
```bash
# 清理缓存后重试
npm cache clean --force
rm -rf node_modules
npm install
```

### Q: 数据库连接失败？
检查 `.env` 中的 `DATABASE_URL` 是否正确，确保MySQL服务已启动。

### Q: 端口被占用？
修改 `.env` 中的 `PORT` 或 `VITE_API_URL` 使用其他端口。