import { Router } from 'express';
import { prisma } from '../config';
import { authMiddleware } from '../middleware/auth';
import { success, error, pageSuccess } from '../utils/response';
import { generateMemberCode } from '../utils/code';

const router = Router();

router.use(authMiddleware);

// 获取会员列表
router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 20, keyword, level } = req.query;
    
    const where: any = {};
    if (level) where.level = level as string;
    if (keyword) {
      where.OR = [
        { name: { contains: keyword as string } },
        { phone: { contains: keyword as string } },
        { code: { contains: keyword as string } }
      ];
    }
    
    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(pageSize),
        take: Number(pageSize)
      }),
      prisma.member.count({ where })
    ]);
    
    pageSuccess(res, members, total, Number(page), Number(pageSize));
  } catch (err) {
    console.error('获取会员列表失败:', err);
    error(res, 500, '获取会员列表失败');
  }
});

// 获取会员详情
router.get('/:id', async (req, res) => {
  try {
    const member = await prisma.member.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { orders: { take: 10, orderBy: { createdAt: 'desc' } } }
    });
    
    if (!member) {
      return error(res, 404, '会员不存在');
    }
    
    success(res, member, '获取成功');
  } catch (err) {
    console.error('获取会员详情失败:', err);
    error(res, 500, '获取会员详情失败');
  }
});

// 验证手机号格式
function validatePhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    return false;
  }
  // 检查是否全是相同数字
  if (/^(\d)\1{10}$/.test(phone)) {
    return false;
  }
  return true;
}

// 新增会员
router.post('/', async (req, res) => {
  try {
    const { name, phone, gender, birthday } = req.body;

    if (!name || !phone) {
      return error(res, 400, '请填写必填项');
    }

    // 验证手机号格式
    if (!validatePhone(phone)) {
      return error(res, 400, '手机号格式不正确，必须是1开头的11位数字');
    }

    // 检查手机号是否已存在
    const existMember = await prisma.member.findUnique({ where: { phone } });
    if (existMember) {
      return error(res, 400, '手机号已被注册');
    }

    const code = generateMemberCode();

    // 处理数据类型
    const data: any = {
      code,
      name,
      phone
    };

    // 处理可选字段
    if (gender !== undefined && gender !== null && gender !== '') {
      data.gender = parseInt(gender);
    }

    if (birthday && birthday !== '') {
      // 将日期字符串转换为 DateTime 对象
      data.birthday = new Date(birthday);
    }

    const member = await prisma.member.create({
      data
    });

    success(res, member, '创建成功');
  } catch (err) {
    console.error('创建会员失败:', err);
    error(res, 500, '创建会员失败');
  }
});

// 更新会员
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, gender, birthday, level, status } = req.body;

    // 如果更新手机号，验证格式
    if (phone && !validatePhone(phone)) {
      return error(res, 400, '手机号格式不正确，必须是1开头的11位数字');
    }

    // 准备更新数据
    const data: any = {};

    if (name !== undefined) data.name = name;
    if (phone !== undefined) data.phone = phone;
    if (level !== undefined) data.level = level;
    if (status !== undefined) data.status = parseInt(status);

    // 处理 gender
    if (gender !== undefined && gender !== null && gender !== '') {
      data.gender = parseInt(gender);
    }

    // 处理 birthday
    if (birthday !== undefined) {
      if (birthday === '' || birthday === null) {
        data.birthday = null;
      } else {
        data.birthday = new Date(birthday);
      }
    }

    const member = await prisma.member.update({
      where: { id: parseInt(req.params.id) },
      data
    });

    success(res, member, '更新成功');
  } catch (err) {
    console.error('更新会员失败:', err);
    error(res, 500, '更新会员失败');
  }
});

// 储值充值
router.post('/:id/recharge', async (req, res) => {
  try {
    const { amount, payWay } = req.body;
    
    if (!amount || amount <= 0) {
      return error(res, 400, '请输入正确的充值金额');
    }
    
    const member = await prisma.member.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    
    if (!member) {
      return error(res, 404, '会员不存在');
    }
    
    const newBalance = member.balance + amount;
    
    await prisma.member.update({
      where: { id: member.id },
      data: { balance: newBalance }
    });
    
    // 记录储值变动
    await prisma.balanceLog.create({
      data: {
        memberId: member.id,
        changeType: 'recharge',
        amount,
        balance: newBalance,
        payWay,
        description: `储值充值 ¥${amount}`
      }
    });
    
    success(res, { balance: newBalance }, '充值成功');
  } catch (err) {
    console.error('充值失败:', err);
    error(res, 500, '充值失败');
  }
});

// 获取积分记录
router.get('/:id/points', async (req, res) => {
  try {
    const logs = await prisma.pointsLog.findMany({
      where: { memberId: parseInt(req.params.id) },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    
    success(res, logs, '获取成功');
  } catch (err) {
    console.error('获取积分记录失败:', err);
    error(res, 500, '获取积分记录失败');
  }
});

// 积分操作（增减）
router.post('/:id/points', async (req, res) => {
  try {
    const { points, changeType, description } = req.body;
    
    const member = await prisma.member.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    
    if (!member) {
      return error(res, 404, '会员不存在');
    }
    
    let newPoints = member.points + points;
    if (newPoints < 0) {
      return error(res, 400, '积分不足');
    }
    
    await prisma.member.update({
      where: { id: member.id },
      data: { points: newPoints }
    });
    
    await prisma.pointsLog.create({
      data: {
        memberId: member.id,
        changeType,
        points,
        balance: newPoints,
        description
      }
    });
    
    success(res, { points: newPoints }, '操作成功');
  } catch (err) {
    console.error('积分操作失败:', err);
    error(res, 500, '积分操作失败');
  }
});

export default router;