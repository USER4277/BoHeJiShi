import request from './index'

export const memberApi = {
  getList: (params?: any) => request.get('/members', { params }),
  getDetail: (id: number) => request.get(`/members/${id}`),
  create: (data: any) => request.post('/members', data),
  update: (id: number, data: any) => request.put(`/members/${id}`, data),
  recharge: (id: number, data: any) => request.post(`/members/${id}/recharge`, data),
  getPoints: (id: number) => request.get(`/members/${id}/points`),
  adjustPoints: (id: number, data: any) => request.post(`/members/${id}/points`, data),
}

export default memberApi