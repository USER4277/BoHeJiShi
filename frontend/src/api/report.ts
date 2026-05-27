import request from './index'

export const reportApi = {
  getDashboard: () => request.get('/reports/dashboard'),
  getDaily: (date?: string) => request.get('/reports/daily', { params: { date } }),
  settlement: (date?: string) => request.post('/reports/settlement', { date }),
  getSales: (params?: any) => request.get('/reports/sales', { params }),
}

export default reportApi