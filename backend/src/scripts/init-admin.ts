import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function initAdmin() {
  try {
    console.log('开始初始化管理员账户...');
    
    // 检查是否已存在管理员
    const existAdmin = await prisma.user.findUnique({
      where: { username: 'admin' }
    });
    
    if (existAdmin) {
      console.log('管理员账户已存在，跳过创建');
      process.exit(0);
    }
    
    // 创建默认管理员
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await prisma.user.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        realName: '管理员',
        role: 'admin',
        status: 1
      }
    });
    
    console.log('管理员账户创建成功');
    console.log('用户名: admin');
    console.log('密码: admin123');
    
    // 创建默认商品分类
    const categories = [
      { name: '戒指', sort: 1 },
      { name: '项链', sort: 2 },
      { name: '手链', sort: 3 },
      { name: '耳饰', sort: 4 },
      { name: '发饰', sort: 5 },
      { name: '胸针', sort: 6 }
    ];
    
    for (const cat of categories) {
      await prisma.category.create({ data: cat });
    }
    console.log('默认分类创建成功');
    
    // 创建默认系统配置
    const configs = [
      { configKey: 'shop_name', configValue: '薄荷集市', description: '店铺名称' },
      { configKey: 'safe_stock', configValue: '5', description: '安全库存预警值' },
      { configKey: 'points_rate', configValue: '1', description: '积分倍率' }
    ];
    
    for (const config of configs) {
      await prisma.config.create({ data: config });
    }
    console.log('默认配置创建成功');
    
    console.log('初始化完成!');
    process.exit(0);
  } catch (error) {
    console.error('初始化失败:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

initAdmin();