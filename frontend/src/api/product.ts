import request from './index'

export const productApi = {
  getList: (params: any) => request.get('/products', { params }),
  getDetail: (id: number) => request.get(`/products/${id}`),
  create: (data: any) => request.post('/products', data),
  update: (id: number, data: any) => request.put(`/products/${id}`, data),
  delete: (id: number) => request.delete(`/products/${id}`),
  updateStatus: (id: number, status: number) => request.patch(`/products/${id}/status`, { status }),
  getCategories: () => request.get('/categories'),
}

export const categoryApi = {
  getList: () => request.get('/categories'),
  create: (data: any) => request.post('/categories', data),
  update: (id: number, data: any) => request.put(`/categories/${id}`, data),
  delete: (id: number) => request.delete(`/categories/${id}`),
}

export const brandApi = {
  getList: (params?: any) => request.get('/brands', { params }),
  getDetail: (id: number) => request.get(`/brands/${id}`),
  create: (data: any) => request.post('/brands', data),
  update: (id: number, data: any) => request.put(`/brands/${id}`, data),
  delete: (id: number) => request.delete(`/brands/${id}`),
}

export const materialApi = {
  getList: (params?: any) => request.get('/materials', { params }),
  getDetail: (id: number) => request.get(`/materials/${id}`),
  create: (data: any) => request.post('/materials', data),
  update: (id: number, data: any) => request.put(`/materials/${id}`, data),
  delete: (id: number) => request.delete(`/materials/${id}`),
}

export default { productApi, categoryApi, brandApi, materialApi }