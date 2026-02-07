# 认证功能教程

## 概述

前端认证功能包括：
- 登录/注册页面
- Token 管理（存储、刷新）
- 路由守卫（AuthGuard）
- 认证状态 Hook

## 文件结构

```
src/
├── components/
│   └── AuthGuard/
│       └── index.tsx       # 路由守卫组件
├── hooks/
│   └── useAuth.ts          # 认证状态 Hook
├── pages/
│   └── Login/
│       ├── index.tsx       # 登录页面
│       └── index.css       # 样式
└── services/
    └── authService.ts      # 认证 API
```

## 登录页面

```typescript
// pages/Login/index.tsx
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, Card, Tabs, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { login, register } from '@/services/authService';
import './index.css';

export function LoginPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 登录后跳转的目标页面
  const from = (location.state as any)?.from?.pathname || '/';

  const handleLogin = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      message.success('登录成功');
      navigate(from, { replace: true });
    } catch (error) {
      message.error('登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: { 
    username: string; 
    email: string; 
    password: string 
  }) => {
    setLoading(true);
    try {
      await register(values.username, values.email, values.password);
      message.success('注册成功');
      navigate(from, { replace: true });
    } catch (error) {
      message.error('注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <h1 className="login-title">题目管理系统</h1>
        <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key as any)}>
          <Tabs.TabPane tab="登录" key="login">
            <Form onFinish={handleLogin}>
              <Form.Item name="username" rules={[{ required: true }]}>
                <Input prefix={<UserOutlined />} placeholder="用户名" />
              </Form.Item>
              <Form.Item name="password" rules={[{ required: true }]}>
                <Input.Password prefix={<LockOutlined />} placeholder="密码" />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                登录
              </Button>
            </Form>
          </Tabs.TabPane>
          <Tabs.TabPane tab="注册" key="register">
            {/* 注册表单 */}
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </div>
  );
}
```

## 路由守卫

```typescript
// components/AuthGuard/index.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 加载中显示 Loading
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" tip="加载中...">
          <div style={{ padding: 50 }} />
        </Spin>
      </div>
    );
  }

  // 未登录，跳转到登录页（保存当前路径）
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
```

## 认证 Hook

```typescript
// hooks/useAuth.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getProfile, logout as logoutApi } from '@/services/authService';
import { getAccessToken, clearTokens } from '@/lib/apiClient';

export function useAuth() {
  const queryClient = useQueryClient();

  // 查询用户信息
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: getProfile,
    enabled: !!getAccessToken(),  // 有 Token 才查询
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // 登出
  const logout = async () => {
    await logoutApi();
    clearTokens();
    queryClient.clear();  // 清除所有缓存
    window.location.href = '/login';
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !isError,
    logout,
  };
}
```

## 认证服务

```typescript
// services/authService.ts
import { getApiClient, setAccessToken, setRefreshToken, clearTokens } from '@/lib/apiClient';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

export async function login(username: string, password: string): Promise<AuthResponse> {
  const api = getApiClient();
  const response = await api.post<{ data: AuthResponse }>('/auth/login', {
    username,
    password,
  });
  
  // 保存 Token
  setAccessToken(response.data.accessToken);
  setRefreshToken(response.data.refreshToken);
  
  return response.data;
}

export async function register(
  username: string, 
  email: string, 
  password: string
): Promise<AuthResponse> {
  const api = getApiClient();
  const response = await api.post<{ data: AuthResponse }>('/auth/register', {
    username,
    email,
    password,
  });
  
  setAccessToken(response.data.accessToken);
  setRefreshToken(response.data.refreshToken);
  
  return response.data;
}

export async function getProfile(): Promise<User> {
  const api = getApiClient();
  const response = await api.get<{ data: User }>('/auth/profile');
  return response.data;
}

export async function refreshToken(): Promise<AuthResponse> {
  const api = getApiClient();
  const response = await api.post<{ data: AuthResponse }>('/auth/refresh', {
    refreshToken: getRefreshToken(),
  });
  
  setAccessToken(response.data.accessToken);
  setRefreshToken(response.data.refreshToken);
  
  return response.data;
}

export async function logout(): Promise<void> {
  clearTokens();
}
```

## 路由配置

```typescript
// router/index.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthGuard } from '@/components/AuthGuard';
import { MainLayout } from '@/components/layout/MainLayout';
import { LoginPage } from '@/pages/Login';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <MainLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <Navigate to="/questions" replace /> },
      { path: 'questions', element: <QuestionListPage /> },
      // ... 其他路由
    ],
  },
]);
```

## Token 自动刷新

在 API Client 的响应拦截器中实现：

```typescript
axiosInstance.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    
    // 401 且有 refreshToken，尝试刷新
    if (error.response?.status === 401 && getRefreshToken() && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const response = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken: getRefreshToken(),
        });
        
        const { accessToken, refreshToken } = response.data.data;
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        
        // 用新 Token 重试原请求
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch {
        // 刷新失败，清除 Token 并跳转登录
        clearTokens();
        window.location.href = '/login';
      }
    }
    
    throw error;
  }
);
```

## 认证流程图

```
┌─────────────────────────────────────────────────────────────┐
│                        用户访问页面                          │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    AuthGuard 检查                           │
│                                                             │
│  1. 检查 localStorage 是否有 accessToken                    │
│  2. 有 Token → 调用 getProfile() 验证                       │
│  3. 无 Token → 跳转登录页                                   │
└─────────────────────────┬───────────────────────────────────┘
                          │
            ┌─────────────┴─────────────┐
            │                           │
            ▼                           ▼
    ┌───────────────┐           ┌───────────────┐
    │   验证成功     │           │   验证失败     │
    │   显示页面     │           │   跳转登录     │
    └───────────────┘           └───────────────┘
```
