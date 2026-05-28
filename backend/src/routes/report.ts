import { Router } from 'express';
import { prisma } from '../config';
import { authMiddleware } from '../middleware/auth';
import { success, error } from '../utils/response';
import dayjs from 'dayjs';

const router = Router();

router.use(authMiddleware);

// 获取仪表盘数据
router.get('/dashboard', async (req, res) => {
  try {
    const today = dayjs().startOf('day').toDate();
    const tomorrow = dayjs().startOf('day').add(1, 'day').toDate();
    const thisMonth = dayjs().startOf('month').toDate();
    
    // 今日数据
    const todayOrders = await prisma.order.findMany({
      where: { createdAt: { gte: today, lt: tomorrow }, status: 1 },
      include: { items: true }
    });
    
    const todaySales = todayOrders.reduce((sum, order) => sum + order.payAmount, 0);
    const todayCount = todayOrders.length;
    const todayQuantity = todayOrders.reduce((sum, order) => sum + order.totalQuantity, 0);
    
    // 本月数据
    const monthOrders = await prisma.order.findMany({
      where: { createdAt: { gte: thisMonth }, status: 1 }
    });
    
    const monthSales = monthOrders.reduce((sum, order) => sum + order.payAmount, 0);
    const monthCount = monthOrders.length;
    
    // 会员数据
    const newMembersThisMonth = await prisma.member.count({
      where: { createdAt: { gte: thisMonth } }
    });
    
    // 库存预警
    const inventories = await prisma.inventory.findMany({
      include: { sku: { include: { product: true } } }
    });
    
    const warnings = inventories.filter((inv: any) => inv.quantity < inv.safeQuantity);
    
    // 热销商品统计
    // 只统计已完成订单（status=1），自动排除已退货订单（status=0）
    // 这样可以确保热销商品的数量准确反映实际销售情况
    const orderItems = await prisma.orderItem.groupBy({
      by: ['skuId', 'productName'],
      _sum: { quantity: true },
      where: {
        order: {
          createdAt: { gte: thisMonth },
          status: 1 // 只统计已完成的订单，排除已退货(status=0)
        }
      },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    });

    // 退货榜单
    const refundOrders = await prisma.orderReturn.findMany({
      where: {
        createdAt: { gte: thisMonth }
      },
      include: {
        order: {
          include: {
            items: true,
            member: true
          }
        }
      },
      orderBy: { returnAmount: 'desc' },
      take: 5
    });

    const refundLeaderboard = refundOrders.map(refund => ({
      orderNo: refund.order.orderNo,
      memberName: refund.order.member?.name || '散客',
      returnAmount: parseFloat(refund.returnAmount.toFixed(2)),
      returnReason: refund.returnReason,
      productNames: refund.order.items.map(item => item.productName).join(', '),
      createdAt: refund.createdAt
    }));

    success(res, {
      today: {
        sales: parseFloat(todaySales.toFixed(2)),
        count: todayCount,
        quantity: todayQuantity
      },
      month: {
        sales: parseFloat(monthSales.toFixed(2)),
        count: monthCount
      },
      newMembers: newMembersThisMonth,
      inventoryWarnings: warnings.length,
      hotProducts: orderItems,
      refundLeaderboard
    }, '获取成功');
  } catch (err) {
    console.error('获取仪表盘数据失败:', err);
    error(res, 500, '获取仪表盘数据失败');
  }
});

// 获取日报
router.get('/daily', async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? dayjs(date as string).startOf('day').toDate() : dayjs().startOf('day').toDate();
    const nextDate = dayjs(targetDate).add(1, 'day').toDate();
    
    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: targetDate, lt: nextDate }, status: 1 },
      include: { items: true }
    });
    
    const salesAmount = orders.reduce((sum, order) => sum + order.payAmount, 0);
    const refundOrders = await prisma.order.count({
      where: { createdAt: { gte: targetDate, lt: nextDate }, status: 0 }
    });
    
    const totalQuantity = orders.reduce((sum, order) => sum + order.totalQuantity, 0);
    const discountAmount = orders.reduce((sum, order) => sum + order.discountAmount, 0);
    
    success(res, {
      date: dayjs(targetDate).format('YYYY-MM-DD'),
      salesCount: orders.length,
      salesAmount: parseFloat(salesAmount.toFixed(2)),
      totalQuantity,
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      refundCount: refundOrders
    }, '获取成功');
  } catch (err) {
    console.error('获取日报失败:', err);
    error(res, 500, '获取日报失败');
  }
});

// 日结
router.post('/settlement', async (req, res) => {
  try {
    const { date } = req.body;
    const targetDate = date ? dayjs(date as string).startOf('day').toDate() : dayjs().startOf('day').toDate();
    const nextDate = dayjs(targetDate).add(1, 'day').toDate();
    
    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: targetDate, lt: nextDate }, status: 1 }
    });
    
    const salesAmount = orders.reduce((sum, order) => sum + order.payAmount, 0);
    const refundAmount = orders.reduce((sum, order) => {
      return sum + (order.status === 0 ? order.payAmount : 0);
    }, 0);
    const discountAmount = orders.reduce((sum, order) => sum + order.discountAmount, 0);
    
    // 统计支付方式
    let cashAmount = 0, wechatAmount = 0, alipayAmount = 0;
    orders.forEach(order => {
      try {
        const payWay = JSON.parse(order.payWay || '{}');
        cashAmount += payWay.cash || 0;
        wechatAmount += payWay.wechat || 0;
        alipayAmount += payWay.alipay || 0;
      } catch (e) {}
    });
    
    const settlement = await prisma.dailySettlement.upsert({
      where: { settlementDate: targetDate },
      create: {
        settlementDate: targetDate,
        salesCount: orders.length,
        salesAmount: parseFloat(salesAmount.toFixed(2)),
        cashAmount: parseFloat(cashAmount.toFixed(2)),
        wechatAmount: parseFloat(wechatAmount.toFixed(2)),
        alipayAmount: parseFloat(alipayAmount.toFixed(2)),
        refundCount: 0,
        refundAmount: parseFloat(refundAmount.toFixed(2)),
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        status: 1,
        operatorId: req.user?.id
      },
      update: {
        salesCount: orders.length,
        salesAmount: parseFloat(salesAmount.toFixed(2)),
        cashAmount: parseFloat(cashAmount.toFixed(2)),
        wechatAmount: parseFloat(wechatAmount.toFixed(2)),
        alipayAmount: parseFloat(alipayAmount.toFixed(2)),
        refundCount: 0,
        refundAmount: parseFloat(refundAmount.toFixed(2)),
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        status: 1,
        operatorId: req.user?.id
      }
    });
    
    success(res, settlement, '日结成功');
  } catch (err) {
    console.error('日结失败:', err);
    error(res, 500, '日结失败');
  }
});

// 销售统计
router.get('/sales', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where: any = { status: 1 };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }
    
    const orders = await prisma.order.findMany({
      where,
      include: { items: true }
    });
    
    // 按日期统计
    const dailyStats: any = {};
    orders.forEach(order => {
      const date = dayjs(order.createdAt).format('YYYY-MM-DD');
      if (!dailyStats[date]) {
        dailyStats[date] = { sales: 0, count: 0 };
      }
      dailyStats[date].sales += order.payAmount;
      dailyStats[date].count += 1;
    });

    // 修正浮点数精度
    Object.keys(dailyStats).forEach(date => {
      dailyStats[date].sales = parseFloat(dailyStats[date].sales.toFixed(2));
    });

    // 商品销售排行
    const productStats = await prisma.orderItem.groupBy({
      by: ['productName'],
      _sum: { quantity: true, amount: true },
      where: { order: where },
      orderBy: { _sum: { amount: 'desc' } },
      take: 20
    });

    // 修正商品销售金额精度
    const formattedProductStats = productStats.map(item => ({
      ...item,
      _sum: {
        quantity: item._sum.quantity,
        amount: parseFloat((item._sum.amount || 0).toFixed(2))
      }
    }));

    const totalSales = parseFloat(orders.reduce((sum, order) => sum + order.payAmount, 0).toFixed(2));

    success(res, {
      totalSales,
      totalCount: orders.length,
      dailyStats,
      productStats: formattedProductStats
    }, '获取成功');
  } catch (err) {
    console.error('获取销售统计失败:', err);
    error(res, 500, '获取销售统计失败');
  }
});

export default router;