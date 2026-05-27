import dayjs from 'dayjs';

// 生成订单号 XS+日期+序号
export function generateOrderNo(): string {
  const date = dayjs().format('YYYYMMDD');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `XS${date}${random}`;
}

// 生成退货单号 TH+日期+序号
export function generateReturnNo(): string {
  const date = dayjs().format('YYYYMMDD');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `TH${date}${random}`;
}

// 生成挂单号 GD+日期+序号
export function generateHoldNo(): string {
  const date = dayjs().format('YYYYMMDD');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `GD${date}${random}`;
}

// 生成商品编码 PRD+序号
export async function generateProductCode(): Promise<string> {
  const date = dayjs().format('YYYYMMDD');
  const random = Math.floor(Math.random() * 100).toString().padStart(3, '0');
  return `PRD${date}${random}`;
}

// 生成会员编号 VIP+序号
export function generateMemberCode(): string {
  const timestamp = dayjs().valueOf().toString().slice(-6);
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `VIP${timestamp}${random}`;
}

// 生成优惠券编码 CP+日期+随机
export function generateCouponCode(): string {
  const date = dayjs().format('YYYYMMDD');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CP${date}${random}`;
}