import { prisma } from '../config';
import { generateOrderNo, generateReturnNo } from '../utils/code';

/**
 * 销售服务层
 * 处理订单、退货等销售相关业务逻辑
 */
export class SaleService {

  /**
   * 创建销售订单
   */
  async createOrder(data: {
    items: Array<{
      skuId: number;
      productName: string;
      quantity: number;
      unitPrice: number;
    }>;
    memberId?: number;
    payWay: any;
    remark?: string;
    discountAmount?: number;
    cashierId: number;
  }) {
    const { items, memberId, payWay, remark, discountAmount = 0, cashierId } = data;

    // 验证商品和库存
    let totalQuantity = 0;
    let totalAmount = 0;

    for (const item of items) {
      const sku = await prisma.sku.findUnique({ where: { id: item.skuId } });
      if (!sku) {
        throw new Error(`SKU ${item.skuId} 不存在`);
      }

      const inventory = await prisma.inventory.findFirst({ where: { skuId: item.skuId } });
      if (!inventory || inventory.quantity < item.quantity) {
        throw new Error(`${sku.skuCode} 库存不足`);
      }

      totalQuantity += item.quantity;
      totalAmount += sku.price * item.quantity;
    }

    const payAmount = totalAmount - discountAmount;
    const pointsEarned = Math.floor(payAmount); // 1元=1积分

    // 使用事务处理
    const result = await prisma.$transaction(async (tx) => {
      // 创建订单
      const orderNo = generateOrderNo();
      const order = await tx.order.create({
        data: {
          orderNo,
          memberId,
          cashierId,
          totalQuantity,
          totalAmount,
          discountAmount,
          payAmount,
          payWay: JSON.stringify(payWay),
          pointsEarned,
          remark,
          items: {
            create: items.map((item) => ({
              skuId: item.skuId,
              productName: item.productName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              amount: item.unitPrice * item.quantity
            }))
          }
        },
        include: { items: true, member: true }
      });

      // 扣减库存
      for (const item of items) {
        await this.decreaseInventory(tx, item.skuId, item.quantity);
      }

      // 更新会员积分和消费
      if (memberId) {
        const member = await tx.member.findUnique({ where: { id: memberId } });
        if (member) {
          await tx.member.update({
            where: { id: memberId },
            data: {
              points: { increment: pointsEarned },
              totalConsume: { increment: payAmount }
            }
          });

          // 记录积分变动
          await tx.pointsLog.create({
            data: {
              memberId,
              changeType: 'earn',
              points: pointsEarned,
              balance: member.points + pointsEarned,
              source: 'order',
              orderId: order.id,
              description: `消费获得积分`
            }
          });
        }
      }

      return order;
    });

    return result;
  }

  /**
   * 获取订单列表
   */
  async getOrders(params: {
    page: number;
    pageSize: number;
    startDate?: string;
    endDate?: string;
    keyword?: string;
    status?: number;
  }) {
    const { page, pageSize, startDate, endDate, keyword, status } = params;

    const where: any = {};

    if (status !== undefined) {
      where.status = status;
    }

    if (keyword) {
      where.orderNo = { contains: keyword };
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate + ' 23:59:59');
      }
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          member: true,
          items: { include: { sku: { include: { product: true } } } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.order.count({ where })
    ]);

    return {
      list: orders,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  /**
   * 获取订单详情
   */
  async getOrderById(id: number) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        member: true,
        items: { include: { sku: { include: { product: true } } } }
      }
    });

    return order;
  }

  /**
   * 创建退货单
   */
  async createReturn(data: {
    orderId: number;
    items: Array<{ skuId: number; quantity: number }>;
    returnReason: string;
    operatorId: number;
  }) {
    const { orderId, items, returnReason, operatorId } = data;

    // 查询原订单
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, member: true }
    });

    if (!order) {
      throw new Error('订单不存在');
    }

    // 计算退款金额
    let returnAmount = 0;
    for (const item of items) {
      const orderItem = order.items.find((i) => i.skuId === item.skuId);
      if (!orderItem) {
        throw new Error(`订单中不存在SKU ${item.skuId}`);
      }
      if (item.quantity > orderItem.quantity) {
        throw new Error(`退货数量不能超过购买数量`);
      }
      returnAmount += orderItem.unitPrice * item.quantity;
    }

    // 使用事务处理
    const result = await prisma.$transaction(async (tx) => {
      // 创建退货单
      const returnNo = generateReturnNo();
      const returnOrder = await tx.orderReturn.create({
        data: {
          returnNo,
          orderId,
          returnReason,
          returnAmount,
          status: 1,
          operatorId
        }
      });

      // 恢复库存
      for (const item of items) {
        await this.increaseInventory(tx, item.skuId, item.quantity);
      }

      // 退还会员积分
      if (order.memberId) {
        const points = Math.floor(returnAmount);
        await tx.member.update({
          where: { id: order.memberId },
          data: {
            points: { decrement: points },
            totalConsume: { decrement: returnAmount }
          }
        });

        // 记录积分变动
        await tx.pointsLog.create({
          data: {
            memberId: order.memberId,
            changeType: 'deduct',
            points: -points,
            balance: (order.member?.points || 0) - points,
            source: 'return',
            orderId: order.id,
            description: `退货扣除积分`
          }
        });
      }

      return returnOrder;
    });

    return result;
  }

  /**
   * 扣减库存
   */
  private async decreaseInventory(tx: any, skuId: number, quantity: number) {
    const inventory = await tx.inventory.findFirst({ where: { skuId } });

    if (!inventory) {
      throw new Error(`SKU ${skuId} 库存记录不存在`);
    }

    if (inventory.quantity < quantity) {
      throw new Error(`SKU ${skuId} 库存不足`);
    }

    // 更新库存
    await tx.inventory.update({
      where: { id: inventory.id },
      data: {
        quantity: { decrement: quantity },
        lastOutTime: new Date()
      }
    });

    // 记录库存变动
    await tx.inventoryLog.create({
      data: {
        skuId,
        changeType: 'out',
        changeQuantity: -quantity,
        beforeQuantity: inventory.quantity,
        afterQuantity: inventory.quantity - quantity,
        billType: 'sale',
        remark: '销售出库'
      }
    });
  }

  /**
   * 增加库存
   */
  private async increaseInventory(tx: any, skuId: number, quantity: number) {
    const inventory = await tx.inventory.findFirst({ where: { skuId } });

    if (!inventory) {
      throw new Error(`SKU ${skuId} 库存记录不存在`);
    }

    // 更新库存
    await tx.inventory.update({
      where: { id: inventory.id },
      data: {
        quantity: { increment: quantity },
        lastInTime: new Date()
      }
    });

    // 记录库存变动
    await tx.inventoryLog.create({
      data: {
        skuId,
        changeType: 'in',
        changeQuantity: quantity,
        beforeQuantity: inventory.quantity,
        afterQuantity: inventory.quantity + quantity,
        billType: 'return',
        remark: '退货入库'
      }
    });
  }
}

// 导出单例
export const saleService = new SaleService();
