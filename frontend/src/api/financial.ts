import request from './index'

export const financialApi = {
  // 获取现金流量报表
  getCashflow: (params?: any) => request.get('/financial/cashflow', { params }),

  // 获取损益报表
  getProfitLoss: (params?: any) => request.get('/financial/profit-loss', { params }),
}

export default financialApi
