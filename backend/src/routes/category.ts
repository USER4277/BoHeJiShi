import { Router } from 'express';
import { prisma } from '../config';
import { authMiddleware } from '../middleware/auth';
import { success, error, pageSuccess } from '../utils/response';

const router = Router();

// 所有分类接口都需要认证
router.use(authMiddleware);

// 获取分类列表（树形结构）
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sort: 'asc' }
    });
    
    // 构建树形结构
    const tree = buildCategoryTree(categories, 0);
    
    success(res, tree, '获取成功');
  } catch (err) {
    console.error('获取分类失败:', err);
    error(res, 500, '获取分类失败');
  }
});

// 新增分类
router.post('/', async (req, res) => {
  try {
    const { name, parentId = 0, sort = 0 } = req.body;
    
    if (!name) {
      return error(res, 400, '请输入分类名称');
    }
    
    const category = await prisma.category.create({
      data: { name, parentId, sort }
    });
    
    success(res, category, '创建成功');
  } catch (err) {
    console.error('创建分类失败:', err);
    error(res, 500, '创建分类失败');
  }
});

// 更新分类
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sort } = req.body;
    
    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { name, sort }
    });
    
    success(res, category, '更新成功');
  } catch (err) {
    console.error('更新分类失败:', err);
    error(res, 500, '更新分类失败');
  }
});

// 删除分类
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查是否有子分类
    const children = await prisma.category.count({
      where: { parentId: parseInt(id) }
    });
    
    if (children > 0) {
      return error(res, 400, '请先删除子分类');
    }
    
    // 检查是否有商品
    const products = await prisma.product.count({
      where: { categoryId: parseInt(id) }
    });
    
    if (products > 0) {
      return error(res, 400, '该分类下有商品，无法删除');
    }
    
    await prisma.category.delete({
      where: { id: parseInt(id) }
    });
    
    success(res, null, '删除成功');
  } catch (err) {
    console.error('删除分类失败:', err);
    error(res, 500, '删除分类失败');
  }
});

// 构建分类树
function buildCategoryTree(categories: any[], parentId: number): any[] {
  return categories
    .filter(c => c.parentId === parentId)
    .map(c => ({
      ...c,
      children: buildCategoryTree(categories, c.id)
    }));
}

export default router;