# 前端登录认证学习指南

本文档详细介绍前端登录认证的完整实现，包括原理、代码结构和数据流。

---

## 一、认证流程概览

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           用户访问应用                                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         AuthGuard 路由守卫                               │
│                                                                         │
│   检查 localStorage 中是否有 access_token                                │
│                                                                         │
│   ┌─────────────┐                              ┌─────────────────────┐  │
│   │  有 Token   │ ────────────────────────────▶│   允许访问页面       │  │
│   └─────────────┘                              └─────────────────────┘  │
│                                                                         │
│   ┌─────────────┐                              ┌─────────────────────┐  │
│   │  无 Token   │ ────────────────────────────▶│   跳转到登录页       │  │
│   └─────────────┘                              └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 二、JWT 认证原理

### 2.1 什么是 JWT

JWT (JSON Web Token) 是一种用于身份认证的令牌格式，由三部分组成：

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4ifQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
│                                    │                                      │
└────────── Header ──────────────────┴────────── Payload ──────────────────┴────────── Signature ──────────────────┘
```

- **Header**: 算法和类型信息
- **Payload**: 用户数据（用户ID、用户名、过期时间等）
- **Signature**: 签名，防止篡改

### 2.2 双 Token 机制

| Token 类型 | 有效期 | 用途 |
|-----------|--------|------|
| Access Token | 1小时 | 访问 API 时携带，验证身份 |
| Refresh Token | 7天 | Access Token 过期后，用于获取新的 Access Token |

**为什么需要两个 Token？**

- Access Token 有效期短，即使泄露影响也有限
- Refresh Token 有效期长，但只用于刷新，不直接访问 API
- 用户无需频繁登录，体验更好

### 2.3 认证流程时序图

```
┌──────┐          ┌──────────┐          ┌──────────┐
│ 用户 │          │   前端   │          │   后端   │
└──┬───┘          └────┬─────┘          └────┬─────┘
   │                   │                     │
   │  1. 输入账号密码   │                     │
   │──────────────────▶│                     │
   │                   │                     │
   │                   │  2. POST /auth/login │
   │                   │────────────────────▶│
   │                   │                     │
   │                   │  3. 返回 Token       │
   │                   │◀────────────────────│
   │                   │                     │
   │                   │  4. 存储到 localStorage
   │                   │─────────┐           │
   │                   │         │           │
   │                   │◀────────┘           │
   │                   │                     │
   │  5. 跳转到首页    │                     │
   │◀──────────────────│                     │
   │                   │                     │
   │  6. 访问其他页面   │                     │
   │──────────────────▶│                     │
   │                   │                     │
   │                   │  7. 请求带 Token     │
   │                   │────────────────────▶│
   │                   │  Authorization:      │
   │                   │  Bearer xxx          │
   │                   │                     │
   │                   │  8. 验证 Token 返回数据
   │                   │◀────────────────────│
   │                   │                     │
```

---

## 三、代码结构

```
src/
├── lib/
│   └── apiClient.ts        # API 客户端，处理请求和 Token
├── services/
│   └── authService.ts      # 认证服务，封装登录/注册/登出
├── hooks/
│   └── useAuth.ts          # 认证 Hook，提供状态和方法
├── components/
│   └── AuthGuard/
│       └── index.tsx       # 路由守卫组件
├── pages/
│   └── Login/
│       ├── index.tsx       # 登录页面
│       └── index.css       # 登录页样式
└── router/
    └── index.tsx           # 路由配置
```

---

## 四、核心代码详解

### 4.1 API 客户端 (apiClient.ts)

API 客户端是认证系统的核心，负责：
1. 自动在请求头添加 Token
2. Token 过期时自动刷新
3. 统一错误处理

```typescript
// Token 存储键名
export const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

// 请求拦截器：自动添加 Token
this.axiosInstance.interceptors.request.use(
  (config) => {
    const token = this.getAccessToken();
    if (token && config.headers) {
      // 在请求头添加 Authorization
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);

// 响应拦截器：处理 401 错误，自动刷新 Token
this.axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 尝试刷新 Token
      const newToken = await this.refreshAccessToken();
      if (newToken) {
        // 刷新成功，重试原请求
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return this.axiosInstance(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);
```

**关键点**：
- 使用 Axios 拦截器实现自动添加 Token
- 401 错误时自动尝试刷新 Token
- 刷新失败则清除 Token，用户需要重新登录

### 4.2 认证服务 (authService.ts)

封装与后端认证相关的 API 调用：

```typescript
/**
 * 用户登录
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  const api = getApiClient();
  
  // 调用登录接口
  const response = await api.post<AuthResponse>('/auth/login', data);
  
  // 存储 Token 到 localStorage
  api.setTokens(response.accessToken, response.refreshToken);
  
  return response;
}

/**
 * 用户登出
 */
export function logout(): void {
  const api = getApiClient();
  // 清除本地存储的 Token
  api.clearTokens();
}

/**
 * 检查是否已认证
 */
export function isAuthenticated(): boolean {
  const api = getApiClient();
  return api.getAccessToken() !== null;
}
```

### 4.3 认证 Hook (useAuth.ts)

使用 React Query 管理认证状态：

```typescript
export function useAuth() {
  const queryClient = useQueryClient();
  
  // 本地认证状态
  const [isAuthenticated, setIsAuthenticated] = useState(() => checkAuth());

  // 查询用户信息
  const profileQuery = useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: getProfile,
    enabled: isAuthenticated, // 只有已认证时才查询
  });

  // 登录 Mutation
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => loginApi(data),
    onSuccess: (response) => {
      setIsAuthenticated(true);
      // 缓存用户信息
      queryClient.setQueryData(['auth', 'profile'], {
        sub: response.user.id,
        username: response.user.username,
      });
    },
  });

  // 登出
  const logout = useCallback(() => {
    logoutApi();
    setIsAuthenticated(false);
    queryClient.clear(); // 清除所有缓存
  }, [queryClient]);

  return {
    isAuthenticated,
    user: profileQuery.data,
    login: loginMutation.mutateAsync,
    logout,
    // ...
  };
}
```

**关键点**：
- 使用 `useState` 管理本地认证状态
- 使用 React Query 的 `useQuery` 获取用户信息
- 使用 `useMutation` 处理登录/注册
- 登出时清除所有缓存

### 4.4 路由守卫 (AuthGuard)

保护需要登录才能访问的页面：

```typescript
export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoadingUser } = useAuth();
  const location = useLocation();

  // 正在加载用户信息，显示 Loading
  if (isLoadingUser) {
    return <Spin size="large" />;
  }

  // 未登录，跳转到登录页
  if (!isAuthenticated) {
    // state 保存当前路径，登录后可以跳回
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 已登录，渲染子组件
  return <>{children}</>;
}
```

### 4.5 路由配置

```typescript
export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,  // 登录页不需要守卫
  },
  {
    path: '/',
    element: (
      <AuthGuard>           // 其他页面需要守卫
        <MainLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: 'questions', element: <QuestionListPage /> },
      // ...
    ],
  },
]);
```

### 4.6 登录页面

```typescript
export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoggingIn } = useAuth();

  const handleLogin = async (values: LoginRequest) => {
    try {
      await login(values);
      message.success('登录成功');
      navigate('/');  // 跳转到首页
    } catch (error: any) {
      message.error(error.message || '登录失败');
    }
  };

  return (
    <Form onFinish={handleLogin}>
      <Form.Item name="username" rules={[{ required: true }]}>
        <Input placeholder="用户名" />
      </Form.Item>
      <Form.Item name="password" rules={[{ required: true }]}>
        <Input.Password placeholder="密码" />
      </Form.Item>
      <Button type="primary" htmlType="submit" loading={isLoggingIn}>
        登录
      </Button>
    </Form>
  );
}
```

---

## 五、数据流详解

### 5.1 登录流程

```
用户点击登录
      │
      ▼
LoginPage.handleLogin()
      │
      ▼
useAuth().login()
      │
      ▼
loginMutation.mutateAsync()
      │
      ▼
authService.login()
      │
      ▼
apiClient.post('/auth/login')
      │
      ▼
后端验证用户名密码
      │
      ▼
返回 { accessToken, refreshToken, user }
      │
      ▼
apiClient.setTokens() ──────▶ localStorage.setItem('access_token', token)
      │
      ▼
loginMutation.onSuccess()
      │
      ├──▶ setIsAuthenticated(true)
      │
      └──▶ queryClient.setQueryData() ──▶ 缓存用户信息
      │
      ▼
navigate('/') ──▶ 跳转到首页
```

### 5.2 Token 存储位置

```
localStorage
├── access_token: "eyJhbGciOiJIUzI1NiIs..."   # 访问令牌
└── refresh_token: "eyJhbGciOiJIUzI1NiIs..."  # 刷新令牌
```

### 5.3 请求携带 Token

每次 API 请求都会自动添加 Token：

```
GET /api/questions HTTP/1.1
Host: 172.20.10.2:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

### 5.4 Token 刷新流程

```
请求 API
    │
    ▼
后端返回 401 Unauthorized
    │
    ▼
响应拦截器捕获错误
    │
    ▼
检查是否有 refresh_token
    │
    ├── 有 ──▶ POST /auth/refresh { refreshToken }
    │              │
    │              ▼
    │         返回新的 accessToken
    │              │
    │              ▼
    │         更新 localStorage
    │              │
    │              ▼
    │         重试原请求
    │
    └── 无 ──▶ 清除 Token，跳转登录页
```

---

## 六、环境配置

### 6.1 配置 API 地址

修改 `.env` 文件：

```bash
# 开发环境（本地后端）
VITE_API_BASE_URL=http://localhost:3000/api

# 连接服务器
VITE_API_BASE_URL=http://172.20.10.2:3000/api
```

### 6.2 Vite 环境变量

Vite 中使用 `import.meta.env` 访问环境变量：

```typescript
// apiClient.ts
const DEFAULT_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
```

**注意**：Vite 环境变量必须以 `VITE_` 开头才能在客户端代码中访问。

---

## 七、安全注意事项

### 7.1 Token 存储

| 存储方式 | 优点 | 缺点 |
|---------|------|------|
| localStorage | 简单，持久化 | 容易被 XSS 攻击读取 |
| sessionStorage | 关闭浏览器自动清除 | 新标签页不共享 |
| HttpOnly Cookie | 防 XSS | 需要后端配合，CSRF 风险 |
| 内存 | 最安全 | 刷新页面丢失 |

本项目使用 localStorage，适合学习和内部系统。生产环境建议使用 HttpOnly Cookie。

### 7.2 XSS 防护

- 不要在页面上直接渲染用户输入的 HTML
- 使用 React 的 JSX 自动转义
- 避免使用 `dangerouslySetInnerHTML`

### 7.3 HTTPS

生产环境必须使用 HTTPS，防止 Token 在传输过程中被窃取。

---

## 八、常见问题

### Q1: 登录后刷新页面，为什么还是登录状态？

因为 Token 存储在 localStorage 中，刷新页面后：
1. `useAuth` 初始化时调用 `checkAuth()` 检查 localStorage
2. 发现有 Token，设置 `isAuthenticated = true`
3. 触发 `profileQuery` 获取用户信息

### Q2: Token 过期后会发生什么？

1. 请求 API 返回 401
2. 响应拦截器捕获错误
3. 使用 Refresh Token 获取新的 Access Token
4. 如果 Refresh Token 也过期，清除 Token，跳转登录页

### Q3: 如何实现"记住我"功能？

- 勾选"记住我"：Token 存 localStorage（持久化）
- 不勾选：Token 存 sessionStorage（关闭浏览器清除）

### Q4: 多标签页如何同步登录状态？

监听 `storage` 事件：

```typescript
window.addEventListener('storage', (e) => {
  if (e.key === 'access_token' && !e.newValue) {
    // Token 被清除，跳转登录页
    logout();
  }
});
```

---

## 九、扩展阅读

- [JWT 官方文档](https://jwt.io/)
- [React Query 文档](https://tanstack.com/query/latest)
- [Axios 拦截器](https://axios-http.com/docs/interceptors)
- [React Router 认证](https://reactrouter.com/en/main/start/tutorial#authentication)
