import { prisma } from '../config';

/**
 * 操作日志类型
 */
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  QUERY = 'query',
  LOGIN = 'login',
  LOGOUT = 'logout'
}

/**
 * 操作模块
 */
export enum OperationModule {
  PRODUCT = 'product',
  INVENTORY = 'inventory',
  SALE = 'sale',
  MEMBER = 'member',
  SYSTEM = 'system'
}

/**
 * 记录操作日志
 */
export async function logOperation(params: {
  userId: number;
  module: OperationModule;
  action: OperationType;
  description: string;
  targetId?: number;
  targetType?: string;
  ip?: string;
  userAgent?: string;
  requestData?: any;
  responseData?: any;
  status?: number;
}) {
  try {
    await prisma.operationLog.create({
      data: {
        userId: params.userId,
        module: params.module,
        action: params.action,
        detail: params.description, // 使用detail字段而非description
        ip: params.ip || null
      }
    });
  } catch (error) {
    // 日志记录失败不应影响主流程
    console.error('记录操作日志失败:', error);
  }
}

/**
 * 获取操作日志列表
 */
export async function getOperationLogs(params: {
  page: number;
  pageSize: number;
  userId?: number;
  module?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}) {
  const { page, pageSize, userId, module, action, startDate, endDate } = params;

  const where: any = {};

  if (userId) {
    where.userId = userId;
  }

  if (module) {
    where.module = module;
  }

  if (action) {
    where.action = action;
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

  const [logs, total] = await Promise.all([
    prisma.operationLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            realName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.operationLog.count({ where })
  ]);

  return {
    list: logs,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  };
}
