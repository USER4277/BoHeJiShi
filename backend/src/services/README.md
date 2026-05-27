# Service 层架构说明

## 概述

根据设计文档要求,已将业务逻辑从 `routes` 层抽取到独立的 `services` 层,实现更清晰的代码职责划分。

## 目录结构

```
backend/src/
├── routes/           # 路由层 - 处理HTTP请求和响应
│   ├── product.ts    # 商品路由
│   ├── sale.ts       # 销售路由
│   └── ...
├── services/         # 业务逻辑层 - 处理核心业务逻辑
│   ├── product.service.ts  # 商品业务逻辑
│   ├── sale.service.ts     # 销售业务逻辑
│   └── ...
└── config/           # 配置层 - Prisma等配置
```

## 职责划分

### Routes层职责
- HTTP请求参数解析和验证
- 调用Service层方法
- 处理响应格式化(success/error)
- 权限控制(通过middleware)

### Services层职责
- 核心业务逻辑实现
- 数据库操作(通过Prisma)
- 业务规则验证
- 事务处理
- 数据转换

## 已实现的Service

### 1. ProductService (product.service.ts)

**功能**:
- `getProducts()` - 获取商品列表(分页)
- `getProductById()` - 获取商品详情
- `createProduct()` - 创建商品
- `updateProduct()` - 更新商品
- `deleteProduct()` - 删除商品
- `updateStatus()` - 更新商品状态

**示例使用**:
```typescript
import { productService } from '../services/product.service';

// 在路由中调用
const result = await productService.getProducts({
  page: 1,
  pageSize: 20,
  categoryId: 1
});
```

### 2. SaleService (sale.service.ts)

**功能**:
- `createOrder()` - 创建销售订单
- `getOrders()` - 获取订单列表
- `getOrderById()` - 获取订单详情
- `createReturn()` - 创建退货单
- `decreaseInventory()` - 扣减库存(私有方法)
- `increaseInventory()` - 增加库存(私有方法)

**特性**:
- 使用Prisma事务确保数据一致性
- 自动处理库存扣减和恢复
- 自动处理会员积分计算和记录

**示例使用**:
```typescript
import { saleService } from '../services/sale.service';

// 创建订单
const order = await saleService.createOrder({
  items: [
    { skuId: 1, productName: '商品A', quantity: 2, unitPrice: 100 }
  ],
  memberId: 123,
  payWay: { cash: 200 },
  cashierId: 1
});
```

## 待实现的Service

根据项目需求,还需要实现以下Service:

### 3. InventoryService (inventory.service.ts)
- 库存查询
- 入库管理
- 出库管理
- 盘点管理
- 库存预警

### 4. MemberService (member.service.ts)
- 会员管理
- 积分管理
- 储值管理
- 会员等级升级

### 5. ReportService (report.service.ts)
- 仪表盘数据
- 日结账
- 销售报表
- 库存报表

## Service层设计原则

### 1. 单一职责
每个Service负责一个明确的业务领域。

### 2. 依赖注入
Service通过构造函数或方法参数接收依赖,便于测试。

### 3. 错误处理
- Service层抛出业务异常
- Route层捕获异常并转换为HTTP响应

### 4. 事务管理
涉及多表操作时,使用Prisma事务确保数据一致性:
```typescript
await prisma.$transaction(async (tx) => {
  // 多个数据库操作
});
```

### 5. 私有方法
将内部辅助方法标记为`private`,不对外暴露。

## 迁移指南

### 将现有Route迁移到Service模式

**Before (routes/product.ts)**:
```typescript
router.post('/', async (req, res) => {
  try {
    const product = await prisma.product.create({
      data: { ... }
    });
    success(res, product);
  } catch (err) {
    error(res, 500, '创建失败');
  }
});
```

**After**:

**services/product.service.ts**:
```typescript
export class ProductService {
  async createProduct(data) {
    const product = await prisma.product.create({
      data: { ... }
    });
    return product;
  }
}
```

**routes/product.ts**:
```typescript
import { productService } from '../services/product.service';

router.post('/', async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);
    success(res, product);
  } catch (err) {
    error(res, 500, err.message);
  }
});
```

## 测试策略

### Service层测试
- 使用单元测试验证业务逻辑
- Mock Prisma数据库操作
- 测试业务规则和边界条件

### Route层测试
- 使用集成测试验证HTTP接口
- 测试参数验证和响应格式

## 性能优化

### 1. 批量操作
使用Prisma的批量操作减少数据库往返:
```typescript
await prisma.product.createMany({
  data: [...]
});
```

### 2. 查询优化
使用`include`和`select`优化关联查询:
```typescript
await prisma.product.findMany({
  include: { category: true },
  select: { id: true, name: true }
});
```

### 3. 缓存
对频繁查询的数据添加缓存(可选)。

## 后续计划

1. ✅ 完成ProductService
2. ✅ 完成SaleService
3. ⏳ 完成InventoryService
4. ⏳ 完成MemberService
5. ⏳ 完成ReportService
6. ⏳ 为所有Service添加单元测试
7. ⏳ 添加Service层API文档

---

**最后更新**: 2026-05-27  
**状态**: 进行中 (2/5 完成)
