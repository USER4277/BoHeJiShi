import { Router } from 'express';
import { prisma } from '../config';
import { authMiddleware } from '../middleware/auth';
import { success, error } from '../utils/response';

const router = Router();

router.use(authMiddleware);

// 获取库存列表
router.get('/', async (req, res) => {
  try {
    const { skuId, keyword } = req.query;
    
    const where: any = {};
    if (skuId) where.skuId = parseInt(skuId as string);
    
    const inventories = await prisma.inventory.findMany({
      where,
      include: { sku: { include: { product: true } } }
    });
    
    // 过滤关键词
    let result = inventories;
    if (keyword) {
      result = inventories.filter((inv: any) => 
        inv.sku.product.name.includes(keyword as string) || 
        inv.sku.skuCode.includes(keyword as string)
      );
    }
    
    success(res, result, '获取成功');
  } catch (err) {
    console.error('获取库存列表失败:', err);
    error(res, 500, '获取库存列表失败');
  }
});

// 获取库存预警
router.get('/warnings', async (req, res) => {
  try {
    const inventories = await prisma.inventory.findMany({
      where: {
        quantity: { lt: prisma.inventory.fields.safeQuantity }
      },
      include: { sku: { include: { product: true } } }
    });
    
    const warnings = inventories.filter((inv: any) => inv.quantity < inv.safeQuantity);
    
    success(res, warnings, '获取成功');
  } catch (err) {
    console.error('获取库存预警失败:', err);
    error(res, 500, '获取库存预警失败');
  }
});

// 入库
router.post('/in', async (req, res) => {
  try {
    const { skuId, quantity, remark } = req.body;

    if (!skuId || !quantity) {
      return error(res, 400, '请填写必填项');
    }

    // 转换为整数
    const skuIdInt = parseInt(skuId);
    const quantityInt = parseInt(quantity);

    // 获取当前库存
    let inventory = await prisma.inventory.findFirst({
      where: { skuId: skuIdInt, warehouseId: 1 }
    });

    const beforeQuantity = inventory?.quantity || 0;
    const afterQuantity = beforeQuantity + quantityInt;
    
    if (inventory) {
      inventory = await prisma.inventory.update({
        where: { id: inventory.id },
        data: {
          quantity: afterQuantity,
          lastInTime: new Date()
        }
      });
    } else {
      inventory = await prisma.inventory.create({
        data: { skuId: skuIdInt, quantity: quantityInt, warehouseId: 1 }
      });
    }

    // 记录库存变动
    await prisma.inventoryLog.create({
      data: {
        skuId: skuIdInt,
        changeType: 'in',
        changeQuantity: quantityInt,
        beforeQuantity,
        afterQuantity,
        billType: 'IN',
        operatorId: req.user?.id,
        remark
      }
    });

    // 更新商品库存
    await updateProductStock(skuIdInt);
    
    success(res, inventory, '入库成功');
  } catch (err) {
    console.error('入库失败:', err);
    error(res, 500, '入库失败');
  }
});

// 出库
router.post('/out', async (req, res) => {
  try {
    const { skuId, quantity, remark } = req.body;

    if (!skuId || !quantity) {
      return error(res, 400, '请填写必填项');
    }

    // 转换为整数
    const skuIdInt = parseInt(skuId);
    const quantityInt = parseInt(quantity);

    // 获取当前库存
    let inventory = await prisma.inventory.findFirst({
      where: { skuId: skuIdInt, warehouseId: 1 }
    });

    if (!inventory || inventory.quantity < quantityInt) {
      return error(res, 400, '库存不足');
    }

    const beforeQuantity = inventory.quantity;
    const afterQuantity = beforeQuantity - quantityInt;
    
    inventory = await prisma.inventory.update({
      where: { id: inventory.id },
      data: {
        quantity: afterQuantity,
        lastOutTime: new Date()
      }
    });

    // 记录库存变动
    await prisma.inventoryLog.create({
      data: {
        skuId: skuIdInt,
        changeType: 'out',
        changeQuantity: -quantityInt,
        beforeQuantity,
        afterQuantity,
        billType: 'OUT',
        operatorId: req.user?.id,
        remark
      }
    });

    // 更新商品库存
    await updateProductStock(skuIdInt);
    
    success(res, inventory, '出库成功');
  } catch (err) {
    console.error('出库失败:', err);
    error(res, 500, '出库失败');
  }
});

// 获取库存记录
router.get('/logs', async (req, res) => {
  try {
    const { skuId, changeType } = req.query;
    
    const where: any = {};
    if (skuId) where.skuId = parseInt(skuId as string);
    if (changeType) where.changeType = changeType as string;
    
    const logs = await prisma.inventoryLog.findMany({
      where,
      include: { sku: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    
    success(res, logs, '获取成功');
  } catch (err) {
    console.error('获取库存记录失败:', err);
    error(res, 500, '获取库存记录失败');
  }
});

// 更新商品总库存
async function updateProductStock(skuId: number) {
  try {
    const sku = await prisma.sku.findUnique({
      where: { id: skuId },
      select: { productId: true }
    });

    if (!sku) return;

    // 汇总该商品所有SKU的库存
    const allSkus = await prisma.sku.findMany({
      where: { productId: sku.productId },
      select: { id: true }
    });

    const skuIds = allSkus.map(s => s.id);

    // 从 Inventory 表获取总库存
    const totalInventory = await prisma.inventory.aggregate({
      where: {
        skuId: { in: skuIds },
        warehouseId: 1
      },
      _sum: { quantity: true }
    });

    const totalStock = totalInventory._sum.quantity || 0;

    // 更新商品总库存
    await prisma.product.update({
      where: { id: sku.productId },
      data: { stockQuantity: totalStock }
    });

    // 同时更新 SKU 的库存数量（保持同步）
    const skuInventory = await prisma.inventory.findFirst({
      where: { skuId, warehouseId: 1 }
    });

    if (skuInventory) {
      await prisma.sku.update({
        where: { id: skuId },
        data: { stockQuantity: skuInventory.quantity }
      });
    }
  } catch (err) {
    console.error('更新商品库存失败:', err);
    throw err;
  }
}

export default router;