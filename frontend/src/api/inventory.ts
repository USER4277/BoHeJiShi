import request from './index'

export const inventoryApi = {
  getList: (params?: any) => request.get('/inventory', { params }),
  getWarnings: () => request.get('/inventory/warnings'),
  in: (skuId: number, quantity: number, remark?: string) => 
    request.post('/inventory/in', { skuId, quantity, remark }),
  out: (skuId: number, quantity: number, remark?: string) => 
    request.post('/inventory/out', { skuId, quantity, remark }),
  getLogs: (params?: any) => request.get('/inventory/logs', { params }),
}

export default inventoryApi