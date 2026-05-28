import { Router } from 'express';
import { prisma } from '../config';
import { authMiddleware } from '../middleware/auth';
import { success, error } from '../utils/response';

const router = Router();

router.use(authMiddleware);

// 获取现金流量报表
router.get('/cashflow', async (req, res) => {
  try {
    const { startDate, endDate, operatingOnly } = req.query;

    // 默认查询本月数据
    let start: Date;
    let end: Date;

    if (startDate) {
      start = new Date(startDate as string);
      start.setHours(0, 0, 0, 0);
    } else {
      start = new Date();
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
    }

    if (endDate) {
      end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999);
    } else {
      end = new Date();
      end.setHours(23, 59, 59, 999);
    }

    console.log('查询日期范围:', start, '至', end);

    // 销售收入（经营活动现金流入）
    const salesRevenue = await prisma.order.aggregate({
      where: {
        createdAt: { gte: start, lte: end },
        status: 1
      },
      _sum: {
        payAmount: true
      }
    });

    // 退货支出（经营活动现金流出）
    const refundExpense = await prisma.orderReturn.aggregate({
      where: {
        createdAt: { gte: start, lte: end },
        status: { in: [1, 2] }
      },
      _sum: {
        returnAmount: true
      }
    });

    // 手工账收入和支出
    let manualIncome = 0;
    let manualExpense = 0;
    let manualIncomeDetails: any[] = [];
    let manualExpenseDetails: any[] = [];

    if (operatingOnly !== 'true') {
      const manualAccounts = await prisma.manualAccount.findMany({
        where: {
          date: { gte: start, lte: end }
        },
        include: {
          type: true
        }
      });

      manualAccounts.forEach(account => {
        if (account.type.category === 'income') {
          manualIncome += account.amount;
          const existing = manualIncomeDetails.find(d => d.typeName === account.type.name);
          if (existing) {
            existing.amount += account.amount;
          } else {
            manualIncomeDetails.push({
              typeName: account.type.name,
              amount: account.amount
            });
          }
        } else {
          manualExpense += account.amount;
          const existing = manualExpenseDetails.find(d => d.typeName === account.type.name);
          if (existing) {
            existing.amount += account.amount;
          } else {
            manualExpenseDetails.push({
              typeName: account.type.name,
              amount: account.amount
            });
          }
        }
      });

      // 格式化金额
      manualIncome = parseFloat(manualIncome.toFixed(2));
      manualExpense = parseFloat(manualExpense.toFixed(2));
      manualIncomeDetails = manualIncomeDetails.map(d => ({
        ...d,
        amount: parseFloat(d.amount.toFixed(2))
      }));
      manualExpenseDetails = manualExpenseDetails.map(d => ({
        ...d,
        amount: parseFloat(d.amount.toFixed(2))
      }));
    }

    // 按支付方式统计（需要解析 JSON 字符串）
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: 1
      },
      select: {
        payWay: true,
        payAmount: true
      }
    });

    // 解析支付方式并统计
    const paymentStats: any = {};
    const paymentMethodNames: any = {
      'cash': '现金',
      'wechat': '微信支付',
      'alipay': '支付宝',
      'card': '银行卡',
      'mixed': '混合支付'
    };

    orders.forEach(order => {
      try {
        const payWayData = JSON.parse(order.payWay || '[]');
        if (Array.isArray(payWayData)) {
          // 新格式：[{way: 'cash', amount: 100}]
          payWayData.forEach((payment: any) => {
            const method = payment.way || 'cash';
            const methodName = paymentMethodNames[method] || method;
            if (!paymentStats[methodName]) {
              paymentStats[methodName] = 0;
            }
            paymentStats[methodName] += payment.amount || 0;
          });
        } else if (typeof payWayData === 'object') {
          // 旧格式：{cash: 100, wechat: 50}
          Object.keys(payWayData).forEach(method => {
            const methodName = paymentMethodNames[method] || method;
            if (!paymentStats[methodName]) {
              paymentStats[methodName] = 0;
            }
            paymentStats[methodName] += payWayData[method] || 0;
          });
        }
      } catch (e) {
        // 如果解析失败，默认为现金
        if (!paymentStats['现金']) {
          paymentStats['现金'] = 0;
        }
        paymentStats['现金'] += order.payAmount;
      }
    });

    // 转换为数组格式
    const byPaymentMethod = Object.keys(paymentStats).map(method => ({
      method,
      amount: parseFloat(paymentStats[method].toFixed(2))
    }));

    // 计算净现金流
    const cashInflow = parseFloat((salesRevenue._sum.payAmount || 0).toFixed(2));
    const cashOutflow = parseFloat((refundExpense._sum.returnAmount || 0).toFixed(2));
    const operatingNet = parseFloat((cashInflow - cashOutflow).toFixed(2));
    const totalInflow = parseFloat((cashInflow + manualIncome).toFixed(2));
    const totalOutflow = parseFloat((cashOutflow + manualExpense).toFixed(2));
    const netCashflow = parseFloat((totalInflow - totalOutflow).toFixed(2));

    const result: any = {
      period: {
        start: start.toISOString(),
        end: end.toISOString()
      },
      operating: {
        inflow: {
          salesRevenue: cashInflow,
          total: cashInflow
        },
        outflow: {
          refunds: cashOutflow,
          total: cashOutflow
        },
        net: operatingNet
      },
      byPaymentMethod,
      summary: {
        totalInflow: operatingOnly === 'true' ? cashInflow : totalInflow,
        totalOutflow: operatingOnly === 'true' ? cashOutflow : totalOutflow,
        netCashflow: operatingOnly === 'true' ? operatingNet : netCashflow
      }
    };

    // 如果包含手工账，添加额外信息
    if (operatingOnly !== 'true') {
      result.manual = {
        inflow: {
          details: manualIncomeDetails,
          total: manualIncome
        },
        outflow: {
          details: manualExpenseDetails,
          total: manualExpense
        }
      };
    }

    // 禁用缓存
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    success(res, result, '获取成功');
  } catch (err) {
    console.error('获取现金流量报表失败:', err);
    error(res, 500, '获取现金流量报表失败');
  }
});

// 获取损益报表
router.get('/profit-loss', async (req, res) => {
  try {
    const { startDate, endDate, operatingOnly } = req.query;

    // 默认查询本月数据
    let start: Date;
    let end: Date;

    if (startDate) {
      start = new Date(startDate as string);
      start.setHours(0, 0, 0, 0);
    } else {
      start = new Date();
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
    }

    if (endDate) {
      end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999);
    } else {
      end = new Date();
      end.setHours(23, 59, 59, 999);
    }

    console.log('查询日期范围:', start, '至', end);

    // 营业收入
    const revenue = await prisma.order.aggregate({
      where: {
        createdAt: { gte: start, lte: end },
        status: 1
      },
      _sum: {
        totalAmount: true,
        discountAmount: true,
        payAmount: true
      },
      _count: true
    });

    // 获取订单明细以计算成本（只计算已完成订单）
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: { gte: start, lte: end },
          status: 1
        }
      },
      include: {
        sku: {
          include: {
            product: true
          }
        }
      }
    });

    // 计算销售成本
    let totalCost = 0;
    orderItems.forEach(item => {
      const costPrice = item.sku.product.costPrice || 0;
      totalCost += costPrice * item.quantity;
    });

    // 退货信息和退货成本
    const returns = await prisma.orderReturn.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: { in: [1, 2] }
      },
      include: {
        order: {
          include: {
            items: {
              include: {
                sku: {
                  include: {
                    product: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // 计算退货成本
    let returnCost = 0;
    let returnAmount = 0;
    returns.forEach(returnOrder => {
      returnAmount += returnOrder.returnAmount;
      // 计算该退货订单的成本
      returnOrder.order.items.forEach(item => {
        const costPrice = item.sku.product.costPrice || 0;
        returnCost += costPrice * item.quantity;
      });
    });

    // 净销售成本 = 销售成本 - 退货成本
    const netCostOfSales = parseFloat((totalCost - returnCost).toFixed(2));

    // 手工账收入和支出
    let manualIncome = 0;
    let manualExpense = 0;
    let manualIncomeDetails: any[] = [];
    let manualExpenseDetails: any[] = [];

    if (operatingOnly !== 'true') {
      const manualAccounts = await prisma.manualAccount.findMany({
        where: {
          date: { gte: start, lte: end }
        },
        include: {
          type: true
        }
      });

      manualAccounts.forEach(account => {
        if (account.type.category === 'income') {
          manualIncome += account.amount;
          const existing = manualIncomeDetails.find(d => d.typeName === account.type.name);
          if (existing) {
            existing.amount += account.amount;
          } else {
            manualIncomeDetails.push({
              typeName: account.type.name,
              amount: account.amount
            });
          }
        } else {
          manualExpense += account.amount;
          const existing = manualExpenseDetails.find(d => d.typeName === account.type.name);
          if (existing) {
            existing.amount += account.amount;
          } else {
            manualExpenseDetails.push({
              typeName: account.type.name,
              amount: account.amount
            });
          }
        }
      });

      // 格式化金额
      manualIncome = parseFloat(manualIncome.toFixed(2));
      manualExpense = parseFloat(manualExpense.toFixed(2));
      manualIncomeDetails = manualIncomeDetails.map(d => ({
        ...d,
        amount: parseFloat(d.amount.toFixed(2))
      }));
      manualExpenseDetails = manualExpenseDetails.map(d => ({
        ...d,
        amount: parseFloat(d.amount.toFixed(2))
      }));
    }

    // 计算各项指标（保留2位小数）
    const operatingRevenue = parseFloat((revenue._sum.totalAmount || 0).toFixed(2));
    const discounts = parseFloat((revenue._sum.discountAmount || 0).toFixed(2));
    const actualRevenue = parseFloat((revenue._sum.payAmount || 0).toFixed(2));
    const formattedReturnAmount = parseFloat(returnAmount.toFixed(2));
    const operatingNetRevenue = parseFloat((actualRevenue - formattedReturnAmount).toFixed(2));
    const totalRevenue = parseFloat((operatingNetRevenue + manualIncome).toFixed(2));

    // 使用净销售成本（已扣除退货成本）
    const costOfSales = netCostOfSales;
    const operatingGrossProfit = parseFloat((operatingNetRevenue - costOfSales).toFixed(2));
    const totalGrossProfit = parseFloat((totalRevenue - costOfSales).toFixed(2));
    const operatingGrossProfitMargin = operatingNetRevenue > 0 ? parseFloat((operatingGrossProfit / operatingNetRevenue * 100).toFixed(2)) : 0;
    const totalGrossProfitMargin = totalRevenue > 0 ? parseFloat((totalGrossProfit / totalRevenue * 100).toFixed(2)) : 0;

    // 简化费用计算（实际应用中需要更详细的费用记录）
    const operatingExpenses = operatingOnly === 'true' ? 0 : manualExpense;
    const operatingOperatingProfit = parseFloat((operatingGrossProfit - 0).toFixed(2));
    const totalOperatingProfit = parseFloat((totalGrossProfit - operatingExpenses).toFixed(2));
    const operatingNetProfit = operatingOperatingProfit;
    const totalNetProfit = totalOperatingProfit;
    const operatingProfitMargin = operatingNetRevenue > 0 ? parseFloat((operatingNetProfit / operatingNetRevenue * 100).toFixed(2)) : 0;
    const totalProfitMargin = totalRevenue > 0 ? parseFloat((totalNetProfit / totalRevenue * 100).toFixed(2)) : 0;
    const averageOrderValue = revenue._count > 0 ? parseFloat((actualRevenue / revenue._count).toFixed(2)) : 0;

    const result: any = {
      period: {
        start: start.toISOString(),
        end: end.toISOString()
      },
      revenue: {
        operatingRevenue,
        discounts,
        actualRevenue,
        returns: formattedReturnAmount,
        netRevenue: operatingOnly === 'true' ? operatingNetRevenue : totalRevenue
      },
      cost: {
        costOfSales,
        returnCost: parseFloat(returnCost.toFixed(2)),
        grossProfit: operatingOnly === 'true' ? operatingGrossProfit : totalGrossProfit,
        grossProfitMargin: operatingOnly === 'true' ? operatingGrossProfitMargin : totalGrossProfitMargin
      },
      expenses: {
        operatingExpenses,
        total: operatingExpenses
      },
      profit: {
        operatingProfit: operatingOnly === 'true' ? operatingOperatingProfit : totalOperatingProfit,
        netProfit: operatingOnly === 'true' ? operatingNetProfit : totalNetProfit,
        profitMargin: operatingOnly === 'true' ? operatingProfitMargin : totalProfitMargin
      },
      statistics: {
        orderCount: revenue._count,
        returnCount: returns.length,
        averageOrderValue
      }
    };

    // 如果包含手工账，添加额外信息
    if (operatingOnly !== 'true') {
      result.manual = {
        income: {
          details: manualIncomeDetails,
          total: manualIncome
        },
        expense: {
          details: manualExpenseDetails,
          total: manualExpense
        }
      };
      result.operatingOnly = {
        netRevenue: operatingNetRevenue,
        grossProfit: operatingGrossProfit,
        grossProfitMargin: operatingGrossProfitMargin,
        operatingProfit: operatingOperatingProfit,
        netProfit: operatingNetProfit,
        profitMargin: operatingProfitMargin
      };
    }

    // 禁用缓存
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    success(res, result, '获取成功');
  } catch (err) {
    console.error('获取损益报表失败:', err);
    error(res, 500, '获取损益报表失败');
  }
});

export default router;
