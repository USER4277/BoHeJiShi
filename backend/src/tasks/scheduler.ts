import cron from 'node-cron';
import { backupDatabase } from '../utils/backup';
import { logger } from '../utils/logger';

// 初始化定时任务
export function initScheduler() {
  // 每天23:00执行数据库备份
  cron.schedule('0 23 * * *', async () => {
    logger.info('开始执行数据库备份...');
    try {
      await backupDatabase();
      logger.info('数据库备份完成');
    } catch (error) {
      logger.error('数据库备份失败', error as Error);
    }
  });
  
  logger.info('定时任务已启动');
}