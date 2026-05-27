import request from './index'

export const saleApi = {
  // 订单
  createOrder: (data: any) => request.post('/sale/orders', data),
  getOrders: (params?: any) => request.get('/sale/orders', { params }),
  getOrderDetail: (id: number) => request.get(`/sale/orders/${id}`),
  returnOrder: (orderId: number, data: any) => request.post('/sale/returns', { orderId, ...data }),
  
  // 挂单
  holdOrder: (data: any) => request.post('/sale/holds', data),
  getHolds: () => request.get('/sale/holds'),
  getHold: (holdNo: string) => request.get(`/sale/holds/${holdNo}`),
}

export default saleApi