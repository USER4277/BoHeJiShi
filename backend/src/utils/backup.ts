import fs from 'fs';
import path from 'path';
import os from 'os';

const DATA_DIR = path.join(os.homedir(), 'Documents', '薄荷集市', 'data');
const BACKUP_DIR = path.join(DATA_DIR, 'backup');

// 确保备份目录存在
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// 备份数据库
export async function backupDatabase(): Promise<string> {
  const dbPath = path.join(DATA_DIR, 'shop.db');
  
  if (!fs.existsSync(dbPath)) {
    throw new Error('数据库文件不存在');
  }
  
  const timestamp = dayjs().format('YYYYMMDD_HHmmss');
  const backupFile = path.join(BACKUP_DIR, `shop_${timestamp}.db`);
  
  // 复制数据库文件
  fs.copyFileSync(dbPath, backupFile);
  
  console.log(`数据库备份成功: ${backupFile}`);
  
  // 清理旧备份（保留30天）
  cleanupOldBackups(30);
  
  return backupFile;
}

// 清理旧备份
function cleanupOldBackups(days: number): void {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  try {
    const files = fs.readdirSync(BACKUP_DIR);
    files.forEach(filename => {
      if (filename.startsWith('shop_') && filename.endsWith('.db')) {
        const filepath = path.join(BACKUP_DIR, filename);
        const stat = fs.statSync(filepath);
        if (stat.mtime < cutoffDate) {
          fs.unlinkSync(filepath);
          console.log(`删除旧备份: ${filepath}`);
        }
      }
    });
  } catch (error) {
    console.error('清理旧备份失败:', error);
  }
}

// 导入dayjs
import dayjs from 'dayjs';