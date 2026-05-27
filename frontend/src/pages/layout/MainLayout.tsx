import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
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
  WarningOutlined
} from '@ant-design/icons'
import { useAuthStore } from '../../stores/authStore'

const { Header, Sider, Content } = Layout

export default function MainLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: '首页' },
    { key: '/pos', icon: <ShoppingCartOutlined />, label: '收银台' },
    { key: '/products', icon: <ShoppingOutlined />, label: '商品管理' },
    { key: '/inventory', icon: <InboxOutlined />, label: '库存管理' },
    { key: '/orders', icon: <FileTextOutlined />, label: '订单管理' },
    { key: '/members', icon: <TeamOutlined />, label: '会员管理' },
    { key: '/categories', icon: <AppstoreOutlined />, label: '分类管理' },
    { key: '/system/users', icon: <SettingOutlined />, label: '系统管理' },
  ]

  const userMenu = [
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
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        theme="dark"
        style={{ background: '#001529' }}
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#fff',
          fontSize: collapsed ? 14 : 18,
          fontWeight: 'bold',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          {collapsed ? '薄荷' : '薄荷集市'}
        </div>
        <Menu 
          theme="dark" 
          mode="inline" 
          items={menuItems}
          onClick={handleMenuClick}
          selectedKeys={[location.pathname]}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)'
        }}>
          <Dropdown menu={{ items: userMenu, onClick: handleUserMenuClick }}>
            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <Avatar style={{ backgroundColor: '#1890ff' }}>
                {user?.realName?.charAt(0) || user?.username?.charAt(0) || 'A'}
              </Avatar>
              <span style={{ marginLeft: 8 }}>{user?.realName || user?.username}</span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', borderRadius: 8 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}