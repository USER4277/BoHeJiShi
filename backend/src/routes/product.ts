import { Router } from 'express';
import { prisma } from '../config';
import { authMiddleware } from '../middleware/auth';
import { success, error, pageSuccess } from '../utils/response';

const router = Router();

router.use(authMiddleware);

// 获取商品列表
router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 20, categoryId, keyword, status } = req.query;
    
    const where: any = {};
    if (categoryId) where.categoryId = parseInt(categoryId as string);
    if (status) where.status = parseInt(status as string);
    if (keyword) {
      where.OR = [
        { name: { contains: keyword as string } },
        { code: { contains: keyword as string } }
      ];
    }
    
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(pageSize),
        take: Number(pageSize)
      }),
      prisma.product.count({ where })
    ]);
    
    pageSuccess(res, products, total, Number(page), Number(pageSize));
  } catch (err) {
    console.error('获取商品列表失败:', err);
    error(res, 500, '获取商品列表失败');
  }
});

// 获取商品详情
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { category: true, skus: true }
    });
    
    if (!product) {
      return error(res, 404, '商品不存在');
    }
    
    success(res, product, '获取成功');
  } catch (err) {
    console.error('获取商品详情失败:', err);
    error(res, 500, '获取商品详情失败');
  }
});

// 新增商品
router.post('/', async (req, res) => {
  try {
    const { name, categoryId, brandId, material, price, memberPrice, costPrice, mainImage, detailImages } = req.body;
    
    if (!name || !categoryId || !price) {
      return error(res, 400, '请填写必填项');
    }
    
    const code = 'P' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6).toUpperCase();
    
    const product = await prisma.product.create({
      data: {
        code,
        name,
        categoryId,
        brandId: brandId || null,
        material,
        price,
        memberPrice: memberPrice || null,
        costPrice: costPrice || null,
        mainImage: mainImage || '',
        detailImages: detailImages || ''
      }
    });
    
    success(res, product, '创建成功');
  } catch (err: any) {
    console.error('创建商品失败:', err);
    error(res, 500, err.message || '创建商品失败');
  }
});

// 更新商品
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, categoryId, brandId, material, price, memberPrice, costPrice, mainImage, detailImages, status } = req.body;
    
    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        categoryId,
        brandId: brandId || null,
        material,
        price,
        memberPrice: memberPrice || null,
        costPrice: costPrice || null,
        mainImage: mainImage || '',
        detailImages: detailImages || '',
        status: status ?? 1
      }
    });
    
    success(res, product, '更新成功');
  } catch (err) {
    console.error('更新商品失败:', err);
    error(res, 500, '更新商品失败');
  }
});

// 删除商品
router.delete('/:id', async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: parseInt(req.params.id) }
    });
    
    success(res, null, '删除成功');
  } catch (err) {
    console.error('删除商品失败:', err);
    error(res, 500, '删除商品失败');
  }
});

// 更新商品状态（上架/下架）
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: { status }
    });
    
    success(res, product, '状态更新成功');
  } catch (err) {
    console.error('更新商品状态失败:', err);
    error(res, 500, '更新商品状态失败');
  }
});

export default router;