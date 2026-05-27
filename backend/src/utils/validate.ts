// 数据验证工具

// 手机号验证
export function isValidPhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone);
}

// 邮箱验证
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// 价格验证（正数，保留2位小数）
export function isValidPrice(price: number): boolean {
  return price >= 0 && price <= 999999.99 && (price * 100) % 1 === 0;
}

// 数量验证（正整数）
export function isValidQuantity(quantity: number): boolean {
  return Number.isInteger(quantity) && quantity > 0 && quantity <= 999999;
}

// 字符串长度限制
export function validateLength(str: string, min: number, max: number): boolean {
  return str.length >= min && str.length <= max;
}

// 安全的SQL参数（防止SQL注入）
export function sanitizeSQL(str: string): string {
  return str.replace(/['"\\]/g, '');
}

// XSS防护：转义HTML特殊字符
export function escapeHtml(str: string): string {
  const map: Record<string, string> = {
    '&': '&',
    '<': '<',
    '>': '>',
    '"': '"',
    "'": '&#039;'
  };
  return str.replace(/[&<>"']/g, char => map[char]);
}

// 验证必填参数
export function validateRequired(obj: Record<string, any>, fields: string[]): string | null {
  for (const field of fields) {
    if (obj[field] === undefined || obj[field] === null || obj[field] === '') {
      return `缺少必填参数: ${field}`;
    }
  }
  return null;
}

// 验证数值范围
export function validateRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

// 过滤对象中的空值
export function filterEmptyValues<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null && value !== '') {
      result[key] = value;
    }
  }
  return result;
}