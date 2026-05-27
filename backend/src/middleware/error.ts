import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// 统一错误处理中间件
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  logger.error(`请求错误: ${req.path}`, err);
  
  res.status(500).json({
    code: 500,
    message: '服务器内部错误'
  });
}