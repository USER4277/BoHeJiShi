import { describe, it, expect, beforeEach } from 'vitest';
import {
  setCache,
  getCache,
  deleteCache,
  clearCache,
  deleteByPrefix
} from '../src/utils/redis';

describe('缓存工具', () => {
  beforeEach(() => {
    clearCache();
  });

  describe('setCache & getCache', () => {
    it('应该设置和获取缓存', () => {
      setCache('key1', 'value1', 60);
      expect(getCache('key1')).toBe('value1');
    });

    it('应该设置和获取对象缓存', () => {
      const obj = { name: 'test', value: 123 };
      setCache('key2', obj, 60);
      expect(getCache('key2')).toEqual(obj);
    });

    it('应该返回null当key不存在', () => {
      expect(getCache('nonexistent')).toBe(null);
    });

    it('应该返回null当缓存过期', async () => {
      setCache('key3', 'value3', -1); // 负数会导致立即过期
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(getCache('key3')).toBe(null);
    });
  });

  describe('deleteCache', () => {
    it('应该删除指定的缓存', () => {
      setCache('key4', 'value4', 60);
      deleteCache('key4');
      expect(getCache('key4')).toBe(null);
    });

    it('删除不存在的key不应该报错', () => {
      expect(() => deleteCache('nonexistent')).not.toThrow();
    });
  });

  describe('clearCache', () => {
    it('应该清空所有缓存', () => {
      setCache('key5', 'value5', 60);
      setCache('key6', 'value6', 60);
      clearCache();
      expect(getCache('key5')).toBe(null);
      expect(getCache('key6')).toBe(null);
    });
  });

  describe('deleteByPrefix', () => {
    it('应该删除指定前缀的缓存', () => {
      setCache('product:1', 'value1', 60);
      setCache('product:2', 'value2', 60);
      setCache('order:1', 'value3', 60);
      deleteByPrefix('product:');
      expect(getCache('product:1')).toBe(null);
      expect(getCache('product:2')).toBe(null);
      expect(getCache('order:1')).toBe('value3');
    });
  });
});