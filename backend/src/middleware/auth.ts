import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config';
import bcrypt from 'bcrypt';

// 扩展Express Request类型
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        realName: string;
        role: string;
      };
    }
  }
}

// Basic Auth 认证中间件
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({
        code: 401,
        message: '未授权，请登录'
      });
    }
    
    // 解码 Basic Auth
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
    const [username, password] = credentials.split(':');
    
    // 查找用户
    const user = await prisma.user.findUnique({
      where: { username }
    });
    
    if (!user || user.status !== 1) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误'
      });
    }
    
    // 验证密码
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误'
      });
    }
    
    // 注入用户信息到请求
    req.user = {
      id: user.id,
      username: user.username,
      realName: user.realName || '',
      role: user.role
    };
    
    next();
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: '认证失败'
    });
  }
}