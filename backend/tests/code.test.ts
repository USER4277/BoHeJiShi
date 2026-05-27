import { describe, it, expect } from 'vitest';
import { 
  generateOrderNo, 
  generateReturnNo, 
  generateHoldNo,
  generateMemberCode,
  generateCouponCode 
} from '../src/utils/code';

describe('编码生成工具', () => {
  describe('generateOrderNo', () => {
    it('应该生成唯一订单号', () => {
      const no = generateOrderNo();
      // 格式: 前缀(2字母) + 时间戳(精确到秒约10-12位)
      expect(no.length).toBeGreaterThanOrEqual(10);
      expect(no).toMatch(/^[A-Z]{2}\d+$/);
    });

    it('应该生成不同格式的订单号', () => {
      const no1 = generateOrderNo();
      const no2 = generateOrderNo();
      expect(no1).not.toBe(no2);
    });
  });

  describe('generateReturnNo', () => {
    it('应该生成退货单号', () => {
      const no = generateReturnNo();
      expect(no.length).toBeGreaterThanOrEqual(10);
      expect(no).toMatch(/^[A-Z]{2}\d+$/);
    });
  });

  describe('generateHoldNo', () => {
    it('应该生成挂单号', () => {
      const no = generateHoldNo();
      expect(no.length).toBeGreaterThanOrEqual(10);
      expect(no).toMatch(/^[A-Z]{2}\d+$/);
    });
  });

  describe('generateMemberCode', () => {
    it('应该生成会员编号', () => {
      const code = generateMemberCode();
      expect(code.length).toBeGreaterThanOrEqual(8);
      expect(code).toMatch(/^[A-Z0-9]+$/);
    });
  });

  describe('generateCouponCode', () => {
    it('应该生成优惠券码', () => {
      const code = generateCouponCode();
      expect(code.length).toBeGreaterThanOrEqual(8);
      expect(code).toMatch(/^[A-Z0-9]+$/);
    });

    it('应该生成大写字母和数字', () => {
      const code = generateCouponCode();
      expect(code).toMatch(/^[A-Z0-9]+$/);
    });
  });
});