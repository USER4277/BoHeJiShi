import { Request, Response } from 'express';

// 统一响应格式
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
}

// 成功响应
export function success<T>(res: Response, data?: T, message = 'success'): void {
  res.json({
    code: 200,
    message,
    data
  });
}

// 错误响应
export function error(res: Response, code: number, message: string, errors?: any): void {
  res.json({
    code,
    message,
    errors
  });
}

// 分页响应
export function pageSuccess<T>(res: Response, data: T[], total: number, page: number, pageSize: number): void {
  res.json({
    code: 200,
    message: 'success',
    data: {
      list: data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    }
  });
}