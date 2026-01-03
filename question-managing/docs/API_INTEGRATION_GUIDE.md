# 前端 API 集成学习指南

本文档详细介绍前端如何与后端 API 进行集成，包括架构思想、实现方式和最佳实践。

## 目录

1. [整体架构](#整体架构)
2. [API Client 设计](#api-client-设计)
3. [认证机制](#认证机制)
4. [服务层设计](#服务层设计)
5. [错误处理](#错误处理)
6. [React Hooks 集成](#react-hooks-集成)
7. [最佳实践](#最佳实践)

---

## 整体架构

### 分层架构图

```
┌─────────────────────────────────────────────────────────────┐
│                     React Components                         │
│                    (UI 展示层)                               │
├─────────────────────────────────────────────────────────────┤
│                     React Hooks                              │
│              (状态管理 + 副作用处理)                          │
├─────────────────────────────────────────────────────────────┤
│                    Service Layer                             │
│              (业务逻辑 + 数据转换)                            │
├─────────────────────────────────────────────────────────────┤
│                     API Client                               │
│           (HTTP 请求 + 认证 + 错误处理)                       │
├─────────────────────────────────────────────────────────────┤
│                    Backend API                               │
│                  (NestJS REST API)                           │
└─────────────────────────────────────────────────────────────┘
```

### 各层职责

| 层级 | 职责 | 示例 |
|------|------|------|
| UI 层 | 展示数据、处理用户交互 | `QuestionList.tsx` |
| Hooks 层 | 管理状态、调用服务、处理加载/错误状态 | `useQuestions.ts` |
| Service 层 | 封装 API 调用、数据格式转换 | `questionService.ts` |
| API Client | 统一 HTTP 请求、认证、错误处理 | `apiClient.ts` |

### 为什么要分层？

1. **关注点分离**：每层只关注自己的职责
2. **可测试性**：每层可以独立测试
3. **可维护性**：修改一层不影响其他层
4. **可复用性**：Service 层可以被多个组件复用

---

## API Client 设计

### 设计模式：单例模式

```typescript
class ApiClient {
  // 私有静态实例
  private static instance: ApiClient;
  
  // 私有构造函数，防止外部 new
  private constructor() { }
  
  // 公共静态方法获取实例
  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }
}
```

**为什么使用单例模式？**

1. **Token 状态一致性**：所有请求共享同一个 Token
2. **资源节约**：避免创建多个 Axios 实例
3. **拦截器统一**：所有请求经过相同的拦截器处理

### 核心功能

#### 1. 请求拦截器

```typescript
// 在每个请求发送前执行
this.axiosInstance.interceptors.request.use(
  (config) => {
    // 自动添加 Authorization 头
    const token = this.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);
```

**作用**：
- 自动为每个请求添加认证 Token
- 无需在每个 API 调用处手动添加

#### 2. 响应拦截器

```typescript
// 在每个响应返回后执行
this.axiosInstance.interceptors.response.use(
  (response) => response,  // 成功直接返回
  async (error) => {
    // 401 错误：尝试刷新 Token
    if (error.response?.status === 401) {
      // 刷新 Token 逻辑...
    }
    // 转换为统一错误格式
    return Promise.reject(convertToApiError(error));
  }
);
```

**作用**：
- 统一处理错误响应
- 自动刷新过期的 Token
- 转换错误为统一格式

#### 3. HTTP 方法封装

```typescript
// GET 请求
async get<T>(url: string, params?: object): Promise<T> {
  const response = await this.axiosInstance.get<T>(url, { params });
  return response.data;
}

// POST 请求
async post<T>(url: string, data?: unknown): Promise<T> {
  const response = await this.axiosInstance.post<T>(url, data);
  return response.data;
}

// PATCH 请求
async patch<T>(url: string, data?: unknown): Promise<T> {
  const response = await this.axiosInstance.patch<T>(url, data);
  return response.data;
}

// DELETE 请求
async delete<T>(url: string): Promise<T> {
  const response = await this.axiosInstance.delete<T>(url);
  return response.data;
}
```

**设计要点**：
- 使用泛型 `<T>` 支持类型推断
- 直接返回 `response.data`，简化调用方代码
- 统一的错误处理（在拦截器中）

---

## 认证机制

### JWT 认证流程

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  用户    │     │  前端    │     │  后端    │
└────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │
     │ 1. 输入账号密码 │                │
     │───────────────>│                │
     │                │ 2. POST /login │
     │                │───────────────>│
     │                │                │
     │                │ 3. 返回 Token  │
     │                │<───────────────│
     │                │                │
     │                │ 4. 存储 Token  │
     │                │ (localStorage) │
     │                │                │
     │ 5. 显示登录成功│                │
     │<───────────────│                │
     │                │                │
     │ 6. 请求数据    │                │
     │───────────────>│                │
     │                │ 7. 带 Token 请求│
     │                │───────────────>│
     │                │                │
     │                │ 8. 验证 Token  │
     │                │    返回数据    │
     │                │<───────────────│
     │                │                │
     │ 9. 显示数据    │                │
     │<───────────────│                │
```

### Token 类型

| Token 类型 | 用途 | 有效期 | 存储位置 |
|-----------|------|--------|---------|
| Access Token | 访问 API | 短（如 15 分钟） | localStorage |
| Refresh Token | 刷新 Access Token | 长（如 7 天） | localStorage |

### Token 刷新机制

```typescript
// 当 Access Token 过期时（401 错误）
if (error.response?.status === 401) {
  // 1. 使用 Refresh Token 获取新的 Access Token
  const newToken = await this.refreshAccessToken();
  
  if (newToken) {
    // 2. 更新存储的 Token
    this.setTokens(newToken, newRefreshToken);
    
    // 3. 重试原来的请求
    return this.axiosInstance(originalRequest);
  } else {
    // 4. 刷新失败，清除 Token，跳转登录
    this.clearTokens();
    // 触发登出事件...
  }
}
```

### 并发请求处理

当多个请求同时遇到 401 错误时，需要避免重复刷新 Token：

```typescript
class ApiClient {
  private isRefreshing = false;  // 是否正在刷新
  private refreshSubscribers: Array<(token: string) => void> = [];  // 等待队列

  // 响应拦截器中
  if (error.response?.status === 401) {
    if (this.isRefreshing) {
      // 正在刷新，将请求加入队列
      return new Promise((resolve) => {
        this.refreshSubscribers.push((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(this.axiosInstance(originalRequest));
        });
      });
    }
    
    this.isRefreshing = true;
    // 刷新 Token...
    this.onRefreshed(newToken);  // 通知队列中的请求
    this.isRefreshing = false;
  }
}
```

---

## 服务层设计

### 服务层的职责

1. **封装 API 调用**：隐藏 HTTP 细节
2. **数据格式转换**：后端格式 ↔ 前端格式
3. **业务逻辑**：如数据验证、默认值处理

### 示例：Question Service

```typescript
// 后端返回的数据格式
interface QuestionApiResponse {
  id: string;
  title: string;
  content: { raw: string; rendered: string };  // RichContent
  // ...
}

// 前端使用的数据格式
interface Question {
  id: string;
  title: string;
  content: string | RichContent;
  // ...
}

// 服务层方法
export async function getQuestions(params: QueryParams): Promise<PaginatedResponse<Question>> {
  const api = getApiClient();
  
  // 1. 调用 API
  const response = await api.get<PaginatedApiResponse<QuestionApiResponse>>('/questions', params);
  
  // 2. 转换数据格式
  return {
    data: response.data.map(convertApiResponseToQuestion),
    total: response.meta.total,
    page: response.meta.page,
    pageSize: response.meta.pageSize,
  };
}
```

### 数据转换函数

```typescript
// API 响应 -> 前端类型
function convertApiResponseToQuestion(api: QuestionApiResponse): Question {
  return {
    id: api.id,
    title: api.title,
    content: api.content,  // 保持 RichContent 结构
    type: api.type,
    difficulty: api.difficulty,
    categoryId: api.categoryId,
    tagIds: api.tagIds,
    options: api.options?.map(convertApiOptionToOption),
    answer: api.answer,
    explanation: api.explanation,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
  };
}

// 前端表单值 -> API 请求
function convertFormValuesToRequest(form: QuestionFormValues): CreateQuestionRequest {
  return {
    title: form.title,
    content: form.content,  // 原始 HTML
    type: form.type,
    difficulty: form.difficulty,
    categoryId: form.categoryId,
    tagIds: form.tagIds,
    options: form.options?.map(convertFormOptionToRequest),
    answer: form.answer,
    explanation: form.explanation,
  };
}
```

---

## 错误处理

### 错误类型定义

```typescript
const ErrorType = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',  // 参数验证失败
  NOT_FOUND: 'NOT_FOUND',                // 资源不存在
  DUPLICATE_ERROR: 'DUPLICATE_ERROR',    // 资源冲突
  CONSTRAINT_ERROR: 'CONSTRAINT_ERROR',  // 约束错误
  NETWORK_ERROR: 'NETWORK_ERROR',        // 网络错误
} as const;
```

### HTTP 状态码映射

| HTTP 状态码 | 错误类型 | 用户提示 |
|------------|---------|---------|
| 400 | VALIDATION_ERROR | "请检查输入内容" |
| 401 | NETWORK_ERROR | "请重新登录" |
| 403 | CONSTRAINT_ERROR | "没有权限执行此操作" |
| 404 | NOT_FOUND | "请求的资源不存在" |
| 409 | DUPLICATE_ERROR | "资源已存在" |
| 500 | NETWORK_ERROR | "服务器错误，请稍后重试" |

### 错误处理示例

```typescript
// 在 Hook 中处理错误
function useQuestions() {
  const [error, setError] = useState<AppError | null>(null);
  
  const fetchQuestions = async () => {
    try {
      const data = await getQuestions(filters);
      setQuestions(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err);
        
        // 根据错误类型显示不同提示
        switch (err.type) {
          case ErrorType.NOT_FOUND:
            message.warning('没有找到相关数据');
            break;
          case ErrorType.NETWORK_ERROR:
            message.error('网络错误，请检查连接');
            break;
          default:
            message.error(err.message);
        }
      }
    }
  };
}
```

---

## React Hooks 集成

### Hook 设计模式

```typescript
function useQuestions(initialFilters?: QuestionFilters) {
  // 状态
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });
  
  // 获取数据
  const fetchQuestions = useCallback(async (filters: QuestionFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getQuestions(filters);
      setQuestions(response.data);
      setPagination({
        page: response.page,
        pageSize: response.pageSize,
        total: response.total,
      });
    } catch (err) {
      setError(err as AppError);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // 初始加载
  useEffect(() => {
    fetchQuestions(initialFilters || { page: 1, pageSize: 10 });
  }, []);
  
  // 返回状态和方法
  return {
    questions,
    loading,
    error,
    pagination,
    fetchQuestions,
    // 其他方法...
  };
}
```

### 使用示例

```tsx
function QuestionList() {
  const { questions, loading, error, pagination, fetchQuestions } = useQuestions();
  
  if (loading) return <Spin />;
  if (error) return <Alert message={error.message} type="error" />;
  
  return (
    <Table
      dataSource={questions}
      pagination={{
        current: pagination.page,
        pageSize: pagination.pageSize,
        total: pagination.total,
        onChange: (page, pageSize) => fetchQuestions({ page, pageSize }),
      }}
    />
  );
}
```

---

## 最佳实践

### 1. 环境变量配置

```typescript
// .env.development
VITE_API_BASE_URL=http://localhost:3000/api

// .env.production
VITE_API_BASE_URL=https://api.example.com/api

// 使用
const baseURL = import.meta.env.VITE_API_BASE_URL;
```

### 2. 类型安全

```typescript
// 使用泛型确保类型安全
const questions = await api.get<Question[]>('/questions');
// questions 的类型是 Question[]

// 使用接口定义 API 响应
interface ApiResponse<T> {
  data: T;
  message?: string;
}
```

### 3. 错误边界

```tsx
// 全局错误边界
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorPage />;
    }
    return this.props.children;
  }
}
```

### 4. 请求取消

```typescript
// 使用 AbortController 取消请求
function useQuestions() {
  useEffect(() => {
    const controller = new AbortController();
    
    fetchQuestions({ signal: controller.signal });
    
    return () => controller.abort();  // 组件卸载时取消请求
  }, []);
}
```

### 5. 缓存策略

```typescript
// 使用 React Query 或 SWR 进行缓存
import { useQuery } from '@tanstack/react-query';

function useQuestions(filters: QuestionFilters) {
  return useQuery({
    queryKey: ['questions', filters],
    queryFn: () => getQuestions(filters),
    staleTime: 5 * 60 * 1000,  // 5 分钟内不重新请求
  });
}
```

---

## 总结

### 关键概念

1. **分层架构**：UI → Hooks → Service → API Client → Backend
2. **单例模式**：API Client 使用单例确保状态一致
3. **拦截器**：统一处理认证和错误
4. **Token 刷新**：自动刷新过期的 Token
5. **数据转换**：Service 层负责格式转换
6. **错误处理**：统一的错误类型和处理方式

### 文件结构

```
src/
├── lib/
│   └── apiClient.ts      # API 客户端
├── services/
│   ├── authService.ts    # 认证服务
│   ├── questionService.ts # 题目服务
│   ├── categoryService.ts # 分类服务
│   ├── tagService.ts     # 标签服务
│   └── uploadService.ts  # 上传服务
├── hooks/
│   ├── useAuth.ts        # 认证 Hook
│   ├── useQuestions.ts   # 题目 Hook
│   ├── useCategories.ts  # 分类 Hook
│   └── useTags.ts        # 标签 Hook
└── types/
    └── index.ts          # 类型定义
```


---

## 附录：代码文件清单

### 新增文件

| 文件路径 | 说明 |
|---------|------|
| `src/lib/apiClient.ts` | API 客户端，统一的 HTTP 请求处理 |
| `src/services/authService.ts` | 认证服务，登录/注册/Token 管理 |
| `src/hooks/useAuth.ts` | 认证 Hook，提供认证状态和操作 |
| `docs/API_REFERENCE.md` | API 接口参考文档 |
| `docs/API_INTEGRATION_GUIDE.md` | 本学习指南 |

### 修改文件

| 文件路径 | 修改内容 |
|---------|---------|
| `src/services/questionService.ts` | 从 localStorage 改为 API 调用 |
| `src/services/categoryService.ts` | 从 localStorage 改为 API 调用 |
| `src/services/tagService.ts` | 从 localStorage 改为 API 调用 |
| `src/services/uploadService.ts` | 使用 API Client 进行上传 |
| `src/hooks/useQuestions.ts` | 添加错误处理和类型 |
| `src/hooks/useQuestion.ts` | 添加错误处理和类型 |
| `src/hooks/useCategories.ts` | 添加错误处理和类型 |
| `src/hooks/useTags.ts` | 添加错误处理和类型 |
| `src/hooks/index.ts` | 导出 useAuth |

---

## 附录：常见问题

### Q1: 如何配置 API 基础 URL？

在项目根目录创建 `.env` 文件：

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:3000/api

# .env.production
VITE_API_BASE_URL=https://api.example.com/api
```

### Q2: Token 过期后如何处理？

API Client 会自动处理 Token 刷新：
1. 当请求返回 401 时，自动使用 Refresh Token 获取新的 Access Token
2. 刷新成功后，自动重试原请求
3. 刷新失败时，清除 Token 并触发登出

### Q3: 如何处理并发请求的 Token 刷新？

API Client 使用队列机制：
1. 第一个 401 请求触发 Token 刷新
2. 后续的 401 请求加入等待队列
3. 刷新完成后，队列中的请求使用新 Token 重试

### Q4: 如何在组件中处理错误？

```tsx
function MyComponent() {
  const { error, isError } = useQuestions();
  
  if (isError) {
    // 根据错误类型显示不同提示
    switch (error?.type) {
      case ErrorType.NOT_FOUND:
        return <Empty description="没有找到数据" />;
      case ErrorType.NETWORK_ERROR:
        return <Alert message="网络错误" type="error" />;
      default:
        return <Alert message={error?.message} type="error" />;
    }
  }
  
  // 正常渲染...
}
```

### Q5: 如何实现乐观更新？

```tsx
const updateMutation = useMutation({
  mutationFn: updateQuestion,
  // 乐观更新：在请求发送前先更新 UI
  onMutate: async (newData) => {
    // 取消正在进行的查询
    await queryClient.cancelQueries({ queryKey: ['questions'] });
    
    // 保存之前的数据
    const previousData = queryClient.getQueryData(['questions']);
    
    // 乐观更新
    queryClient.setQueryData(['questions'], (old) => ({
      ...old,
      data: old.data.map(q => q.id === newData.id ? { ...q, ...newData } : q),
    }));
    
    return { previousData };
  },
  // 错误时回滚
  onError: (err, newData, context) => {
    queryClient.setQueryData(['questions'], context.previousData);
  },
});
```

---

## 附录：进阶主题

### 1. 请求取消

使用 AbortController 取消请求：

```typescript
function useQuestions() {
  useEffect(() => {
    const controller = new AbortController();
    
    fetchQuestions({ signal: controller.signal });
    
    return () => controller.abort();
  }, []);
}
```

### 2. 请求重试

React Query 内置重试机制：

```typescript
const query = useQuery({
  queryKey: ['questions'],
  queryFn: getQuestions,
  retry: 3,  // 重试3次
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});
```

### 3. 数据预取

在路由跳转前预取数据：

```typescript
// 在列表页预取详情
function QuestionList() {
  const queryClient = useQueryClient();
  
  const prefetchQuestion = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: ['questions', id],
      queryFn: () => getQuestionById(id),
    });
  };
  
  return (
    <List
      dataSource={questions}
      renderItem={(item) => (
        <List.Item onMouseEnter={() => prefetchQuestion(item.id)}>
          {item.title}
        </List.Item>
      )}
    />
  );
}
```

### 4. 离线支持

使用 React Query 的持久化功能：

```typescript
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

persistQueryClient({
  queryClient,
  persister,
});
```

---

## 总结

通过本指南，你应该已经掌握了：

1. **分层架构**的设计思想和实现方式
2. **API Client** 的单例模式和拦截器机制
3. **JWT 认证**的完整流程和 Token 刷新机制
4. **Service 层**的数据转换和错误处理
5. **React Query** 的查询和变更操作
6. **错误处理**的统一方式

这些知识不仅适用于本项目，也是现代前端开发的通用模式，可以应用到其他项目中。
