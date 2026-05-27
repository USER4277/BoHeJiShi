import { Router } from 'express';
import { prisma } from '../config';
import { authMiddleware } from '../middleware/auth';
import { success, error, pageSuccess } from '../utils/response';
import { generateCouponCode } from '../utils/code';

const router = Router();

router.use(authMiddleware);

// 获取促销列表
router.get('/', async (req, res) => {
  try {
    const promotions = await prisma.promotion.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    success(res, promotions, '获取成功');
  } catch (err) {
    console.error('获取促销列表失败:', err);
    error(res, 500, '获取促销列表失败');
  }
});

// 新增促销
router.post('/', async (req, res) => {
  try {
    const { name, type, rules, startTime, endTime } = req.body;
    
    if (!name || !type) {
      return error(res, 400, '请填写必填项');
    }
    
    const promotion = await prisma.promotion.create({
      data: { name, type, rules, startTime, endTime }
    });
    
    success(res, promotion, '创建成功');
  } catch (err) {
    console.error('创建促销失败:', err);
    error(res, 500, '创建促销失败');
  }
});

// 更新促销
router.put('/:id', async (req, res) => {
  try {
    const { name, type, rules, startTime, endTime, status } = req.body;
    
    const promotion = await prisma.promotion.update({
      where: { id: parseInt(req.params.id) },
      data: { name, type, rules, startTime, endTime, status }
    });
    
    success(res, promotion, '更新成功');
  } catch (err) {
    console.error('更新促销失败:', err);
    error(res, 500, '更新促销失败');
  }
});

// 删除促销
router.delete('/:id', async (req, res) => {
  try {
    await prisma.promotion.delete({
      where: { id: parseInt(req.params.id) }
    });
    
    success(res, null, '删除成功');
  } catch (err) {
    console.error('删除促销失败:', err);
    error(res, 500, '删除促销失败');
  }
});

// 获取优惠券列表
router.get('/coupons', async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    success(res, coupons, '获取成功');
  } catch (err) {
    console.error('获取优惠券列表失败:', err);
    error(res, 500, '获取优惠券列表失败');
  }
});

// 新增优惠券
router.post('/coupons', async (req, res) => {
  try {
    const { name, type, value, minAmount, quantity, startTime, endTime } = req.body;
    
    if (!name || !type || quantity === undefined) {
      return error(res, 400, '请填写必填项');
    }
    
    const code = generateCouponCode();
    
    const coupon = await prisma.coupon.create({
      data: {
        code, name, type, value, minAmount, quantity,
        remainQuantity: quantity, startTime, endTime
      }
    });
    
    success(res, coupon, '创建成功');
  } catch (err) {
    console.error('创建优惠券失败:', err);
    error(res, 500, '创建优惠券失败');
  }
});

// 删除优惠券
router.delete('/coupons/:id', async (req, res) => {
  try {
    await prisma.coupon.delete({
      where: { id: parseInt(req.params.id) }
    });
    
    success(res, null, '删除成功');
  } catch (err) {
    console.error('删除优惠券失败:', err);
    error(res, 500, '删除优惠券失败');
  }
});

export default router;