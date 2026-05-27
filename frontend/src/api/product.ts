import request from './index'

export const productApi = {
  getList: (params: any) => request.get('/products', { params }),
  getDetail: (id: number) => request.get(`/products/${id}`),
  create: (data: any) => request.post('/products', data),
  update: (id: number, data: any) => request.put(`/products/${id}`, data),
  delete: (id: number) => request.delete(`/products/${id}`),
  updateStatus: (id: number, status: number) => request.patch(`/products/${id}/status`, { status }),
}

export const categoryApi = {
  getList: () => request.get('/categories'),
  create: (data: any) => request.post('/categories', data),
  update: (id: number, data: any) => request.put(`/categories/${id}`, data),
  delete: (id: number) => request.delete(`/categories/${id}`),
}

export default { productApi, categoryApi }