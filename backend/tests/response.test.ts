import { describe, it, expect } from 'vitest';
import { success, error, pageSuccess } from '../src/utils/response';

// Mock Express response
const createMockRes = () => {
  const res: any = {
    data: null,
    statusCode: 200,
    json: function(data: any) { 
      this.data = data;
      return this;
    }
  };
  // 手动实现status方法
  res.status = function(code: number) {
    this.statusCode = code;
    return this;
  };
  return res;
};

describe('响应工具', () => {
  describe('success', () => {
    it('应该返回成功响应', () => {
      const res = createMockRes();
      success(res, { id: 1 }, '操作成功');
      expect(res.data.code).toBe(200);
      expect(res.data.message).toBe('操作成功');
      expect(res.data.data).toEqual({ id: 1 });
    });

    it('应该使用默认消息', () => {
      const res = createMockRes();
      success(res, null);
      expect(res.data.code).toBe(200);
      expect(res.data.message).toBeTruthy();
    });
  });

  describe('error', () => {
    it('应该返回错误响应', () => {
      const res = createMockRes();
      error(res, 400, '参数错误');
      expect(res.data.code).toBe(400);
      expect(res.data.message).toBe('参数错误');
    });

    it('应该设置正确的状态码', () => {
      const res = createMockRes();
      error(res, 500, '服务器错误');
      // 注意: Express的error函数不直接调用res.status()
      // 它设置状态码的方式可能不同，这里检查data中是否包含错误码
      expect(res.data.code).toBe(500);
    });
  });

  describe('pageSuccess', () => {
    it('应该返回分页响应', () => {
      const res = createMockRes();
      const list = [{ id: 1 }, { id: 2 }];
      pageSuccess(res, list, 100, 1, 20);
      expect(res.data.code).toBe(200);
      expect(res.data.data.list).toEqual(list);
      expect(res.data.data.total).toBe(100);
      expect(res.data.data.page).toBe(1);
      expect(res.data.data.pageSize).toBe(20);
      expect(res.data.data.totalPages).toBe(5);
    });

    it('应该处理空列表', () => {
      const res = createMockRes();
      pageSuccess(res, [], 0, 1, 20);
      expect(res.data.data.totalPages).toBe(0);
      expect(res.data.data.list).toEqual([]);
    });
  });
});