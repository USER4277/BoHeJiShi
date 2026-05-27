import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { success, error, pageSuccess } from '../utils/response';
import { productService } from '../services/product.service';

const router = Router();

router.use(authMiddleware);

// 获取商品列表
router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 20, categoryId, keyword, status } = req.query;

    const result = await productService.getProducts({
      page: Number(page),
      pageSize: Number(pageSize),
      categoryId: categoryId ? parseInt(categoryId as string) : undefined,
      keyword: keyword as string,
      status: status ? parseInt(status as string) : undefined
    });

    pageSuccess(res, result.list, result.total, result.page, result.pageSize);
  } catch (err) {
    console.error('获取商品列表失败:', err);
    error(res, 500, '获取商品列表失败');
  }
});

// 获取商品详情
router.get('/:id', async (req, res) => {
  try {
    const product = await productService.getProductById(parseInt(req.params.id));

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
    const product = await productService.createProduct(req.body, req.user?.id);
    success(res, product, '创建成功');
  } catch (err: any) {
    console.error('创建商品失败:', err);
    error(res, 400, err.message || '创建商品失败');
  }
});

// 更新商品
router.put('/:id', async (req, res) => {
  try {
    const product = await productService.updateProduct(
      parseInt(req.params.id),
      req.body,
      req.user?.id
    );
    success(res, product, '更新成功');
  } catch (err: any) {
    console.error('更新商品失败:', err);
    error(res, 500, err.message || '更新商品失败');
  }
});

// 删除商品
router.delete('/:id', async (req, res) => {
  try {
    await productService.deleteProduct(parseInt(req.params.id), req.user?.id);
    success(res, null, '删除成功');
  } catch (err: any) {
    console.error('删除商品失败:', err);
    error(res, 400, err.message || '删除商品失败');
  }
});

// 更新商品状态（上架/下架）
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const product = await productService.updateStatus(
      parseInt(req.params.id),
      status
    );
    success(res, product, '状态更新成功');
  } catch (err) {
    console.error('更新商品状态失败:', err);
    error(res, 500, '更新商品状态失败');
  }
});

export default router;
