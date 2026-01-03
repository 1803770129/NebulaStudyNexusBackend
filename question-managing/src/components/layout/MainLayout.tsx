/**
 * 主布局组件
 * 
 * 包含侧边栏导航和内容区域
 * 支持响应式布局和侧边栏折叠
 */

import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Button, theme } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FileTextOutlined,
  FolderOutlined,
  TagsOutlined,
  HomeOutlined,
} from '@ant-design/icons'
import { useUIStore } from '@/stores'

const { Header, Sider, Content } = Layout

/**
 * 菜单项配置
 */
const menuItems = [
  {
    key: '/',
    icon: <HomeOutlined />,
    label: '首页',
  },
  {
    key: '/questions',
    icon: <FileTextOutlined />,
    label: '题目管理',
  },
  {
    key: '/categories',
    icon: <FolderOutlined />,
    label: '分类管理',
  },
  {
    key: '/tags',
    icon: <TagsOutlined />,
    label: '标签管理',
  },
]

/**
 * MainLayout 组件
 * 
 * 应用的主布局，包含：
 * - 可折叠的侧边栏导航
 * - 顶部标题栏
 * - 内容区域（通过 Outlet 渲染子路由）
 */
export function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  // 处理菜单点击
  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 侧边栏 */}
      <Sider
        trigger={null}
        collapsible
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
        {/* Logo */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: sidebarCollapsed ? 16 : 18,
            fontWeight: 'bold',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {sidebarCollapsed ? '题库' : '题目管理系统'}
        </div>

        {/* 导航菜单 */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>

      {/* 主内容区 */}
      <Layout
        style={{
          marginLeft: sidebarCollapsed ? 80 : 200,
          transition: 'margin-left 0.2s',
        }}
      >
        {/* 顶部栏 */}
        <Header
          style={{
            padding: '0 16px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 1,
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          }}
        >
          <Button
            type="text"
            icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleSidebar}
            style={{ fontSize: 16, width: 64, height: 64 }}
          />
          <span style={{ marginLeft: 16, fontSize: 16, fontWeight: 500 }}>
            题目后台管理系统
          </span>
        </Header>

        {/* 内容区 */}
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
