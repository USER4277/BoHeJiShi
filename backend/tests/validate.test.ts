import { describe, it, expect } from 'vitest';
import {
  isValidPhone,
  isValidEmail,
  isValidPrice,
  isValidQuantity,
  validateLength,
  sanitizeSQL,
  escapeHtml,
  validateRequired,
  validateRange,
  filterEmptyValues
} from '../src/utils/validate';

describe('数据验证工具', () => {
  describe('isValidPhone', () => {
    it('应该验证正确的手机号', () => {
      expect(isValidPhone('13812345678')).toBe(true);
      expect(isValidPhone('15912345678')).toBe(true);
      expect(isValidPhone('18812345678')).toBe(true);
    });

    it('应该拒绝无效的手机号', () => {
      expect(isValidPhone('12345678901')).toBe(false); // 错误开头
      expect(isValidPhone('1381234567')).toBe(false);  // 不足11位
      expect(isValidPhone('138123456789')).toBe(false); // 超过11位
      expect(isValidPhone('abc123456789')).toBe(false);  // 包含字母
      expect(isValidPhone('')).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('应该验证正确的邮箱', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co')).toBe(true);
    });

    it('应该拒绝无效的邮箱', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('user@domain')).toBe(false);
    });
  });

  describe('isValidPrice', () => {
    it('应该验证正确的价格', () => {
      expect(isValidPrice(0)).toBe(true);
      expect(isValidPrice(99.99)).toBe(true);
      expect(isValidPrice(100)).toBe(true);
    });

    it('应该拒绝无效的价格', () => {
      expect(isValidPrice(-1)).toBe(false);
      expect(isValidPrice(1000000)).toBe(false);
      expect(isValidPrice(99.999)).toBe(false); // 超过2位小数
    });
  });

  describe('isValidQuantity', () => {
    it('应该验证正确的数量', () => {
      expect(isValidQuantity(1)).toBe(true);
      expect(isValidQuantity(100)).toBe(true);
      expect(isValidQuantity(999999)).toBe(true);
    });

    it('应该拒绝无效的数量', () => {
      expect(isValidQuantity(0)).toBe(false);
      expect(isValidQuantity(-1)).toBe(false);
      expect(isValidQuantity(1.5)).toBe(false); // 非整数
      expect(isValidQuantity(1000000)).toBe(false);
    });
  });

  describe('validateLength', () => {
    it('应该验证字符串长度', () => {
      expect(validateLength('abc', 2, 5)).toBe(true);
      expect(validateLength('ab', 2, 5)).toBe(true);
      expect(validateLength('abcde', 2, 5)).toBe(true);
    });

    it('应该拒绝超出范围的长度', () => {
      expect(validateLength('a', 2, 5)).toBe(false);
      expect(validateLength('abcdef', 2, 5)).toBe(false);
    });
  });

  describe('sanitizeSQL', () => {
    it('应该转义SQL特殊字符', () => {
      expect(sanitizeSQL("test'value")).toBe("testvalue");
      expect(sanitizeSQL('test"value')).toBe('testvalue');
      expect(sanitizeSQL("test\\value")).toBe('testvalue');
    });
  });

  describe('escapeHtml', () => {
    it('应该转义HTML特殊字符', () => {
      expect(escapeHtml('<script>')).toBe('<script>');
      expect(escapeHtml('"quotes"')).toBe('"quotes"');
      expect(escapeHtml("it's")).toBe('it&#039;s');
    });
  });

  describe('validateRequired', () => {
    it('应该验证必填参数', () => {
      const obj = { name: 'test', phone: '13812345678' };
      expect(validateRequired(obj, ['name', 'phone'])).toBe(null);
    });

    it('应该返回缺失的字段', () => {
      const obj = { name: 'test' };
      expect(validateRequired(obj, ['name', 'phone'])).toBe('缺少必填参数: phone');
    });
  });

  describe('validateRange', () => {
    it('应该验证数值范围', () => {
      expect(validateRange(5, 1, 10)).toBe(true);
      expect(validateRange(1, 1, 10)).toBe(true);
      expect(validateRange(10, 1, 10)).toBe(true);
    });

    it('应该拒绝超出范围的值', () => {
      expect(validateRange(0, 1, 10)).toBe(false);
      expect(validateRange(11, 1, 10)).toBe(false);
    });
  });

  describe('filterEmptyValues', () => {
    it('应该过滤空值', () => {
      const obj = { a: 1, b: null, c: undefined, d: '', e: 0 };
      const result = filterEmptyValues(obj);
      expect(result).toEqual({ a: 1, e: 0 });
    });
  });
});