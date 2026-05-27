import { Router } from 'express';
import { prisma } from '../config';
import { authMiddleware } from '../middleware/auth';
import { success, error, pageSuccess } from '../utils/response';

const router = Router();

router.use(authMiddleware);

// 获取品牌列表
router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 50, keyword } = req.query;
    
    const where: any = {};
    if (keyword) {
      where.name = { contains: keyword as string };
    }
    
    const [brands, total] = await Promise.all([
      prisma.brand.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(pageSize),
        take: Number(pageSize)
      }),
      prisma.brand.count({ where })
    ]);
    
    pageSuccess(res, brands, total, Number(page), Number(pageSize));
  } catch (err) {
    console.error('获取品牌列表失败:', err);
    error(res, 500, '获取品牌列表失败');
  }
});

// 获取品牌详情
router.get('/:id', async (req, res) => {
  try {
    const brand = await prisma.brand.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    
    if (!brand) {
      return error(res, 404, '品牌不存在');
    }
    
    success(res, brand, '获取成功');
  } catch (err) {
    console.error('获取品牌详情失败:', err);
    error(res, 500, '获取品牌详情失败');
  }
});

// 新增品牌
router.post('/', async (req, res) => {
  try {
    const { name, logo, status } = req.body;
    
    if (!name) {
      return error(res, 400, '品牌名称不能为空');
    }
    
    const brand = await prisma.brand.create({
      data: { name, logo, status: status ?? 1 }
    });
    
    success(res, brand, '创建成功');
  } catch (err) {
    console.error('创建品牌失败:', err);
    error(res, 500, '创建品牌失败');
  }
});

// 更新品牌
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, logo, status } = req.body;
    
    const brand = await prisma.brand.update({
      where: { id: parseInt(id) },
      data: { name, logo, status }
    });
    
    success(res, brand, '更新成功');
  } catch (err) {
    console.error('更新品牌失败:', err);
    error(res, 500, '更新品牌失败');
  }
});

// 删除品牌
router.delete('/:id', async (req, res) => {
  try {
    await prisma.brand.delete({
      where: { id: parseInt(req.params.id) }
    });
    
    success(res, null, '删除成功');
  } catch (err) {
    console.error('删除品牌失败:', err);
    error(res, 500, '删除品牌失败');
  }
});

export default router;