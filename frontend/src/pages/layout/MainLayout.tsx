import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Badge } from 'antd'
import {
  DashboardOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  InboxOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  GiftOutlined,
  FileTextOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import { useAuthStore } from '../../stores/authStore'
import { mintTheme } from '../../theme/colors'

const { Header, Sider, Content } = Layout

export default function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)
  const [currentTime, setCurrentTime] = useState('')

  // 更新时间
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }))
    }

    updateTime() // 立即更新一次
    const timer = setInterval(updateTime, 1000) // 每秒更新

    return () => clearInterval(timer) // 清理定时器
  }, [])

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: '经营大屏' },
    { key: '/pos', icon: <ShoppingCartOutlined />, label: 'POS收银' },
    { key: '/products', icon: <ShoppingOutlined />, label: '商品管理' },
    { key: '/inventory', icon: <InboxOutlined />, label: '库存管理' },
    { key: '/orders', icon: <FileTextOutlined />, label: '订单管理' },
    { key: '/members', icon: <TeamOutlined />, label: '会员管理' },
    { key: '/categories', icon: <AppstoreOutlined />, label: '分类管理' },
    { key: '/system/users', icon: <SettingOutlined />, label: '系统管理' },
  ]

  const userMenu = [
    { key: 'profile', icon: <UserOutlined />, label: '个人中心' },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录' }
  ]

  const handleMenuClick = (e: any) => {
    navigate(e.key)
  }

  const handleUserMenuClick = (e: any) => {
    if (e.key === 'logout') {
      logout()
      navigate('/login')
    }
  }

  return (
    <Layout style={{ minHeight: '100vh', background: mintTheme.primary[50] }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          background: '#ffffff',
          boxShadow: '2px 0 8px rgba(0,0,0,0.05)'
        }}
      >
        {/* Logo */}
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: collapsed ? 0 : 12,
          borderBottom: `1px solid ${mintTheme.primary[100]}`,
          padding: collapsed ? '0 16px' : '0 20px'
        }}>
          <div style={{
            width: collapsed ? 32 : 40,
            height: collapsed ? 32 : 40,
            background: mintTheme.gradients.primary,
            borderRadius: mintTheme.borderRadius.lg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
            fontSize: collapsed ? 16 : 20
          }}>
            🌿
          </div>
          {!collapsed && (
            <div style={{ textAlign: 'left' }}>
              <div style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: mintTheme.primary[800],
                lineHeight: 1.2
              }}>薄荷集市</div>
              <div style={{
                fontSize: 12,
                color: mintTheme.primary[600]
              }}>店铺管理</div>
            </div>
          )}
        </div>

        {/* Menu */}
        <Menu
          mode="inline"
          items={menuItems}
          onClick={handleMenuClick}
          selectedKeys={[location.pathname]}
          style={{
            border: 'none',
            background: 'transparent'
          }}
        />
      </Sider>

      <Layout>
        {/* Header */}
        <Header style={{
          background: '#ffffff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          borderBottom: `1px solid ${mintTheme.primary[100]}`
        }}>
          {/* Time */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: mintTheme.primary[600],
            fontSize: 14,
            fontFamily: 'monospace'
          }}>
            <ClockCircleOutlined />
            <span>{currentTime}</span>
          </div>

          {/* User Menu */}
          <Dropdown menu={{ items: userMenu, onClick: handleUserMenuClick }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
              padding: '8px 16px',
              borderRadius: mintTheme.borderRadius.lg,
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = mintTheme.primary[50]
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
            >
              <Avatar
                style={{
                  background: mintTheme.gradients.primary,
                  boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)'
                }}
              >
                {user?.realName?.charAt(0) || user?.username?.charAt(0) || 'A'}
              </Avatar>
              <div style={{ textAlign: 'left' }}>
                <div style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: mintTheme.primary[800]
                }}>
                  {user?.realName || user?.username}
                </div>
                <div style={{
                  fontSize: 12,
                  color: mintTheme.primary[600]
                }}>
                  {user?.role === 'admin' ? '管理员' : '店员'}
                </div>
              </div>
            </div>
          </Dropdown>
        </Header>

        {/* Content */}
        <Content style={{
          margin: 0,
          padding: 0,
          background: 'transparent',
          overflow: 'auto'
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}