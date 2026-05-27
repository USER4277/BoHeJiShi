import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { app } from './app';
import { logger } from './utils/logger';
import { initScheduler } from './tasks/scheduler';

// 加载环境变量
dotenv.config();

const PORT = process.env.PORT || 3001;

// 启动服务器
app.listen(PORT, () => {
  logger.info(`薄荷集市后端服务启动成功`);
  logger.info(`服务地址: http://localhost:${PORT}`);
  logger.info(`API地址: http://localhost:${PORT}/api`);
  
  // 初始化定时任务
  initScheduler();
});