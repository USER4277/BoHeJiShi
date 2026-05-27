import { Router } from 'express';
import { prisma } from '../config';
import { authMiddleware } from '../middleware/auth';
import { success, error, pageSuccess } from '../utils/response';

const router = Router();
router.use(authMiddleware);

// 生成调拨单号
function generateTransferNo() {
  return 'DB' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
}

// 获取调拨单列表
router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 20, status } = req.query;
    
    const where: any = {};
    if (status !== undefined) where.status = parseInt(status as string);
    
    const [items, total] = await Promise.all([
      prisma.transfer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(pageSize),
        take: Number(pageSize)
      }),
      prisma.transfer.count({ where })
    ]);
    
    pageSuccess(res, items, total, Number(page), Number(pageSize));
  } catch (err) {
    console.error('获取调拨单列表失败:', err);
    error(res, 500, '获取调拨单列表失败');
  }
});

// 获取调拨单详情
router.get('/:id', async (req, res) => {
  try {
    const transfer = await prisma.transfer.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { items: true }
    });
    
    if (!transfer) {
      return error(res, 404, '调拨单不存在');
    }
    
    success(res, transfer, '获取成功');
  } catch (err) {
    console.error('获取调拨单详情失败:', err);
    error(res, 500, '获取调拨单详情失败');
  }
});

// 新建调拨单
router.post('/', async (req, res) => {
  try {
    const { fromWarehouse, toWarehouse, items, remark } = req.body;
    
    const transfer = await prisma.transfer.create({
      data: {
        transferNo: generateTransferNo(),
        fromWarehouse,
        toWarehouse,
        remark,
        status: 0
      }
    });
    
    // 创建调拨明细
    if (items && items.length > 0) {
      await prisma.transferItem.createMany({
        data: items.map((item: any) => ({
          transferId: transfer.id,
          skuId: item.skuId,
          quantity: item.quantity
        }))
      });
    }
    
    success(res, transfer, '创建成功');
  } catch (err) {
    console.error('创建调拨单失败:', err);
    error(res, 500, '创建调拨单失败');
  }
});

// 确认出库
router.put('/:id/out', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const transfer = await prisma.transfer.findUnique({
      where: { id },
      include: { items: true }
    });
    
    if (!transfer) {
      return error(res, 404, '调拨单不存在');
    }
    
    // 减少出库仓库库存
    for (const item of transfer.items) {
      const inventory = await prisma.inventory.findFirst({
        where: { skuId: item.skuId, warehouseId: transfer.fromWarehouse }
      });
      
      if (inventory) {
        await prisma.inventory.update({
          where: { id: inventory.id },
          data: { quantity: inventory.quantity - item.quantity }
        });
        
        // 记录库存变动
        await prisma.inventoryLog.create({
          data: {
            skuId: item.skuId,
            changeType: 'out',
            changeQuantity: item.quantity,
            beforeQuantity: inventory.quantity,
            afterQuantity: inventory.quantity - item.quantity,
            billType: 'transfer',
            billId: id,
            remark: '调拨出库'
          }
        });
      }
    }
    
    await prisma.transfer.update({
      where: { id },
      data: { status: 1 }
    });
    
    success(res, null, '出库完成');
  } catch (err) {
    console.error('确认出库失败:', err);
    error(res, 500, '确认出库失败');
  }
});

// 确认入库
router.put('/:id/in', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const transfer = await prisma.transfer.findUnique({
      where: { id },
      include: { items: true }
    });
    
    if (!transfer) {
      return error(res, 404, '调拨单不存在');
    }
    
    // 增加入库仓库库存
    for (const item of transfer.items) {
      const inventory = await prisma.inventory.findFirst({
        where: { skuId: item.skuId, warehouseId: transfer.toWarehouse }
      });
      
      if (inventory) {
        await prisma.inventory.update({
          where: { id: inventory.id },
          data: { quantity: inventory.quantity + item.quantity }
        });
      } else {
        await prisma.inventory.create({
          data: {
            skuId: item.skuId,
            warehouseId: transfer.toWarehouse,
            quantity: item.quantity
          }
        });
      }
      
      // 记录库存变动
      await prisma.inventoryLog.create({
        data: {
          skuId: item.skuId,
          changeType: 'in',
          changeQuantity: item.quantity,
          beforeQuantity: 0,
          afterQuantity: item.quantity,
          billType: 'transfer',
          billId: id,
          remark: '调拨入库'
        }
      });
    }
    
    await prisma.transfer.update({
      where: { id },
      data: { status: 2 }
    });
    
    success(res, null, '入库完成');
  } catch (err) {
    console.error('确认入库失败:', err);
    error(res, 500, '确认入库失败');
  }
});

// 取消调拨单
router.delete('/:id', async (req, res) => {
  try {
    await prisma.transfer.delete({
      where: { id: parseInt(req.params.id) }
    });
    
    success(res, null, '删除成功');
  } catch (err) {
    console.error('删除调拨单失败:', err);
    error(res, 500, '删除调拨单失败');
  }
});

export default router;