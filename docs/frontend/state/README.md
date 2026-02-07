# 状态管理教程 (TanStack Query)

## 概述

本项目使用 TanStack Query (React Query) 管理服务端状态，它提供：
- 自动缓存和更新
- 请求去重
- 后台刷新
- 乐观更新
- 错误重试

## 基础配置

```typescript
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,       // 1分钟内数据被认为是新鲜的
      gcTime: 5 * 60 * 1000,      // 5分钟后清理未使用的缓存
      retry: 2,                    // 失败重试2次
      refetchOnWindowFocus: false, // 窗口聚焦时不自动刷新
    },
  },
});

// 在 main.tsx 中使用
import { QueryClientProvider } from '@tanstack/react-query';

<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

## Query Keys 管理

统一管理查询键，便于缓存失效：

```typescript
// lib/queryClient.ts
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
  auth: {
    profile: ['auth', 'profile'] as const,
  },
};
```

## 自定义 Hooks

### useQuestions - 题目列表

```typescript
// hooks/useQuestions.ts
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { getQuestions } from '@/services/questionService';

export function useQuestions(filters: QuestionFilters) {
  return useQuery({
    queryKey: queryKeys.questions.list(filters),
    queryFn: () => getQuestions(filters),
    staleTime: 60 * 1000,
  });
}

// 使用
function QuestionListPage() {
  const [filters, setFilters] = useState({ page: 1, pageSize: 10 });
  const { data, isLoading, isError, refetch } = useQuestions(filters);

  return (
    <Table
      dataSource={data?.data}
      loading={isLoading}
      pagination={{
        current: data?.page,
        total: data?.total,
        pageSize: data?.pageSize,
        onChange: (page, pageSize) => setFilters({ ...filters, page, pageSize }),
      }}
    />
  );
}
```

### useQuestion - 单个题目 + CRUD

```typescript
// hooks/useQuestion.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import {
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from '@/services/questionService';

export function useQuestion(id?: string) {
  const queryClient = useQueryClient();

  // 查询单个题目
  const query = useQuery({
    queryKey: queryKeys.questions.detail(id ?? ''),
    queryFn: () => getQuestionById(id!),
    enabled: !!id,  // 只有传入 id 时才查询
  });

  // 创建
  const createMutation = useMutation({
    mutationFn: createQuestion,
    onSuccess: () => {
      // 创建成功后，使列表缓存失效
      queryClient.invalidateQueries({ queryKey: queryKeys.questions.lists() });
    },
  });

  // 更新
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: QuestionFormValues }) =>
      updateQuestion(id, data),
    onSuccess: (updatedQuestion) => {
      // 更新缓存中的数据
      queryClient.setQueryData(
        queryKeys.questions.detail(updatedQuestion.id),
        updatedQuestion
      );
      // 使列表缓存失效
      queryClient.invalidateQueries({ queryKey: queryKeys.questions.lists() });
    },
  });

  // 删除
  const deleteMutation = useMutation({
    mutationFn: deleteQuestion,
    onSuccess: (_, deletedId) => {
      // 移除缓存
      queryClient.removeQueries({ queryKey: queryKeys.questions.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.questions.lists() });
    },
  });

  return {
    question: query.data,
    isLoading: query.isLoading,
    create: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    update: (data: QuestionFormValues) => updateMutation.mutateAsync({ id: id!, data }),
    isUpdating: updateMutation.isPending,
    remove: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
```

### useCategories - 分类管理

```typescript
// hooks/useCategories.ts
export function useCategories() {
  const queryClient = useQueryClient();

  // 扁平列表
  const listQuery = useQuery({
    queryKey: queryKeys.categories.lists(),
    queryFn: getAllCategories,
  });

  // 树形结构
  const treeQuery = useQuery({
    queryKey: queryKeys.categories.tree(),
    queryFn: getCategoryTree,
  });

  // 使所有分类缓存失效
  const invalidateCategories = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
  };

  // 创建
  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: invalidateCategories,
  });

  // 更新
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateCategory(id, data),
    onSuccess: invalidateCategories,
  });

  // 删除
  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: invalidateCategories,
  });

  return {
    categories: listQuery.data ?? [],
    treeData: treeQuery.data ?? [],
    isLoading: listQuery.isLoading || treeQuery.isLoading,
    create: createMutation.mutateAsync,
    update: (id, data) => updateMutation.mutateAsync({ id, data }),
    remove: deleteMutation.mutateAsync,
  };
}
```

## 缓存策略

### staleTime vs gcTime

```typescript
{
  staleTime: 60 * 1000,  // 1分钟内数据被认为是"新鲜的"，不会重新请求
  gcTime: 5 * 60 * 1000, // 5分钟后，未使用的缓存会被垃圾回收
}
```

- **staleTime**：数据被认为是新鲜的时间。在此期间，相同查询不会重新请求。
- **gcTime**：缓存保留时间。超过后，未使用的缓存会被清理。

### 缓存失效

```typescript
// 使特定查询失效
queryClient.invalidateQueries({ queryKey: queryKeys.questions.lists() });

// 使所有题目相关查询失效
queryClient.invalidateQueries({ queryKey: queryKeys.questions.all });

// 直接更新缓存数据
queryClient.setQueryData(queryKeys.questions.detail(id), newData);

// 移除缓存
queryClient.removeQueries({ queryKey: queryKeys.questions.detail(id) });
```

## 乐观更新

在服务器响应前先更新 UI：

```typescript
const updateMutation = useMutation({
  mutationFn: updateQuestion,
  onMutate: async (newData) => {
    // 取消正在进行的查询
    await queryClient.cancelQueries({ queryKey: queryKeys.questions.detail(id) });
    
    // 保存旧数据
    const previousData = queryClient.getQueryData(queryKeys.questions.detail(id));
    
    // 乐观更新
    queryClient.setQueryData(queryKeys.questions.detail(id), newData);
    
    return { previousData };
  },
  onError: (err, newData, context) => {
    // 出错时回滚
    queryClient.setQueryData(queryKeys.questions.detail(id), context?.previousData);
  },
  onSettled: () => {
    // 无论成功失败，都重新获取最新数据
    queryClient.invalidateQueries({ queryKey: queryKeys.questions.detail(id) });
  },
});
```

## 分页查询

```typescript
function useQuestionsPaginated(filters: QuestionFilters) {
  return useQuery({
    queryKey: queryKeys.questions.list(filters),
    queryFn: () => getQuestions(filters),
    placeholderData: keepPreviousData,  // 切换页面时保留旧数据
  });
}

// 使用
const { data, isPlaceholderData } = useQuestionsPaginated(filters);

<Table
  loading={isPlaceholderData}  // 切换页面时显示加载状态
  dataSource={data?.data}
/>
```

## 依赖查询

```typescript
// 先获取分类，再获取该分类下的题目
function useCategoryQuestions(categoryId?: string) {
  const categoryQuery = useQuery({
    queryKey: ['category', categoryId],
    queryFn: () => getCategoryById(categoryId!),
    enabled: !!categoryId,
  });

  const questionsQuery = useQuery({
    queryKey: ['questions', { categoryId }],
    queryFn: () => getQuestions({ categoryId }),
    enabled: !!categoryQuery.data,  // 分类加载完成后才查询题目
  });

  return { category: categoryQuery.data, questions: questionsQuery.data };
}
```
