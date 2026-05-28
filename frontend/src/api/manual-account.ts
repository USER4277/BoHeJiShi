import request from './index'

export const manualAccountApi = {
  // 类型管理
  getTypes: (params?: any) => request.get('/manual-account/types', { params }),
  createType: (data: any) => request.post('/manual-account/types', data),
  updateType: (id: number, data: any) => request.put(`/manual-account/types/${id}`, data),
  deleteType: (id: number) => request.delete(`/manual-account/types/${id}`),

  // 记录管理
  getRecords: (params: any) => request.get('/manual-account/records', { params }),
  createRecord: (data: any) => request.post('/manual-account/records', data),
  updateRecord: (id: number, data: any) => request.put(`/manual-account/records/${id}`, data),
  deleteRecord: (id: number) => request.delete(`/manual-account/records/${id}`),

  // 统计
  getStatistics: (params?: any) => request.get('/manual-account/statistics', { params }),
}

export default manualAccountApi
