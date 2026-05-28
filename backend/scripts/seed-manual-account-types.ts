import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('开始初始化手工账类型...');

  // 收入类型
  const incomeTypes = [
    { name: '其他营业收入', description: '非商品销售的其他营业收入' },
    { name: '服务收入', description: '提供服务获得的收入' },
    { name: '租金收入', description: '出租场地或设备获得的收入' },
    { name: '利息收入', description: '银行存款或理财收益' },
    { name: '补贴收入', description: '政府或其他机构的补贴' },
    { name: '其他收入', description: '其他杂项收入' },
  ];

  // 支出类型
  const expenseTypes = [
    { name: '房租', description: '门店或仓库租金' },
    { name: '水费', description: '水费支出' },
    { name: '电费', description: '电费支出' },
    { name: '燃气费', description: '燃气费支出' },
    { name: '物业费', description: '物业管理费' },
    { name: '税费', description: '各类税费支出' },
    { name: '工资', description: '员工工资支出' },
    { name: '社保公积金', description: '社保和公积金缴纳' },
    { name: '办公用品', description: '办公用品采购费用' },
    { name: '装修维修', description: '装修和维修费用' },
    { name: '广告宣传', description: '广告和宣传推广费用' },
    { name: '运输费', description: '物流运输费用' },
    { name: '通讯费', description: '电话、网络等通讯费' },
    { name: '差旅费', description: '出差相关费用' },
    { name: '招待费', description: '业务招待费用' },
    { name: '培训费', description: '员工培训费用' },
    { name: '保险费', description: '各类保险费用' },
    { name: '银行手续费', description: '银行服务手续费' },
    { name: '其他支出', description: '其他杂项支出' },
  ];

  // 创建收入类型
  for (let i = 0; i < incomeTypes.length; i++) {
    const type = incomeTypes[i];
    await prisma.manualAccountType.upsert({
      where: { name_category: { name: type.name, category: 'income' } },
      create: {
        name: type.name,
        category: 'income',
        description: type.description,
        sort: i,
        status: 1,
      },
      update: {
        description: type.description,
        sort: i,
      },
    });
    console.log(`✓ 创建收入类型: ${type.name}`);
  }

  // 创建支出类型
  for (let i = 0; i < expenseTypes.length; i++) {
    const type = expenseTypes[i];
    await prisma.manualAccountType.upsert({
      where: { name_category: { name: type.name, category: 'expense' } },
      create: {
        name: type.name,
        category: 'expense',
        description: type.description,
        sort: i,
        status: 1,
      },
      update: {
        description: type.description,
        sort: i,
      },
    });
    console.log(`✓ 创建支出类型: ${type.name}`);
  }

  console.log('手工账类型初始化完成！');
}

main()
  .catch((e) => {
    console.error('初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
