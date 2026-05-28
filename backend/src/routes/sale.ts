import { Router } from 'express';
import { prisma } from '../config';
import { authMiddleware } from '../middleware/auth';
import { success, error, pageSuccess } from '../utils/response';
import { generateOrderNo, generateReturnNo, generateHoldNo } from '../utils/code';

const router = Router();

router.use(authMiddleware);

// 创建订单
router.post('/orders', async (req, res) => {
  try {
    const { items, memberId, payWay, remark, discountAmount = 0, usePoints = 0 } = req.body;

    if (!items || items.length === 0) {
      return error(res, 400, '请选择商品');
    }

    // 计算订单金额
    let totalQuantity = 0;
    let totalAmount = 0;

    for (const item of items) {
      const sku = await prisma.sku.findUnique({ where: { id: item.skuId } });
      if (!sku) {
        return error(res, 400, `商品不存在`);
      }

      const inventory = await prisma.inventory.findFirst({ where: { skuId: item.skuId } });
      if (!inventory || inventory.quantity < item.quantity) {
        return error(res, 400, `${sku.skuCode} 库存不足`);
      }

      totalQuantity += item.quantity;
      totalAmount += sku.price * item.quantity;
    }

    // 积分抵扣金额（1积分=0.002元）
    const pointsDeduction = usePoints * 0.002;

    // 验证会员积分是否足够
    if (memberId && usePoints > 0) {
      const member = await prisma.member.findUnique({ where: { id: memberId } });
      if (!member) {
        return error(res, 400, '会员不存在');
      }
      if (member.points < usePoints) {
        return error(res, 400, '会员积分不足');
      }
    }

    const payAmount = Math.max(0, totalAmount - discountAmount - pointsDeduction);
    const pointsEarned = Math.floor(payAmount);

    // 创建订单
    const orderNo = generateOrderNo();
    const order = await prisma.order.create({
      data: {
        orderNo,
        memberId,
        cashierId: req.user!.id,
        totalQuantity,
        totalAmount,
        discountAmount: discountAmount + pointsDeduction, // 包含积分抵扣
        payAmount,
        payWay: JSON.stringify(payWay),
        pointsEarned,
        pointsUsed: usePoints,
        remark: remark ? `${remark}${usePoints > 0 ? ` (积分抵扣: ${usePoints}积分/-¥${pointsDeduction.toFixed(2)})` : ''}` : (usePoints > 0 ? `积分抵扣: ${usePoints}积分/-¥${pointsDeduction.toFixed(2)}` : ''),
        items: {
          create: items.map((item: any) => ({
            skuId: item.skuId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.unitPrice * item.quantity
          }))
        }
      },
      include: { items: true }
    });

    // 扣减库存
    for (const item of items) {
      await decreaseInventory(item.skuId, item.quantity);
    }

    // 更新会员积分和消费
    if (memberId) {
      const member = await prisma.member.findUnique({ where: { id: memberId } });
      if (member) {
        // 扣除使用的积分，增加获得的积分
        const newPoints = member.points - usePoints + pointsEarned;

        await prisma.member.update({
          where: { id: memberId },
          data: {
            points: newPoints,
            totalConsume: { increment: payAmount }
          }
        });

        // 记录积分使用
        if (usePoints > 0) {
          await prisma.pointsLog.create({
            data: {
              memberId,
              changeType: 'exchange',
              points: -usePoints,
              balance: member.points - usePoints,
              source: 'order',
              orderId: order.id,
              description: `消费抵扣 ${usePoints} 积分，抵扣金额 ¥${pointsDeduction.toFixed(2)}`
            }
          });
        }

        // 记录积分获得
        if (pointsEarned > 0) {
          await prisma.pointsLog.create({
            data: {
              memberId,
              changeType: 'earn',
              points: pointsEarned,
              balance: newPoints,
              source: 'order',
              orderId: order.id,
              description: `消费获得积分`
            }
          });
        }
      }
    }

    success(res, order, '订单创建成功');
  } catch (err: any) {
    console.error('创建订单失败:', err);
    error(res, 500, err.message || '创建订单失败');
  }
});

// 获取订单列表
router.get('/orders', async (req, res) => {
  try {
    const { page = 1, pageSize = 20, memberId, status, startDate, endDate } = req.query;
    
    const where: any = {};
    if (memberId) where.memberId = parseInt(memberId as string);
    if (status) where.status = parseInt(status as string);
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }
    
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { member: true, cashier: true, items: true },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(pageSize),
        take: Number(pageSize)
      }),
      prisma.order.count({ where })
    ]);
    
    pageSuccess(res, orders, total, Number(page), Number(pageSize));
  } catch (err) {
    console.error('获取订单列表失败:', err);
    error(res, 500, '获取订单列表失败');
  }
});

// 订单详情
router.get('/orders/:id', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        member: true,
        cashier: true,
        items: { include: { sku: true } },
        returns: true
      }
    });

    if (!order) {
      return error(res, 404, '订单不存在');
    }

    success(res, order, '获取成功');
  } catch (err) {
    console.error('获取订单详情失败:', err);
    error(res, 500, '获取订单详情失败');
  }
});

// 获取挂单列表
router.get('/holds', async (req, res) => {
  try {
    const holds = await prisma.orderHold.findMany({
      where: {
        expiresAt: { gt: new Date() } // 只返回未过期的挂单
      },
      orderBy: { createdAt: 'desc' }
    });

    success(res, holds, '获取成功');
  } catch (err) {
    console.error('获取挂单列表失败:', err);
    error(res, 500, '获取挂单列表失败');
  }
});

// 挂单
router.post('/holds', async (req, res) => {
  try {
    const { memberId, data } = req.body;
    
    const holdNo = generateHoldNo();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30分钟后过期
    
    const hold = await prisma.orderHold.create({
      data: {
        holdNo,
        memberId,
        data: JSON.stringify(data),
        expiresAt
      }
    });
    
    success(res, hold, '挂单成功');
  } catch (err) {
    console.error('挂单失败:', err);
    error(res, 500, '挂单失败');
  }
});

// 取单
router.get('/holds/:no', async (req, res) => {
  try {
    const hold = await prisma.orderHold.findUnique({
      where: { holdNo: req.params.no }
    });

    if (!hold) {
      return error(res, 404, '挂单不存在');
    }

    if (new Date() > hold.expiresAt) {
      return error(res, 400, '挂单已过期');
    }

    // 取单成功后删除该挂单
    await prisma.orderHold.delete({
      where: { holdNo: req.params.no }
    });

    success(res, { ...hold, data: JSON.parse(hold.data) }, '取单成功');
  } catch (err) {
    console.error('取单失败:', err);
    error(res, 500, '取单失败');
  }
});

// 退货
router.post('/returns', async (req, res) => {
  try {
    const { orderId, returnReason } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order) {
      return error(res, 404, '订单不存在');
    }

    if (order.status === 0) {
      return error(res, 400, '订单已退货');
    }

    // 退货单号
    const returnNo = generateReturnNo();

    // 计算退款金额：应退实际支付金额，不包括积分抵扣
    // 如果订单使用了积分抵扣，那部分金额不退现金，而是返还积分
    const returnAmount = order.payAmount;

    // 创建退货单
    await prisma.orderReturn.create({
      data: {
        returnNo,
        orderId,
        returnReason,
        returnAmount,
        status: 1,
        operatorId: req.user!.id
      }
    });

    // 更新订单状态
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 0 }
    });

    // 恢复库存
    for (const item of order.items) {
      await increaseInventory(item.skuId, item.quantity);
    }

    // 处理会员积分
    if (order.memberId) {
      const member = await prisma.member.findUnique({ where: { id: order.memberId } });
      if (member) {
        let pointsChange = 0;
        const pointsLogs = [];

        // 1. 返还使用的积分（如果订单使用了积分抵扣）
        if (order.pointsUsed > 0) {
          pointsChange += order.pointsUsed;
          pointsLogs.push({
            memberId: order.memberId,
            changeType: 'refund',
            points: order.pointsUsed,
            balance: member.points + order.pointsUsed,
            source: 'refund',
            orderId: order.id,
            description: `退货返还消费抵扣积分`
          });
        }

        // 2. 扣减购物获得的积分
        if (order.pointsEarned > 0) {
          pointsChange -= order.pointsEarned;
          pointsLogs.push({
            memberId: order.memberId,
            changeType: 'refund',
            points: -order.pointsEarned,
            balance: member.points + pointsChange,
            source: 'refund',
            orderId: order.id,
            description: `退货扣除消费获得积分`
          });
        }

        // 更新会员积分和消费额
        await prisma.member.update({
          where: { id: order.memberId },
          data: {
            points: { increment: pointsChange },
            totalConsume: { decrement: order.payAmount }
          }
        });

        // 记录积分变动
        for (const log of pointsLogs) {
          await prisma.pointsLog.create({ data: log });
        }
      }
    }

    success(res, null, '退货成功');
  } catch (err) {
    console.error('退货失败:', err);
    error(res, 500, '退货失败');
  }
});

// 扣减库存
async function decreaseInventory(skuId: number, quantity: number) {
  const inventory = await prisma.inventory.findFirst({ where: { skuId } });
  if (inventory) {
    await prisma.inventory.update({
      where: { id: inventory.id },
      data: { quantity: { decrement: quantity } }
    });
  }
  await prisma.sku.update({
    where: { id: skuId },
    data: { stockQuantity: { decrement: quantity } }
  });
}

// 增加库存
async function increaseInventory(skuId: number, quantity: number) {
  let inventory = await prisma.inventory.findFirst({ where: { skuId } });
  if (inventory) {
    inventory = await prisma.inventory.update({
      where: { id: inventory.id },
      data: { quantity: { increment: quantity } }
    });
  } else {
    inventory = await prisma.inventory.create({
      data: { skuId, quantity, warehouseId: 1 }
    });
  }
  await prisma.sku.update({
    where: { id: skuId },
    data: { stockQuantity: { increment: quantity } }
  });
}

export default router;