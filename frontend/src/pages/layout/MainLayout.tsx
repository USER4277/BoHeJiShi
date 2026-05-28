import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Badge, Button, Tooltip } from 'antd'
import {
  DashboardOutlined,
  ShoppingOutlined,
  DatabaseOutlined,
  InboxOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  GiftOutlined,
  FileTextOutlined,
  FundOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  ClockCircleOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  AccountBookOutlined
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
  const [isFullscreen, setIsFullscreen] = useState(false)

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

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  // 切换全屏
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (err) {
      console.error('全屏切换失败:', err)
    }
  }

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '经营大屏',
      style: {
        backgroundColor: '#fef3c7',
        margin: '0',
        borderRadius: '0',
        fontWeight: 600,
        height: '56px',
        lineHeight: '56px',
        padding: '0 20px'
      }
    },
    {
      key: '/pos',
      icon: <ShoppingCartOutlined />,
      label: 'POS收银',
      style: {
        backgroundColor: '#dbeafe',
        margin: '0',
        borderRadius: '0',
        fontWeight: 600,
        height: '56px',
        lineHeight: '56px',
        padding: '0 20px'
      }
    },
    {
      key: '/products',
      icon: <ShoppingOutlined />,
      label: '商品管理',
      style: {
        backgroundColor: '#fce7f3',
        margin: '0',
        borderRadius: '0',
        fontWeight: 600,
        height: '56px',
        lineHeight: '56px',
        padding: '0 20px'
      }
    },
    {
      key: '/masterdata',
      icon: <DatabaseOutlined />,
      label: '主数据管理',
      style: {
        backgroundColor: '#e0e7ff',
        margin: '0',
        borderRadius: '0',
        fontWeight: 600,
        height: '56px',
        lineHeight: '56px',
        padding: '0 20px'
      }
    },
    {
      key: '/inventory',
      icon: <InboxOutlined />,
      label: '库存管理',
      style: {
        backgroundColor: '#dcfce7',
        margin: '0',
        borderRadius: '0',
        fontWeight: 600,
        height: '56px',
        lineHeight: '56px',
        padding: '0 20px'
      }
    },
    {
      key: '/orders',
      icon: <FileTextOutlined />,
      label: '订单管理',
      style: {
        backgroundColor: '#fef9c3',
        margin: '0',
        borderRadius: '0',
        fontWeight: 600,
        height: '56px',
        lineHeight: '56px',
        padding: '0 20px'
      }
    },
    {
      key: '/members',
      icon: <TeamOutlined />,
      label: '会员管理',
      style: {
        backgroundColor: '#fed7aa',
        margin: '0',
        borderRadius: '0',
        fontWeight: 600,
        height: '56px',
        lineHeight: '56px',
        padding: '0 20px'
      }
    },
    {
      key: '/financial',
      icon: <FundOutlined />,
      label: '财务报表',
      style: {
        backgroundColor: '#d9f99d',
        margin: '0',
        borderRadius: '0',
        fontWeight: 600,
        height: '56px',
        lineHeight: '56px',
        padding: '0 20px'
      }
    },
    {
      key: '/manual-account',
      icon: <AccountBookOutlined />,
      label: '手工账',
      style: {
        backgroundColor: '#fde68a',
        margin: '0',
        borderRadius: '0',
        fontWeight: 600,
        height: '56px',
        lineHeight: '56px',
        padding: '0 20px'
      }
    },
    {
      key: '/system/users',
      icon: <SettingOutlined />,
      label: '系统管理',
      style: {
        backgroundColor: '#e5e7eb',
        margin: '0',
        borderRadius: '0',
        fontWeight: 600,
        height: '56px',
        lineHeight: '56px',
        padding: '0 20px'
      }
    },
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
    } else if (e.key === 'profile') {
      navigate('/profile')
    }
  }

  return (
    <Layout style={{ minHeight: '100vh', background: mintTheme.gradients.background }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={250}
        collapsedWidth={80}
        style={{
          background: '#ffffff',
          boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          overflow: 'auto',
          zIndex: 100
        }}
      >
        {/* Logo */}
        <div style={{
          height: 128,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: collapsed ? 0 : 16,
          borderBottom: `1px solid ${mintTheme.primary[100]}`,
          padding: collapsed ? '0 16px' : '0 24px'
        }}>
          <div style={{
            width: collapsed ? 48 : 60,
            height: collapsed ? 48 : 60,
            background: mintTheme.gradients.primary,
            borderRadius: mintTheme.borderRadius.lg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
            fontSize: collapsed ? 24 : 32
          }}>
            🌿
          </div>
          {!collapsed && (
            <div style={{ textAlign: 'left' }}>
              <div style={{
                fontSize: 36,
                fontWeight: 'bold',
                color: mintTheme.primary[800],
                lineHeight: 1.2
              }}>薄荷集市</div>
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
            background: 'transparent',
            padding: '0',
            fontSize: '15px'
          }}
          theme="light"
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'margin-left 0.2s' }}>
        {/* Header */}
        <Header style={{
          background: '#ffffff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          borderBottom: `1px solid ${mintTheme.primary[100]}`,
          height: 64,
          gap: 16,
          position: 'sticky',
          top: 0,
          zIndex: 99
        }}>
          {/* Time */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: mintTheme.primary[600],
            fontSize: 14,
            fontFamily: 'monospace',
            flex: '0 1 auto',
            minWidth: 0
          }}>
            <ClockCircleOutlined />
            <span style={{ whiteSpace: 'nowrap' }}>{currentTime}</span>
          </div>

          {/* Right side: Fullscreen + User Menu */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flex: '0 0 auto',
            minWidth: 0
          }}>
            {/* Fullscreen Toggle */}
            <Tooltip title={isFullscreen ? '退出全屏' : '进入全屏'}>
              <Button
                type="text"
                icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                onClick={toggleFullscreen}
                style={{
                  fontSize: 16,
                  color: mintTheme.primary[600],
                  padding: '4px 8px',
                  height: 32,
                  width: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              />
            </Tooltip>

            {/* User Menu */}
            <Dropdown menu={{ items: userMenu, onClick: handleUserMenuClick }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                padding: '6px 12px',
                borderRadius: mintTheme.borderRadius.lg,
                transition: 'all 0.3s ease',
                flex: '0 0 auto',
                minWidth: 0,
                maxWidth: 200
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = mintTheme.primary[50]
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
              >
                <Avatar
                  size={32}
                  style={{
                    background: mintTheme.gradients.primary,
                    boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)',
                    flexShrink: 0
                  }}
                >
                  {user?.realName?.charAt(0) || user?.username?.charAt(0) || 'A'}
                </Avatar>
                <div style={{
                  textAlign: 'left',
                  minWidth: 0,
                  flex: '1 1 auto',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: mintTheme.primary[800],
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    lineHeight: '18px'
                  }}>
                    {user?.realName || user?.username}
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: mintTheme.primary[600],
                    whiteSpace: 'nowrap',
                    lineHeight: '16px'
                  }}>
                    {user?.role === 'admin' ? '管理员' : '店员'}
                  </div>
                </div>
              </div>
            </Dropdown>
          </div>
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