# 薄荷集市店铺管理系统 - 快速启动指南

## 一、环境准备

### 1.1 必要环境
- Node.js >= 18.0.0
- npm >= 9.0.0
- MySQL >= 8.0（或其他Prisma支持的数据库）

### 1.2 安装依赖

```bash
# 后端依赖
cd backend
npm install

# 前端依赖
cd ../frontend
npm install
```

## 二、配置

### 2.1 后端配置

编辑 `backend/.env`:
```env
DATABASE_URL="mysql://user:password@localhost:3306/bohe_market"
JWT_SECRET="your-secret-key-change-in-production"
PORT=3000
```

### 2.2 数据库初始化

```bash
cd backend

# 生成Prisma客户端
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev --name init

# 初始化管理员账号
npm run init-db
```

## 三、运行项目

### 3.1 开发模式

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