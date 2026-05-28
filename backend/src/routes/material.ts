import { Router } from 'express';
import { prisma } from '../config';
import { authMiddleware } from '../middleware/auth';
import { success, error, pageSuccess } from '../utils/response';

const router = Router();

router.use(authMiddleware);

// 获取材质列表
router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 50, keyword, categoryId } = req.query;

    const where: any = {};
    if (keyword) {
      where.name = { contains: keyword as string };
    }
    if (categoryId) {
      where.categoryId = parseInt(categoryId as string);
    }

    const [materials, total] = await Promise.all([
      prisma.material.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: [
          { sort: 'asc' },
          { createdAt: 'desc' }
        ],
        skip: (Number(page) - 1) * Number(pageSize),
        take: Number(pageSize)
      }),
      prisma.material.count({ where })
    ]);

    pageSuccess(res, materials, total, Number(page), Number(pageSize));
  } catch (err) {
    console.error('获取材质列表失败:', err);
    error(res, 500, '获取材质列表失败');
  }
});

// 获取材质详情
router.get('/:id', async (req, res) => {
  try {
    const material = await prisma.material.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        category: true
      }
    });

    if (!material) {
      return error(res, 404, '材质不存在');
    }

    success(res, material, '获取成功');
  } catch (err) {
    console.error('获取材质详情失败:', err);
    error(res, 500, '获取材质详情失败');
  }
});

// 新增材质
router.post('/', async (req, res) => {
  try {
    const { name, categoryId, description, sort = 0, status } = req.body;

    if (!name || !categoryId) {
      return error(res, 400, '请输入材质名称和所属分类');
    }

    // 检查分类是否存在
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return error(res, 400, '所选分类不存在');
    }

    // 检查同分类下材质名称是否重复
    const existing = await prisma.material.findFirst({
      where: {
        name,
        categoryId
      }
    });

    if (existing) {
      return error(res, 400, '该分类下已存在相同名称的材质');
    }

    const material = await prisma.material.create({
      data: { name, categoryId, description, sort, status: status ?? 1 },
      include: {
        category: true
      }
    });

    success(res, material, '创建成功');
  } catch (err) {
    console.error('创建材质失败:', err);
    error(res, 500, '创建材质失败');
  }
});

// 更新材质
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, categoryId, description, sort, status } = req.body;

    const existing = await prisma.material.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existing) {
      return error(res, 404, '材质不存在');
    }

    // 如果修改了名称或分类，检查是否重复
    if ((name && name !== existing.name) || (categoryId && categoryId !== existing.categoryId)) {
      const duplicate = await prisma.material.findFirst({
        where: {
          name: name || existing.name,
          categoryId: categoryId || existing.categoryId,
          id: { not: parseInt(id) }
        }
      });

      if (duplicate) {
        return error(res, 400, '该分类下已存在相同名称的材质');
      }
    }

    const material = await prisma.material.update({
      where: { id: parseInt(id) },
      data: { name, categoryId, description, sort, status },
      include: {
        category: true
      }
    });

    success(res, material, '更新成功');
  } catch (err) {
    console.error('更新材质失败:', err);
    error(res, 500, '更新材质失败');
  }
});

// 删除材质
router.delete('/:id', async (req, res) => {
  try {
    // 检查是否有商品使用此材质
    const products = await prisma.product.count({
      where: { materialId: parseInt(req.params.id) }
    });

    if (products > 0) {
      return error(res, 400, '该材质下有商品，无法删除');
    }

    await prisma.material.delete({
      where: { id: parseInt(req.params.id) }
    });

    success(res, null, '删除成功');
  } catch (err) {
    console.error('删除材质失败:', err);
    error(res, 500, '删除材质失败');
  }
});

export default router;
