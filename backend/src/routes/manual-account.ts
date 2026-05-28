import { Router } from 'express';
import { prisma } from '../config';
import { authMiddleware } from '../middleware/auth';
import { success, error, pageSuccess } from '../utils/response';

const router = Router();

router.use(authMiddleware);

// 获取手工账类型列表
router.get('/types', async (req, res) => {
  try {
    const { category } = req.query;

    const where: any = { status: 1 };
    if (category) {
      where.category = category;
    }

    const types = await prisma.manualAccountType.findMany({
      where,
      orderBy: [{ category: 'asc' }, { sort: 'asc' }]
    });

    success(res, types, '获取成功');
  } catch (err) {
    console.error('获取手工账类型失败:', err);
    error(res, 500, '获取手工账类型失败');
  }
});

// 创建手工账类型
router.post('/types', async (req, res) => {
  try {
    const { name, category, description, sort } = req.body;

    if (!name || !category) {
      return error(res, 400, '类型名称和分类不能为空');
    }

    if (!['income', 'expense'].includes(category)) {
      return error(res, 400, '分类只能是 income 或 expense');
    }

    const type = await prisma.manualAccountType.create({
      data: {
        name,
        category,
        description,
        sort: sort || 0,
        status: 1
      }
    });

    success(res, type, '创建成功');
  } catch (err: any) {
    console.error('创建手工账类型失败:', err);
    if (err.code === 'P2002') {
      return error(res, 400, '该类型已存在');
    }
    error(res, 500, '创建手工账类型失败');
  }
});

// 更新手工账类型
router.put('/types/:id', async (req, res) => {
  try {
    const { name, category, description, sort, status } = req.body;

    const type = await prisma.manualAccountType.update({
      where: { id: parseInt(req.params.id) },
      data: {
        name,
        category,
        description,
        sort,
        status
      }
    });

    success(res, type, '更新成功');
  } catch (err) {
    console.error('更新手工账类型失败:', err);
    error(res, 500, '更新手工账类型失败');
  }
});

// 删除手工账类型
router.delete('/types/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // 检查是否有关联的记录
    const count = await prisma.manualAccount.count({
      where: { typeId: id }
    });

    if (count > 0) {
      return error(res, 400, '该类型下有记录，无法删除');
    }

    await prisma.manualAccountType.delete({
      where: { id }
    });

    success(res, null, '删除成功');
  } catch (err) {
    console.error('删除手工账类型失败:', err);
    error(res, 500, '删除手工账类型失败');
  }
});

// 获取手工账记录列表
router.get('/records', async (req, res) => {
  try {
    const { page = 1, pageSize = 20, typeId, category, startDate, endDate } = req.query;

    const where: any = {};

    if (typeId) {
      where.typeId = parseInt(typeId as string);
    }

    if (category) {
      where.type = { category };
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        const start = new Date(startDate as string);
        start.setHours(0, 0, 0, 0);
        where.date.gte = start;
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    const [records, total] = await Promise.all([
      prisma.manualAccount.findMany({
        where,
        include: {
          type: true,
          operator: {
            select: { id: true, username: true, realName: true }
          }
        },
        orderBy: { date: 'desc' },
        skip: (Number(page) - 1) * Number(pageSize),
        take: Number(pageSize)
      }),
      prisma.manualAccount.count({ where })
    ]);

    pageSuccess(res, records, total, Number(page), Number(pageSize));
  } catch (err) {
    console.error('获取手工账记录失败:', err);
    error(res, 500, '获取手工账记录失败');
  }
});

// 创建手工账记录
router.post('/records', async (req, res) => {
  try {
    const { typeId, amount, payWay, date, description } = req.body;

    if (!typeId || !amount || !date) {
      return error(res, 400, '类型、金额和日期不能为空');
    }

    if (amount <= 0) {
      return error(res, 400, '金额必须大于0');
    }

    const record = await prisma.manualAccount.create({
      data: {
        typeId,
        amount: parseFloat(amount),
        payWay,
        date: new Date(date),
        description,
        operatorId: req.user!.id
      },
      include: {
        type: true,
        operator: {
          select: { id: true, username: true, realName: true }
        }
      }
    });

    success(res, record, '创建成功');
  } catch (err) {
    console.error('创建手工账记录失败:', err);
    error(res, 500, '创建手工账记录失败');
  }
});

// 更新手工账记录
router.put('/records/:id', async (req, res) => {
  try {
    const { typeId, amount, payWay, date, description } = req.body;

    const record = await prisma.manualAccount.update({
      where: { id: parseInt(req.params.id) },
      data: {
        typeId,
        amount: amount ? parseFloat(amount) : undefined,
        payWay,
        date: date ? new Date(date) : undefined,
        description
      },
      include: {
        type: true,
        operator: {
          select: { id: true, username: true, realName: true }
        }
      }
    });

    success(res, record, '更新成功');
  } catch (err) {
    console.error('更新手工账记录失败:', err);
    error(res, 500, '更新手工账记录失败');
  }
});

// 删除手工账记录
router.delete('/records/:id', async (req, res) => {
  try {
    await prisma.manualAccount.delete({
      where: { id: parseInt(req.params.id) }
    });

    success(res, null, '删除成功');
  } catch (err) {
    console.error('删除手工账记录失败:', err);
    error(res, 500, '删除手工账记录失败');
  }
});

// 获取手工账统计
router.get('/statistics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {};

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        const start = new Date(startDate as string);
        start.setHours(0, 0, 0, 0);
        where.date.gte = start;
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    // 获取所有记录
    const records = await prisma.manualAccount.findMany({
      where,
      include: { type: true }
    });

    // 统计收入
    const incomeRecords = records.filter(r => r.type.category === 'income');
    const totalIncome = parseFloat(incomeRecords.reduce((sum, r) => sum + r.amount, 0).toFixed(2));

    // 统计支出
    const expenseRecords = records.filter(r => r.type.category === 'expense');
    const totalExpense = parseFloat(expenseRecords.reduce((sum, r) => sum + r.amount, 0).toFixed(2));

    // 按类型统计
    const incomeByType: any = {};
    incomeRecords.forEach(r => {
      if (!incomeByType[r.type.name]) {
        incomeByType[r.type.name] = 0;
      }
      incomeByType[r.type.name] += r.amount;
    });

    const expenseByType: any = {};
    expenseRecords.forEach(r => {
      if (!expenseByType[r.type.name]) {
        expenseByType[r.type.name] = 0;
      }
      expenseByType[r.type.name] += r.amount;
    });

    // 转换为数组并格式化
    const incomeList = Object.keys(incomeByType).map(name => ({
      name,
      amount: parseFloat(incomeByType[name].toFixed(2))
    }));

    const expenseList = Object.keys(expenseByType).map(name => ({
      name,
      amount: parseFloat(expenseByType[name].toFixed(2))
    }));

    success(res, {
      totalIncome,
      totalExpense,
      netAmount: parseFloat((totalIncome - totalExpense).toFixed(2)),
      incomeByType: incomeList,
      expenseByType: expenseList
    }, '获取成功');
  } catch (err) {
    console.error('获取手工账统计失败:', err);
    error(res, 500, '获取手工账统计失败');
  }
});

export default router;
