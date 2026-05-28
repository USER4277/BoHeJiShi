import { Router } from 'express';
const router = Router();

// 导入路由模块
import authRoutes from './auth';
import categoryRoutes from './category';
import productRoutes from './product';
import inventoryRoutes from './inventory';
import saleRoutes from './sale';
import memberRoutes from './member';
import promotionRoutes from './promotion';
import reportRoutes from './report';
import financialRoutes from './financial';
import configRoutes from './config';
import uploadRoutes from './upload';
import systemRoutes from './system';
import brandRoutes from './brand';
import materialRoutes from './material';
import attributeRoutes from './attribute';
import stocktakingRoutes from './stocktaking';
import transferRoutes from './transfer';
import manualAccountRoutes from './manual-account';

// 注册路由
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/brands', brandRoutes);
router.use('/materials', materialRoutes);
router.use('/attributes', attributeRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/stocktaking', stocktakingRoutes);
router.use('/transfers', transferRoutes);
router.use('/sale', saleRoutes);
router.use('/members', memberRoutes);
router.use('/promotions', promotionRoutes);
router.use('/reports', reportRoutes);
router.use('/financial', financialRoutes);
router.use('/config', configRoutes);
router.use('/upload', uploadRoutes);
router.use('/system', systemRoutes);
router.use('/manual-account', manualAccountRoutes);

export default router;