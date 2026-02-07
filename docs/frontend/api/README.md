# API 层教程

## 概述

API 层负责与后端通信，包含三个核心部分：
- **API Client**：Axios 封装，处理请求/响应拦截
- **Services**：业务 API 调用和数据转换
- **Query Client**：TanStack Query 配置

## 文件结构

```
src/
├── lib/
│   ├── apiClient.ts      # Axios 封装
│   └── queryClient.ts    # TanStack Query 配置
└── services/
    ├── authService.ts    # 认证服务
    ├── questionService.ts # 题目服务
    ├── categoryService.ts # 分类服务
    ├── tagService.ts     # 标签服务
    └── uploadService.ts  # 上传服务
```

## API Client

### 核心实现

```typescript
// lib/apiClient.ts
import axios, { AxiosInstance, AxiosError } from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Token 管理
const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const getAccessToken = () => localStorage.getItem(TOKEN_KEY);
export const setAccessToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);
export const setRefreshToken = (token: string) => localStorage.setItem(REFRESH_TOKEN_KEY, token);
export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// 创建 Axios 实例
const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// 请求拦截器 - 添加 Token
axiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器 - 处理错误和 Token 刷新
axiosInstance.interceptors.response.use(
  (response) => response.data,  // 直接返回 data
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // 401 错误且有 refreshToken，尝试刷新
    if (error.response?.status === 401 && getRefreshToken()) {
      try {
        const response = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken: getRefreshToken(),
        });
        const { accessToken, refreshToken } = response.data.data;
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        
        // 重试原请求
        originalRequest!.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest!);
      } catch {
        clearTokens();
        window.location.href = '/login';
      }
    }
    
    // 触发全局错误处理
    triggerGlobalError(error);
    throw new ApiError(error);
  }
);
```

### API Client 类

```typescript
class ApiClient {
  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    return axiosInstance.get(url, { params });
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    return axiosInstance.post(url, data);
  }

  async patch<T>(url: string, data?: unknown): Promise<T> {
    return axiosInstance.patch(url, data);
  }

  async delete<T>(url: string): Promise<T> {
    return axiosInstance.delete(url);
  }

  async upload<T>(
    url: string,
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    return axiosInstance.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    });
  }
}

export const getApiClient = () => new ApiClient();
```

### 全局错误处理

```typescript
// 全局错误处理器
let globalErrorHandler: ((error: ApiError) => void) | null = null;

export const setGlobalErrorHandler = (handler: (error: ApiError) => void) => {
  globalErrorHandler = handler;
};

export const triggerGlobalError = (error: AxiosError) => {
  if (globalErrorHandler && error.response?.status !== 401) {
    const message = (error.response?.data as any)?.message || '请求失败';
    globalErrorHandler(new ApiError(error));
  }
};

// 在 App.tsx 中设置
useEffect(() => {
  setGlobalErrorHandler((error) => {
    message.error(error.message);
  });
}, []);
```

## Service 层

### 设计原则

1. **数据转换**：后端格式 ↔ 前端格式
2. **错误处理**：统一的错误类型
3. **类型安全**：完整的 TypeScript 类型

### 示例：题目服务

```typescript
// services/questionService.ts

// 后端返回格式
interface QuestionApiResponse {
  id: string;
  title: string;
  content: RichContent;
  type: QuestionType;
  difficulty: DifficultyLevel;
  categoryId: string;
  tags?: { id: string; name: string }[];  // 后端返回对象数组
  options?: OptionApiResponse[];
  answer: string | string[];
  explanation?: RichContent;
  createdAt: string;
  updatedAt: string;
}

// 转换函数
function convertApiResponseToQuestion(api: QuestionApiResponse): Question {
  return {
    ...api,
    tagIds: api.tags?.map(tag => tag.id) || [],  // 转换为 ID 数组
  };
}

// 获取题目列表
export async function getQuestions(
  filters: QuestionFilters
): Promise<PaginatedResponse<Question>> {
  const api = getApiClient();
  
  // 后端响应: { statusCode, message, data: { data, total, page, pageSize } }
  const response = await api.get<{ data: { 
    data: QuestionApiResponse[]; 
    total: number; 
    page: number; 
    pageSize: number 
  }}>('/questions', filters);
  
  return {
    data: response.data.data.map(convertApiResponseToQuestion),
    total: response.data.total,
    page: response.data.page,
    pageSize: response.data.pageSize,
  };
}

// 创建题目
export async function createQuestion(data: QuestionFormValues): Promise<Question> {
  const api = getApiClient();
  const response = await api.post<{ data: QuestionApiResponse }>('/questions', data);
  return convertApiResponseToQuestion(response.data);
}
```

### 示例：认证服务

```typescript
// services/authService.ts
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

export async function logout(): Promise<void> {
  clearTokens();
}

export async function getProfile(): Promise<User> {
  const api = getApiClient();
  const response = await api.get<{ data: User }>('/auth/profile');
  return response.data;
}
```

## Query Client 配置

```typescript
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,      // 1分钟内数据被认为是新鲜的
      gcTime: 5 * 60 * 1000,     // 5分钟后清理缓存
      retry: 2,                   // 失败重试2次
      refetchOnWindowFocus: false,
    },
  },
});

// Query Keys 管理
export const queryKeys = {
  questions: {
    all: ['questions'] as const,
    lists: () => [...queryKeys.questions.all, 'list'] as const,
    list: (filters: QuestionFilters) => [...queryKeys.questions.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.questions.all, 'detail', id] as const,
  },
  categories: {
    all: ['categories'] as const,
    lists: () => [...queryKeys.categories.all, 'list'] as const,
    tree: () => [...queryKeys.categories.all, 'tree'] as const,
  },
  tags: {
    all: ['tags'] as const,
    lists: () => [...queryKeys.tags.all, 'list'] as const,
  },
};
```

## 响应数据结构

后端统一响应格式：

```typescript
// 成功响应
{
  "statusCode": 200,
  "message": "success",
  "data": { ... },  // 实际数据
  "timestamp": "2026-01-04T12:00:00.000Z"
}

// 分页响应
{
  "statusCode": 200,
  "message": "success",
  "data": {
    "data": [...],      // 列表数据
    "total": 100,       // 总数
    "page": 1,          // 当前页
    "pageSize": 10      // 每页数量
  },
  "timestamp": "..."
}
```

前端 Service 需要从 `response.data` 中提取实际数据。
