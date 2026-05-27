import { Router } from 'express';
import { prisma } from '../config';
import { authMiddleware } from '../middleware/auth';
import { success, error, pageSuccess } from '../utils/response';

const router = Router();
router.use(authMiddleware);

// 生成盘点单号
function generateStocktakingNo() {
  return 'PD' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
}

// 获取盘点单列表
router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 20, status } = req.query;
    
    const where: any = {};
    if (status !== undefined) where.status = parseInt(status as string);
    
    const [items, total] = await Promise.all([
      prisma.stocktaking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(pageSize),
        take: Number(pageSize)
      }),
      prisma.stocktaking.count({ where })
    ]);
    
    pageSuccess(res, items, total, Number(page), Number(pageSize));
  } catch (err) {
    console.error('获取盘点单列表失败:', err);
    error(res, 500, '获取盘点单列表失败');
  }
});

// 获取盘点单详情
router.get('/:id', async (req, res) => {
  try {
    const stocktaking = await prisma.stocktaking.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { items: true }
    });
    
    if (!stocktaking) {
      return error(res, 404, '盘点单不存在');
    }
    
    success(res, stocktaking, '获取成功');
  } catch (err) {
    console.error('获取盘点单详情失败:', err);
    error(res, 500, '获取盘点单详情失败');
  }
});

// 新建盘点单
router.post('/', async (req, res) => {
  try {
    const { type, warehouseId, remark } = req.body;
    
    const stocktaking = await prisma.stocktaking.create({
      data: {
        stocktakingNo: generateStocktakingNo(),
        type: type || 1,
        warehouseId: warehouseId || 1,
        remark,
        status: 0
      }
    });
    
    success(res, stocktaking, '创建成功');
  } catch (err) {
    console.error('创建盘点单失败:', err);
    error(res, 500, '创建盘点单失败');
  }
});

// 开始盘点
router.put('/:id/start', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // 获取所有SKU用于盘点
    const skus = await prisma.sku.findMany({
      where: { status: 1 },
      take: 100
    });
    
    // 创建盘点明细
    await prisma.stocktakingItem.createMany({
      data: skus.map(sku => ({
        stocktakingId: id,
        skuId: sku.id,
        systemQuantity: sku.stockQuantity,
        actualQuantity: sku.stockQuantity,
        profitQuantity: 0
      }))
    });
    
    // 更新盘点单状态
    const stocktaking = await prisma.stocktaking.update({
      where: { id },
      data: { status: 1 }
    });
    
    success(res, stocktaking, '已开始盘点');
  } catch (err) {
    console.error('开始盘点失败:', err);
    error(res, 500, '开始盘点失败');
  }
});

// 提交盘点结果
router.put('/:id/submit', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { items } = req.body;
    
    // 更新每个盘点明细
    for (const item of items) {
      const profit = item.actualQuantity - item.systemQuantity;
      await prisma.stocktakingItem.update({
        where: { id: item.id },
        data: { actualQuantity: item.actualQuantity, profitQuantity: profit }
      });
      
      // 调整库存
      if (profit !== 0) {
        await prisma.sku.update({
          where: { id: item.skuId },
          data: { stockQuantity: item.actualQuantity }
        });
        
        // 记录库存变动
        await prisma.inventoryLog.create({
          data: {
            skuId: item.skuId,
            changeType: profit > 0 ? 'in' : 'out',
            changeQuantity: Math.abs(profit),
            beforeQuantity: item.systemQuantity,
            afterQuantity: item.actualQuantity,
            billType: 'stocktaking',
            billId: id,
            remark: profit > 0 ? '盘盈' : '盘亏'
          }
        });
      }
    }
    
    const stocktaking = await prisma.stocktaking.update({
      where: { id },
      data: { status: 2, auditedAt: new Date() }
    });
    
    success(res, stocktaking, '盘点完成');
  } catch (err) {
    console.error('提交盘点结果失败:', err);
    error(res, 500, '提交盘点结果失败');
  }
});

// 审核盘点单
router.put('/:id/audit', async (req, res) => {
  try {
    const stocktaking = await prisma.stocktaking.update({
      where: { id: parseInt(req.params.id) },
      data: { 
        status: 2, 
        auditedAt: new Date() 
      }
    });
    
    success(res, stocktaking, '审核完成');
  } catch (err) {
    console.error('审核盘点单失败:', err);
    error(res, 500, '审核盘点单失败');
  }
});

export default router;