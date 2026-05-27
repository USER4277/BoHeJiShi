import { describe, it, expect } from 'vitest';
import {
  formatMoney,
  formatDate,
  deepClone,
  generateId,
  formatNumber,
  isValidPhone,
  isValidEmail
} from './helpers';

describe('前端工具函数', () => {
  describe('formatMoney', () => {
    it('应该格式化金额', () => {
      expect(formatMoney(100)).toBe('¥100.00');
      expect(formatMoney(99.9)).toBe('¥99.90');
      expect(formatMoney('99.99')).toBe('¥99.99');
    });
  });

  describe('formatDate', () => {
    it('应该格式化日期', () => {
      const date = '2024-01-15T10:30:00';
      expect(formatDate(date, 'YYYY-MM-DD')).toBe('2024-01-15');
    });

    it('应该格式化日期时间', () => {
      const date = '2024-01-15T10:30:45';
      expect(formatDate(date, 'YYYY-MM-DD HH:mm:ss')).toBe('2024-01-15 10:30:45');
    });
  });

  describe('deepClone', () => {
    it('应该深拷贝对象', () => {
      const obj = { a: 1, b: { c: 2 } };
      const clone = deepClone(obj);
      expect(clone).toEqual(obj);
      expect(clone).not.toBe(obj);
      expect(clone.b).not.toBe(obj.b);
    });

    it('应该深拷贝数组', () => {
      const arr = [1, [2, 3]];
      const clone = deepClone(arr);
      expect(clone).toEqual(arr);
      expect(clone).not.toBe(arr);
      expect(clone[1]).not.toBe(arr[1]);
    });
  });

  describe('generateId', () => {
    it('应该生成唯一ID', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(0);
    });
  });

  describe('formatNumber', () => {
    it('应该格式化数字为千分位', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1234567)).toBe('1,234,567');
    });
  });

  describe('isValidPhone', () => {
    it('应该验证手机号', () => {
      expect(isValidPhone('13812345678')).toBe(true);
      expect(isValidPhone('15912345678')).toBe(true);
      expect(isValidPhone('12345678901')).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('应该验证邮箱', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('invalid')).toBe(false);
    });
  });
});