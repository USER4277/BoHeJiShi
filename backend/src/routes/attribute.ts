import { Router } from 'express';
import { prisma } from '../config';
import { authMiddleware } from '../middleware/auth';
import { success, error, pageSuccess } from '../utils/response';

const router = Router();

router.use(authMiddleware);

// 获取属性模板列表
router.get('/', async (req, res) => {
  try {
    const { categoryId } = req.query;
    
    const where: any = {};
    if (categoryId) where.categoryId = parseInt(categoryId as string);
    
    const templates = await prisma.attributeTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' as const }
    });
    
    success(res, templates, '获取成功');
  } catch (err) {
    console.error('获取属性模板失败:', err);
    error(res, 500, '获取属性模板失败');
  }
});

// 获取属性模板详情
router.get('/:id', async (req, res) => {
  try {
    const template = await prisma.attributeTemplate.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    
    if (!template) {
      return error(res, 404, '属性模板不存在');
    }
    
    success(res, template, '获取成功');
  } catch (err) {
    console.error('获取属性模板详情失败:', err);
    error(res, 500, '获取属性模板详情失败');
  }
});

// 新增属性模板
router.post('/', async (req, res) => {
  try {
    const { name, categoryId, values } = req.body;
    
    if (!name) {
      return error(res, 400, '属性名称不能为空');
    }
    
    const template = await prisma.attributeTemplate.create({
      data: {
        name,
        categoryId: categoryId || null,
        values: Array.isArray(values) ? values.join(',') : values || ''
      }
    });
    
    success(res, template, '创建成功');
  } catch (err) {
    console.error('创建属性模板失败:', err);
    error(res, 500, '创建属性模板失败');
  }
});

// 更新属性模板
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, values } = req.body;
    
    const template = await prisma.attributeTemplate.update({
      where: { id: parseInt(id) },
      data: {
        name,
        values: Array.isArray(values) ? values.join(',') : values || ''
      }
    });
    
    success(res, template, '更新成功');
  } catch (err) {
    console.error('更新属性模板失败:', err);
    error(res, 500, '更新属性模板失败');
  }
});

// 删除属性模板
router.delete('/:id', async (req, res) => {
  try {
    await prisma.attributeTemplate.delete({
      where: { id: parseInt(req.params.id) }
    });
    
    success(res, null, '删除成功');
  } catch (err) {
    console.error('删除属性模板失败:', err);
    error(res, 500, '删除属性模板失败');
  }
});

export default router;