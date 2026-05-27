import { Router } from 'express';
import { prisma } from '../config';
import bcrypt from 'bcrypt';
import { authMiddleware } from '../middleware/auth';
import { success, error } from '../utils/response';

const router = Router();

// 登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return error(res, 400, '请输入用户名和密码');
    }
    
    const user = await prisma.user.findUnique({
      where: { username }
    });
    
    if (!user) {
      return error(res, 401, '用户名或密码错误');
    }
    
    if (user.status !== 1) {
      return error(res, 401, '账号已被禁用');
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      return error(res, 401, '用户名或密码错误');
    }
    
    success(res, {
      id: user.id,
      username: user.username,
      realName: user.realName,
      role: user.role
    }, '登录成功');
  } catch (err) {
    console.error('登录失败:', err);
    error(res, 500, '登录失败');
  }
});

// 获取当前用户
router.get('/me', authMiddleware, (req, res) => {
  success(res, req.user, '获取成功');
});

// 修改密码
router.put('/password', authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return error(res, 400, '请输入旧密码和新密码');
    }
    
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });
    
    if (!user) {
      return error(res, 404, '用户不存在');
    }
    
    const isValid = await bcrypt.compare(oldPassword, user.password);
    
    if (!isValid) {
      return error(res, 400, '旧密码错误');
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });
    
    success(res, null, '密码修改成功');
  } catch (err) {
    console.error('修改密码失败:', err);
    error(res, 500, '修改密码失败');
  }
});

export default router;