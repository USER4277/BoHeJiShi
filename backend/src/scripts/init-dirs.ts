#!/usr/bin/env node
/**
 * 初始化数据存储目录
 * 创建必要的目录结构: data/, data/backup/, data/images/, logs/
 */

import fs from 'fs';
import path from 'path';

const BASE_DIR = path.join(process.env.HOME!, 'Documents/薄荷集市');

const directories = [
  path.join(BASE_DIR, 'data'),
  path.join(BASE_DIR, 'data/backup'),
  path.join(BASE_DIR, 'data/images'),
  path.join(BASE_DIR, 'logs')
];

console.log('开始初始化数据存储目录...\n');

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ 创建目录: ${dir}`);
  } else {
    console.log(`✓  目录已存在: ${dir}`);
  }
});

console.log('\n目录初始化完成！');
console.log(`\n数据库路径: ${path.join(BASE_DIR, 'data/shop.db')}`);
console.log(`备份路径: ${path.join(BASE_DIR, 'data/backup/')}`);
console.log(`图片路径: ${path.join(BASE_DIR, 'data/images/')}`);
console.log(`日志路径: ${path.join(BASE_DIR, 'logs/')}`);
