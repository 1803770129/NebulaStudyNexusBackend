import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Button, theme, Dropdown, Avatar, Space } from 'antd'
import type { MenuProps } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FileTextOutlined,
  FolderOutlined,
  TagsOutlined,
  HomeOutlined,
  UserOutlined,
  LogoutOutlined,
  BookOutlined,
  TeamOutlined,
  SettingOutlined,
  MoonOutlined,
  SunOutlined,
  ScheduleOutlined,
  CheckSquareOutlined,
  CalendarOutlined,
  FileDoneOutlined,
  FileSearchOutlined,
} from '@ant-design/icons'
import { useUIStore } from '@/stores'
import { useAuth } from '@/hooks/useAuth'

const { Header, Sider, Content } = Layout

const menuItems = [
  {
    key: '/',
    icon: <HomeOutlined />,
    label: 'Home',
  },
  {
    key: '/questions',
    icon: <FileTextOutlined />,
    label: 'Questions',
  },
  {
    key: '/knowledge-points',
    icon: <BookOutlined />,
    label: 'Knowledge Points',
  },
  {
    key: '/categories',
    icon: <FolderOutlined />,
    label: 'Categories',
  },
  {
    key: '/tags',
    icon: <TagsOutlined />,
    label: 'Tags',
  },
  {
    key: '/students',
    icon: <TeamOutlined />,
    label: 'Students',
  },
  {
    key: '/users',
    icon: <UserOutlined />,
    label: 'User & Role',
  },
  {
    key: '/practice-sessions',
    icon: <ScheduleOutlined />,
    label: 'Practice Sessions',
  },
  {
    key: '/grading-tasks',
    icon: <CheckSquareOutlined />,
    label: 'Manual Grading',
  },
  {
    key: '/review-tasks',
    icon: <CalendarOutlined />,
    label: 'Review Tasks',
  },
  {
    key: '/exam-papers',
    icon: <FileDoneOutlined />,
    label: 'Exam Papers',
  },
  {
    key: '/exam-attempts',
    icon: <FileSearchOutlined />,
    label: 'Exam Attempts',
  },
]

export function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { sidebarCollapsed, toggleSidebar, currentTheme, toggleTheme } = useUIStore()
  const { user, logout } = useAuth()
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()
  const isDark = currentTheme === 'dark'

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <SettingOutlined />,
      label: 'Profile',
      onClick: () => navigate('/profile'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        theme={isDark ? 'dark' : 'light'}
        collapsed={sidebarCollapsed}
        breakpoint="lg"
        onBreakpoint={(broken) => {
          if (broken) {
            useUIStore.getState().setSidebarCollapsed(true)
          }
        }}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isDark ? '#fff' : 'rgba(0, 0, 0, 0.88)',
            fontSize: sidebarCollapsed ? 16 : 18,
            fontWeight: 'bold',
            borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(5,5,5,0.06)',
          }}
        >
          {sidebarCollapsed ? 'QB' : 'Question Manager'}
        </div>

        <Menu
          theme={isDark ? 'dark' : 'light'}
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>

      <Layout
        style={{
          marginLeft: sidebarCollapsed ? 80 : 200,
          transition: 'margin-left 0.2s',
        }}
      >
        <Header
          style={{
            padding: '0 16px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 1,
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={toggleSidebar}
              style={{ fontSize: 16, width: 64, height: 64 }}
            />
            <span style={{ marginLeft: 16, fontSize: 16, fontWeight: 500 }}>Question Manager</span>
          </div>

          <Space size="middle">
            <Button
              type="text"
              icon={isDark ? <SunOutlined /> : <MoonOutlined />}
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            />
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <span>{user?.username}</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
