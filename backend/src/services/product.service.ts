import { prisma } from '../config';
import { generateCode } from '../utils/code';
import { logOperation, OperationType, OperationModule } from '../utils/operation-log';

/**
 * 商品服务层
 * 处理商品相关的业务逻辑
 */
export class ProductService {

  /**
   * 获取商品列表(分页)
   */
  async getProducts(params: {
    page: number;
    pageSize: number;
    categoryId?: number;
    keyword?: string;
    status?: number;
  }) {
    const { page, pageSize, categoryId, keyword, status } = params;

    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (status !== undefined) where.status = status;
    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { code: { contains: keyword } }
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          brand: true,
          material: true,
          skus: true
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.product.count({ where })
    ]);

    return {
      list: products,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  /**
   * 根据ID获取商品详情
   */
  async getProductById(id: number) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        material: true,
        skus: true
      }
    });

    return product;
  }

  /**
   * 创建商品
   */
  async createProduct(data: {
    name: string;
    categoryId: number;
    brandId?: number;
    materialId?: number;
    price: number;
    memberPrice?: number;
    costPrice?: number;
    mainImage?: string;
    detailImages?: string;
  }, userId?: number) {
    // 验证必填字段
    if (!data.name || !data.categoryId || !data.price) {
      throw new Error('请填写必填项');
    }

    // 生成商品编码
    const code = await generateCode('P');

    const product = await prisma.product.create({
      data: {
        code,
        name: data.name,
        categoryId: data.categoryId,
        brandId: data.brandId || null,
        materialId: data.materialId || null,
        price: data.price,
        memberPrice: data.memberPrice || null,
        costPrice: data.costPrice || null,
        mainImage: data.mainImage || null,
        detailImages: data.detailImages || null,
        status: 1
      },
      include: {
        category: true,
        brand: true,
        material: true
      }
    });

    // 自动创建默认SKU
    const skuCode = await generateCode('SKU');
    await prisma.sku.create({
      data: {
        productId: product.id,
        skuCode: skuCode,
        specs: '默认规格',
        price: data.price,
        stockQuantity: 0,
        status: 1
      }
    });

    // 重新查询商品，包含SKU信息
    const productWithSku = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        category: true,
        brand: true,
        material: true,
        skus: true
      }
    });

    return productWithSku;
  }

  /**
   * 更新商品
   */
  async updateProduct(id: number, data: {
    name?: string;
    categoryId?: number;
    brandId?: number;
    materialId?: number;
    price?: number;
    memberPrice?: number;
    costPrice?: number;
    mainImage?: string;
    detailImages?: string;
    status?: number;
  }, userId?: number) {
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.brandId !== undefined && { brandId: data.brandId || null }),
        ...(data.materialId !== undefined && { materialId: data.materialId || null }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.memberPrice !== undefined && { memberPrice: data.memberPrice || null }),
        ...(data.costPrice !== undefined && { costPrice: data.costPrice || null }),
        ...(data.mainImage !== undefined && { mainImage: data.mainImage || null }),
        ...(data.detailImages !== undefined && { detailImages: data.detailImages || null }),
        ...(data.status !== undefined && { status: data.status })
      },
      include: {
        category: true,
        brand: true,
        material: true
      }
    });

    // 记录操作日志
    if (userId) {
      await logOperation({
        userId,
        module: OperationModule.PRODUCT,
        action: OperationType.UPDATE,
        description: `更新商品: ${product.name}`,
        targetId: product.id,
        targetType: 'product'
      });
    }

    return product;
  }

  /**
   * 删除商品
   */
  async deleteProduct(id: number, userId?: number) {
    // 检查商品是否有关联的销售记录
    const hasOrders = await prisma.orderItem.count({
      where: {
        sku: {
          productId: id
        }
      }
    });

    if (hasOrders > 0) {
      throw new Error('该商品已有销售记录,无法删除');
    }

    // 获取商品信息用于日志
    const product = await prisma.product.findUnique({
      where: { id },
      select: { name: true }
    });

    // 删除商品(级联删除SKU和库存)
    await prisma.product.delete({
      where: { id }
    });

    // 记录操作日志
    if (userId && product) {
      await logOperation({
        userId,
        module: OperationModule.PRODUCT,
        action: OperationType.DELETE,
        description: `删除商品: ${product.name}`,
        targetId: id,
        targetType: 'product'
      });
    }

    return true;
  }

  /**
   * 更新商品状态(上架/下架)
   */
  async updateStatus(id: number, status: number) {
    const product = await prisma.product.update({
      where: { id },
      data: { status },
      include: {
        category: true,
        brand: true
      }
    });

    return product;
  }
}

// 导出单例
export const productService = new ProductService();
