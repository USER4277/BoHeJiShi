import { Router } from 'express';
import { prisma } from '../config';
import { authMiddleware } from '../middleware/auth';
import { success, error } from '../utils/response';

const router = Router();

router.use(authMiddleware);

// 获取配置
router.get('/', async (req, res) => {
  try {
    const { key } = req.query;
    
    if (key) {
      const config = await prisma.config.findUnique({
        where: { configKey: key as string }
      });
      return success(res, config, '获取成功');
    }
    
    const configs = await prisma.config.findMany();
    success(res, configs, '获取成功');
  } catch (err) {
    console.error('获取配置失败:', err);
    error(res, 500, '获取配置失败');
  }
});

// 更新配置
router.put('/', async (req, res) => {
  try {
    const { configKey, configValue, description } = req.body;
    
    const config = await prisma.config.upsert({
      where: { configKey },
      create: { configKey, configValue, description },
      update: { configValue, description }
    });
    
    success(res, config, '更新成功');
  } catch (err) {
    console.error('更新配置失败:', err);
    error(res, 500, '更新配置失败');
  }
});

export default router;