import { Router } from 'express';
import { prisma } from '../config';
import { authMiddleware } from '../middleware/auth';
import { success, error, pageSuccess } from '../utils/response';
import bcrypt from 'bcrypt';

const router = Router();
router.use(authMiddleware);

// ========== 用户管理 ==========

// 获取用户列表
router.get('/users', async (req, res) => {
  try {
    const { page = 1, pageSize = 20, keyword, status } = req.query;
    
    const where: any = {};
    if (status !== undefined) where.status = parseInt(status as string);
    if (keyword) {
      where.OR = [
        { username: { contains: keyword as string } },
        { realName: { contains: keyword as string } }
      ];
    }
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(pageSize),
        take: Number(pageSize)
      }),
      prisma.user.count({ where })
    ]);
    
    // 移除密码
    const safeUsers = users.map(u => ({ ...u, password: undefined }));
    pageSuccess(res, safeUsers, total, Number(page), Number(pageSize));
  } catch (err) {
    console.error('获取用户列表失败:', err);
    error(res, 500, '获取用户列表失败');
  }
});

// 获取用户详情
router.get('/users/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    
    if (!user) {
      return error(res, 404, '用户不存在');
    }
    
    success(res, { ...user, password: undefined }, '获取成功');
  } catch (err) {
    console.error('获取用户详情失败:', err);
    error(res, 500, '获取用户详情失败');
  }
});

// 创建用户
router.post('/users', async (req, res) => {
  try {
    const { username, password, realName, role, status } = req.body;
    
    if (!username || !password) {
      return error(res, 400, '用户名和密码不能为空');
    }
    
    // 检查用户名是否存在
    const exist = await prisma.user.findUnique({ where: { username } });
    if (exist) {
      return error(res, 400, '用户名已存在');
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        realName,
        role: role || 'admin',
        status: status ?? 1
      }
    });
    
    success(res, { ...user, password: undefined }, '创建成功');
  } catch (err) {
    console.error('创建用户失败:', err);
    error(res, 500, '创建用户失败');
  }
});

// 更新用户
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { realName, role, status, password } = req.body;
    
    const updateData: any = { realName, role, status };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData
    });
    
    success(res, { ...user, password: undefined }, '更新成功');
  } catch (err) {
    console.error('更新用户失败:', err);
    error(res, 500, '更新用户失败');
  }
});

// 删除用户
router.delete('/users/:id', async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: parseInt(req.params.id) }
    });
    
    success(res, null, '删除成功');
  } catch (err) {
    console.error('删除用户失败:', err);
    error(res, 500, '删除用户失败');
  }
});

// 重置密码
router.put('/users/:id/reset-password', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return error(res, 400, '新密码不能为空');
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { password: hashedPassword }
    });
    
    success(res, null, '密码重置成功');
  } catch (err) {
    console.error('重置密码失败:', err);
    error(res, 500, '重置密码失败');
  }
});

// ========== 操作日志 ==========

// 获取操作日志
router.get('/logs', async (req, res) => {
  try {
    const { page = 1, pageSize = 50, module, userId } = req.query;
    
    const where: any = {};
    if (module) where.module = module as string;
    if (userId) where.userId = parseInt(userId as string);
    
    const [logs, total] = await Promise.all([
      prisma.operationLog.findMany({
        where,
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(pageSize),
        take: Number(pageSize)
      }),
      prisma.operationLog.count({ where })
    ]);
    
    pageSuccess(res, logs, total, Number(page), Number(pageSize));
  } catch (err) {
    console.error('获取操作日志失败:', err);
    error(res, 500, '获取操作日志失败');
  }
});

// 记录操作日志
async function logOperation(userId: number, action: string, module: string, detail: string, ip?: string) {
  try {
    await prisma.operationLog.create({
      data: {
        userId,
        action,
        module,
        detail,
        ip
      }
    });
  } catch (err) {
    console.error('记录操作日志失败:', err);
  }
}

// ========== 系统配置 ==========

// 获取系统配置
router.get('/config', async (req, res) => {
  try {
    const configs = await prisma.config.findMany({
      orderBy: { id: 'asc' }
    });
    
    // 转换为键值对
    const configMap: any = {};
    configs.forEach(c => { configMap[c.configKey] = c.configValue; });
    
    success(res, configMap, '获取成功');
  } catch (err) {
    console.error('获取系统配置失败:', err);
    error(res, 500, '获取系统配置失败');
  }
});

// 更新系统配置
router.put('/config', async (req, res) => {
  try {
    const configs = req.body;
    
    for (const [key, value] of Object.entries(configs)) {
      await prisma.config.upsert({
        where: { configKey: key },
        create: { configKey: key, configValue: value as string },
        update: { configValue: value as string }
      });
    }
    
    success(res, null, '更新成功');
  } catch (err) {
    console.error('更新系统配置失败:', err);
    error(res, 500, '更新系统配置失败');
  }
});

export default router;