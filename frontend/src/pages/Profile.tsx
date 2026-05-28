import { useState } from 'react'
import { Card, Form, Input, Button, message, Divider, Avatar, Space } from 'antd'
import { UserOutlined, LockOutlined, SaveOutlined } from '@ant-design/icons'
import { useAuthStore } from '../stores/authStore'
import { systemApi } from '../api/system'
import { mintTheme } from '../theme/colors'

export default function Profile() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const handleChangePassword = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      await systemApi.changePassword(values.oldPassword, values.newPassword)
      message.success('密码修改成功，请重新登录')
      form.resetFields()
    } catch (e: any) {
      message.error(e.response?.data?.message || '密码修改失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: mintTheme.gradients.soft,
      minHeight: 'calc(100vh - 64px)',
      padding: 24
    }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{
          fontSize: 28,
          fontWeight: 'bold',
          color: mintTheme.primary[800],
          marginBottom: 24
        }}>
          <UserOutlined /> 个人中心
        </h1>

        {/* 基本信息 */}
        <Card
          title="基本信息"
          style={{
            ...mintTheme.glass,
            borderRadius: mintTheme.borderRadius.xl,
            border: `1px solid ${mintTheme.primary[200]}`,
            marginBottom: 16
          }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Avatar
                size={80}
                style={{
                  background: mintTheme.gradients.primary,
                  fontSize: 32,
                  boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                }}
              >
                {user?.realName?.charAt(0) || user?.username?.charAt(0) || 'A'}
              </Avatar>
              <div>
                <div style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: mintTheme.primary[800],
                  marginBottom: 4
                }}>
                  {user?.realName || user?.username}
                </div>
                <div style={{
                  fontSize: 14,
                  color: mintTheme.primary[600]
                }}>
                  {user?.role === 'admin' ? '系统管理员' : '店员'}
                </div>
              </div>
            </div>

            <Divider style={{ margin: 0 }} />

            <div>
              <div style={{ marginBottom: 12 }}>
                <span style={{ color: '#6b7280', width: 100, display: 'inline-block' }}>用户名:</span>
                <span style={{ color: mintTheme.primary[800], fontWeight: 500 }}>{user?.username}</span>
              </div>
              <div style={{ marginBottom: 12 }}>
                <span style={{ color: '#6b7280', width: 100, display: 'inline-block' }}>姓名:</span>
                <span style={{ color: mintTheme.primary[800], fontWeight: 500 }}>{user?.realName || '-'}</span>
              </div>
              <div>
                <span style={{ color: '#6b7280', width: 100, display: 'inline-block' }}>角色:</span>
                <span style={{ color: mintTheme.primary[800], fontWeight: 500 }}>
                  {user?.role === 'admin' ? '管理员' : '店员'}
                </span>
              </div>
            </div>
          </Space>
        </Card>

        {/* 修改密码 */}
        <Card
          title={<><LockOutlined /> 修改密码</>}
          style={{
            ...mintTheme.glass,
            borderRadius: mintTheme.borderRadius.xl,
            border: `1px solid ${mintTheme.primary[200]}`
          }}
        >
          <Form
            form={form}
            layout="vertical"
            style={{ maxWidth: 500 }}
          >
            <Form.Item
              name="oldPassword"
              label="当前密码"
              rules={[{ required: true, message: '请输入当前密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入当前密码"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="新密码"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 6, message: '密码至少6位' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入新密码(至少6位)"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="确认新密码"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: '请确认新密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'))
                  }
                })
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请再次输入新密码"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                size="large"
                icon={<SaveOutlined />}
                loading={loading}
                onClick={handleChangePassword}
                style={{
                  background: mintTheme.gradients.primary,
                  border: 'none',
                  borderRadius: mintTheme.borderRadius.lg,
                  fontWeight: 600
                }}
              >
                修改密码
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  )
}
