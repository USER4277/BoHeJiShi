import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function generateCode(prefix: string): Promise<string> {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
}

async function fixMissingSkus() {
  try {
    // 查找所有没有SKU的商品
    const productsWithoutSku = await prisma.product.findMany({
      where: {
        skus: {
          none: {}
        }
      },
      include: {
        skus: true
      }
    });

    console.log(`找到 ${productsWithoutSku.length} 个商品没有SKU`);

    for (const product of productsWithoutSku) {
      const skuCode = await generateCode('SKU');

      await prisma.sku.create({
        data: {
          productId: product.id,
          skuCode: skuCode,
          specs: '默认规格',
          price: product.price,
          stockQuantity: 0,
          status: 1
        }
      });

      console.log(`为商品 "${product.name}" (ID: ${product.id}) 创建了SKU: ${skuCode}`);
    }

    console.log('修复完成！');
  } catch (error) {
    console.error('修复失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMissingSkus();
