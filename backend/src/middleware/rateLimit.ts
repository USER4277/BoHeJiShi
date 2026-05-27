// 请求限流中间件
import { Request, Response, NextFunction } from 'express';

// 简单的内存存储（生产环境应使用Redis）
const requestCounts = new Map<string, { count: number, resetTime: number }>();

// 限流配置
const RATE_LIMIT_WINDOW = 60 * 1000; // 1分钟
const RATE_LIMIT_MAX = 100; // 最大请求数

export function rateLimit(req: Request, res: Response, next: NextFunction) {
  const key = req.ip || 'unknown';
  const now = Date.now();
  
  // 获取或初始化请求记录
  let record = requestCounts.get(key);
  
  if (!record || now > record.resetTime) {
    record = { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
    requestCounts.set(key, record);
  }
  
  record.count++;
  
  // 设置限流头
  res.setHeader('X-RateLimit-Limit', RATE_LIMIT_MAX.toString());
  res.setHeader('X-RateLimit-Remaining', Math.max(0, RATE_LIMIT_MAX - record.count).toString());
  
  if (record.count > RATE_LIMIT_MAX) {
    return res.status(429).json({
      code: 429,
      message: '请求过于频繁，请稍后再试',
      data: null
    });
  }
  
  next();
}

// 清理过期记录（每小时执行一次）
export function cleanupRateLimit() {
  const now = Date.now();
  for (const [key, record] of requestCounts.entries()) {
    if (now > record.resetTime + RATE_LIMIT_WINDOW) {
      requestCounts.delete(key);
    }
  }
}