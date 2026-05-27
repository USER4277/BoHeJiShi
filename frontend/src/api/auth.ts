import request from './index'

export const authApi = {
  login: (username: string, password: string) => {
    const token = btoa(`${username}:${password}`)
    return request.post('/auth/login', { username, password }, {
      headers: { Authorization: `Basic ${token}` }
    })
  },
  getMe: () => request.get('/auth/me'),
}

export default authApi