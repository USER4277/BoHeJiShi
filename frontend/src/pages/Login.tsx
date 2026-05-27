import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Checkbox, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { authApi } from '../api/auth'
import { useAuthStore } from '../stores/authStore'
import { mintTheme } from '../theme/colors'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true)
    try {
      const token = btoa(`${values.username}:${values.password}`)
      const res: any = await authApi.login(values.username, values.password)
      login(res.data, token)
      message.success('登录成功')
      navigate('/')
    } catch (e) {
      message.error('用户名或密码错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: mintTheme.gradients.background,
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: 64,
              height: 64,
              background: mintTheme.gradients.primary,
              borderRadius: mintTheme.borderRadius['2xl'],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(34, 197, 94, 0.3)'
            }}>
              <span style={{ fontSize: 32 }}>🌿</span>
            </div>
            <div style={{ textAlign: 'left' }}>
              <h1 style={{
                fontSize: 32,
                fontWeight: 'bold',
                color: mintTheme.primary[800],
                margin: 0,
                lineHeight: 1.2
              }}>薄荷集市</h1>
              <p style={{
                color: mintTheme.primary[600],
                margin: 0,
                fontSize: 16
              }}>店铺管理系统</p>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div style={{
          ...mintTheme.glass,
          borderRadius: mintTheme.borderRadius['3xl'],
          padding: '40px',
        }}>
          <h2 style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: mintTheme.primary[800],
            textAlign: 'center',
            marginBottom: 32
          }}>用户登录</h2>

          <Form
            name="login"
            onFinish={onFinish}
            autoComplete="off"
            size="large"
            initialValues={{ remember: true }}
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#9ca3af' }} />}
                placeholder="请输入用户名"
                style={{
                  borderRadius: mintTheme.borderRadius.lg,
                  border: '2px solid #e5e7eb',
                  padding: '12px 16px',
                  paddingLeft: 48
                }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#9ca3af' }} />}
                placeholder="请输入密码"
                style={{
                  borderRadius: mintTheme.borderRadius.lg,
                  border: '2px solid #e5e7eb',
                  padding: '12px 16px',
                  paddingLeft: 48
                }}
              />
            </Form.Item>

            <Form.Item>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8
              }}>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox style={{ color: mintTheme.primary[600] }}>
                    记住我
                  </Checkbox>
                </Form.Item>
                <a
                  href="#"
                  style={{
                    color: mintTheme.primary[500],
                    fontSize: 14
                  }}
                >
                  忘记密码？
                </a>
              </div>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{
                  background: mintTheme.gradients.primary,
                  border: 'none',
                  height: 48,
                  fontSize: 16,
                  fontWeight: 'bold',
                  borderRadius: mintTheme.borderRadius.lg,
                  boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  登录
                </span>
              </Button>
            </Form.Item>
          </Form>

          {/* Default Account Info */}
          <div style={{
            marginTop: 24,
            padding: 16,
            background: mintTheme.primary[50],
            borderRadius: mintTheme.borderRadius.lg,
            textAlign: 'center',
            color: '#6b7280',
            fontSize: 14
          }}>
            <span style={{ color: mintTheme.primary[500] }}>ℹ️</span> 默认账户: admin / admin123
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div style={{
        position: 'fixed',
        top: '10%',
        left: '5%',
        fontSize: 80,
        opacity: 0.1,
        transform: 'rotate(-15deg)',
        pointerEvents: 'none'
      }}>🍃</div>
      <div style={{
        position: 'fixed',
        top: '60%',
        right: '10%',
        fontSize: 70,
        opacity: 0.1,
        transform: 'rotate(25deg)',
        pointerEvents: 'none'
      }}>🌿</div>
      <div style={{
        position: 'fixed',
        bottom: '15%',
        left: '15%',
        fontSize: 60,
        opacity: 0.1,
        transform: 'rotate(10deg)',
        pointerEvents: 'none'
      }}>🌱</div>
    </div>
  )
}