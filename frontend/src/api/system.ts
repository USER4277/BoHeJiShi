import request from './index'

export const systemApi = {
  // 用户管理
  getUsers: (params: any) => request.get('/system/users', { params }),
  getMe: () => request.get('/system/users/me'),
  createUser: (data: any) => request.post('/system/users', data),
  updateUser: (id: number, data: any) => request.put(`/system/users/${id}`, data),
  resetPassword: (id: number, newPassword?: string) => 
    request.put(`/system/users/${id}/reset-password`, { newPassword }),
  changePassword: (oldPassword: string, newPassword: string) =>
    request.put('/system/users/password', { oldPassword, newPassword }),
  
  // 角色管理
  getRoles: () => request.get('/system/roles'),
  
  // 系统配置
  getConfig: () => request.get('/system/config'),
  getConfigByKey: (key: string) => request.get(`/system/config/${key}`),
  updateConfig: (key: string, data: any) => request.put(`/system/config/${key}`, data),
  batchUpdateConfig: (configs: any[]) => request.put('/system/config', configs),
  
  // 操作日志
  getLogs: (params: any) => request.get('/system/logs', { params }),
  
  // 数据备份
  backup: () => request.post('/system/backup'),
  getBackups: () => request.get('/system/backups'),
}

export default systemApi