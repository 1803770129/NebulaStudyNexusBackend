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
    label: '首页',
  },
  {
    key: '/questions',
    icon: <FileTextOutlined />,
    label: '题目',
  },
  {
    key: '/knowledge-points',
    icon: <BookOutlined />,
    label: '知识点',
  },
  {
    key: '/categories',
    icon: <FolderOutlined />,
    label: '分类',
  },
  {
    key: '/tags',
    icon: <TagsOutlined />,
    label: '标签',
  },
  {
    key: '/students',
    icon: <TeamOutlined />,
    label: '学生',
  },
  {
    key: '/users',
    icon: <UserOutlined />,
    label: '用户与角色',
  },
  {
    key: '/practice-sessions',
    icon: <ScheduleOutlined />,
    label: '练习会话',
  },
  {
    key: '/grading-tasks',
    icon: <CheckSquareOutlined />,
    label: '人工批改',
  },
  {
    key: '/review-tasks',
    icon: <CalendarOutlined />,
    label: '复习任务',
  },
  {
    key: '/exam-papers',
    icon: <FileDoneOutlined />,
    label: '试卷',
  },
  {
    key: '/exam-attempts',
    icon: <FileSearchOutlined />,
    label: '考试作答',
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
      label: '个人中心',
      onClick: () => navigate('/profile'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
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
          {sidebarCollapsed ? '题管' : '题目管理系统'}
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
            <span style={{ marginLeft: 16, fontSize: 16, fontWeight: 500 }}>题目管理系统</span>
          </div>

          <Space size="middle">
            <Button
              type="text"
              icon={isDark ? <SunOutlined /> : <MoonOutlined />}
              onClick={toggleTheme}
              aria-label={isDark ? '切换为浅色模式' : '切换为深色模式'}
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
