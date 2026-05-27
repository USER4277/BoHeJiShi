import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

// 数据库初始化
export async function initDatabase() {
  try {
    await prisma.$connect();
    console.log('数据库连接成功');
  } catch (error) {
    console.error('数据库连接失败:', error);
    throw error;
  }
}

// 数据库断开
export async function closeDatabase() {
  await prisma.$disconnect();
}