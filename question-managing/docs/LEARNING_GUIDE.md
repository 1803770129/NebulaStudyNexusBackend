# React 19 题目管理系统 - 学习指南

本文档详细介绍了项目的每个技术点、原理和最佳实践，帮助你深入理解现代 React 开发。

## 目录

1. [项目架构概述](#1-项目架构概述)
2. [Vite + React 19 + TypeScript 配置](#2-vite--react-19--typescript-配置)
3. [类型系统设计](#3-类型系统设计)
4. [服务层架构](#4-服务层架构)
5. [状态管理](#5-状态管理)
6. [自定义 Hooks](#6-自定义-hooks)
7. [组件设计模式](#7-组件设计模式)
8. [路由配置](#8-路由配置)
9. [属性测试 (Property-Based Testing)](#9-属性测试-property-based-testing)
10. [最佳实践总结](#10-最佳实践总结)

---

## 1. 项目架构概述

### 分层架构

```
┌─────────────────────────────────────────┐
│           Presentation Layer            │
│    (Pages, Components, Layouts)         │
├─────────────────────────────────────────┤
│           State Management              │
│    (Zustand + TanStack Query)           │
├─────────────────────────────────────────┤
│           Custom Hooks                  │
│    (useQuestions, useCategories...)     │
├─────────────────────────────────────────┤
│           Service Layer                 │
│    (questionService, categoryService)   │
├─────────────────────────────────────────┤
│           Data Layer                    │
│    (localStorage, Types, Constants)     │
└─────────────────────────────────────────┘
```

### 核心原则

1. **关注点分离**: 每一层只负责自己的职责
2. **单向数据流**: 数据从服务层流向展示层
3. **类型安全**: 全程使用 TypeScript 确保类型正确
4. **可测试性**: 每一层都可以独立测试

---

## 2. Vite + React 19 + TypeScript 配置

### 2.1 Vite 配置详解

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),  // 路径别名
    },
  },
})
```

**技巧说明**:
- `@` 别名让导入更简洁: `import { Button } from '@/components'`
- 避免相对路径地狱: `../../../components/Button`

### 2.2 TypeScript 配置

```json
// tsconfig.app.json
{
  "compilerOptions": {
    "strict": true,           // 启用严格模式
    "noUnusedLocals": true,   // 检查未使用的变量
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]        // 配合 Vite 的路径别名
    }
  }
}
```

**为什么使用严格模式?**
- 捕获更多潜在错误
- 更好的类型推断
- 代码更健壮

---

## 3. 类型系统设计

### 3.1 使用 const 对象代替 enum

```typescript
// ❌ 传统 enum (在某些配置下有问题)
enum QuestionType {
  SINGLE_CHOICE = 'single_choice',
}

// ✅ const 对象 + 类型推导
export const QuestionType = {
  SINGLE_CHOICE: 'single_choice',
  MULTIPLE_CHOICE: 'multiple_choice',
} as const

export type QuestionType = typeof QuestionType[keyof typeof QuestionType]
```

**优势**:
- 更好的 Tree-shaking
- 运行时可以遍历值
- 兼容性更好

### 3.2 接口设计原则

```typescript
// 基础实体接口
interface Question {
  id: string              // 唯一标识
  title: string           // 必填字段
  options?: Option[]      // 可选字段用 ?
  createdAt: string       // 时间戳用 ISO 字符串
}

// 表单值接口 (不包含自动生成的字段)
interface QuestionFormValues {
  title: string
  content: string
  // 不包含 id, createdAt, updatedAt
}
```

**技巧**: 分离实体接口和表单接口，避免表单处理时的类型问题

---

## 4. 服务层架构

### 4.1 服务层职责

```typescript
// services/questionService.ts

// 1. 数据访问
export function getAllQuestions(): Question[] {
  return getItem<Question[]>(STORAGE_KEYS.QUESTIONS) ?? []
}

// 2. 业务逻辑 (筛选、搜索)
export function getQuestions(filters: QuestionFilters): PaginatedResponse<Question> {
  let questions = getAllQuestions()
  
  // 关键词搜索
  if (filters.keyword?.trim()) {
    const keyword = filters.keyword.toLowerCase()
    questions = questions.filter(q =>
      q.title.toLowerCase().includes(keyword) ||
      q.content.toLowerCase().includes(keyword)
    )
  }
  
  // 分页处理
  const startIndex = (filters.page - 1) * filters.pageSize
  return {
    data: questions.slice(startIndex, startIndex + filters.pageSize),
    total: questions.length,
    page: filters.page,
    pageSize: filters.pageSize,
  }
}

// 3. 数据验证和错误处理
export function createQuestion(data: QuestionFormValues): Question {
  // 验证逻辑...
  const newQuestion: Question = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  // 保存...
  return newQuestion
}
```

### 4.2 错误处理模式

```typescript
// 自定义错误类
export class ServiceError extends Error implements AppError {
  type: ErrorType
  field?: string

  constructor(type: ErrorType, message: string, field?: string) {
    super(message)
    this.type = type
    this.field = field
  }
}

// 使用示例
if (isDuplicateName(data.name)) {
  throw new ServiceError(
    ErrorType.DUPLICATE_ERROR,
    '名称已存在',
    'name'  // 指明是哪个字段的错误
  )
}
```

---

## 5. 状态管理

### 5.1 Zustand - 客户端状态

```typescript
// stores/filterStore.ts
import { create } from 'zustand'

interface FilterState {
  questionFilters: QuestionFilters
}

interface FilterActions {
  setQuestionFilters: (filters: Partial<QuestionFilters>) => void
  resetQuestionFilters: () => void
}

export const useFilterStore = create<FilterState & FilterActions>((set) => ({
  // 初始状态
  questionFilters: { page: 1, pageSize: 10 },

  // 操作方法
  setQuestionFilters: (filters) =>
    set((state) => ({
      questionFilters: {
        ...state.questionFilters,
        ...filters,
        page: filters.page ?? 1,  // 筛选变化时重置页码
      },
    })),

  resetQuestionFilters: () =>
    set({ questionFilters: { page: 1, pageSize: 10 } }),
}))
```

**Zustand 优势**:
- 极简 API，无需 Provider
- 自动优化重渲染
- 支持中间件 (persist, devtools)

### 5.2 TanStack Query - 服务端状态

```typescript
// lib/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5分钟内数据被认为是新鲜的
      gcTime: 10 * 60 * 1000,        // 缓存保留10分钟
      refetchOnWindowFocus: false,   // 本地存储不需要自动刷新
    },
  },
})

// Query Keys 管理
export const queryKeys = {
  questions: {
    all: ['questions'] as const,
    lists: () => [...queryKeys.questions.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.questions.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.questions.all, 'detail', id] as const,
  },
}
```

**为什么分离客户端和服务端状态?**
- 客户端状态 (UI状态、筛选条件): 用 Zustand
- 服务端状态 (数据列表、详情): 用 TanStack Query
- 各司其职，避免混乱

---

## 6. 自定义 Hooks

### 6.1 数据查询 Hook

```typescript
// hooks/useQuestions.ts
export function useQuestions(filters?: QuestionFilters) {
  const storeFilters = useFilterStore((state) => state.questionFilters)
  const activeFilters = filters ?? storeFilters

  const query = useQuery({
    queryKey: queryKeys.questions.list(activeFilters),
    queryFn: () => getQuestions(activeFilters),
  })

  return {
    questions: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}
```

### 6.2 CRUD 操作 Hook

```typescript
// hooks/useQuestion.ts
export function useQuestion(id?: string) {
  const queryClient = useQueryClient()

  // 查询
  const query = useQuery({
    queryKey: queryKeys.questions.detail(id ?? ''),
    queryFn: () => getQuestionById(id!),
    enabled: !!id,  // 只有传入 id 时才查询
  })

  // 创建
  const createMutation = useMutation({
    mutationFn: async (data: QuestionFormValues) => createQuestion(data),
    onSuccess: () => {
      // 创建成功后，使列表缓存失效
      queryClient.invalidateQueries({ queryKey: queryKeys.questions.lists() })
    },
  })

  // 更新
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => updateQuestion(id, data),
    onSuccess: (updatedQuestion) => {
      // 更新缓存中的数据
      queryClient.setQueryData(
        queryKeys.questions.detail(updatedQuestion.id),
        updatedQuestion
      )
      queryClient.invalidateQueries({ queryKey: queryKeys.questions.lists() })
    },
  })

  return {
    question: query.data,
    isLoading: query.isLoading,
    create: createMutation.mutateAsync,
    update: (data) => updateMutation.mutateAsync({ id: id!, data }),
    remove: deleteMutation.mutateAsync,
  }
}
```

**Hook 设计原则**:
1. 封装复杂逻辑，暴露简单接口
2. 处理加载状态和错误状态
3. 自动管理缓存失效

---

## 7. 组件设计模式

### 7.1 容器组件 vs 展示组件

```typescript
// 容器组件 (处理逻辑)
function QuestionListPage() {
  const { questions, isLoading } = useQuestions()
  const { remove } = useQuestion()
  
  const handleDelete = async (id: string) => {
    await remove(id)
    message.success('删除成功')
  }

  return (
    <QuestionTable
      questions={questions}
      loading={isLoading}
      onDelete={handleDelete}
    />
  )
}

// 展示组件 (只负责渲染)
function QuestionTable({ questions, loading, onDelete }: Props) {
  const columns = [
    { title: '标题', dataIndex: 'title' },
    {
      title: '操作',
      render: (_, record) => (
        <Button onClick={() => onDelete(record.id)}>删除</Button>
      ),
    },
  ]

  return <Table columns={columns} dataSource={questions} loading={loading} />
}
```

### 7.2 表单组件模式

```typescript
function QuestionForm({ initialValues, onSubmit, onCancel }: Props) {
  const [form] = Form.useForm()
  const questionType = Form.useWatch('type', form)  // 监听字段变化

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues)
    }
  }, [initialValues, form])

  const handleSubmit = async () => {
    const values = await form.validateFields()
    await onSubmit(values)
  }

  return (
    <Form form={form} onFinish={handleSubmit}>
      <Form.Item name="title" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      
      {/* 根据类型条件渲染 */}
      {questionType === QuestionType.SINGLE_CHOICE && (
        <OptionEditor />
      )}
    </Form>
  )
}
```

---

## 8. 路由配置

### 8.1 懒加载路由

```typescript
// router/index.tsx
import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'

// 懒加载页面
const QuestionListPage = lazy(() => import('@/pages/QuestionList'))
const QuestionFormPage = lazy(() => import('@/pages/QuestionForm'))

// 包装懒加载组件
const withSuspense = (Component: React.LazyExoticComponent<any>) => (
  <Suspense fallback={<Spin />}>
    <Component />
  </Suspense>
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: withSuspense(HomePage) },
      {
        path: 'questions',
        children: [
          { index: true, element: withSuspense(QuestionListPage) },
          { path: 'create', element: withSuspense(QuestionFormPage) },
          { path: 'edit/:id', element: withSuspense(QuestionFormPage) },
        ],
      },
    ],
  },
])
```

**懒加载优势**:
- 减少初始包大小
- 按需加载页面
- 提升首屏加载速度

---

## 9. 属性测试 (Property-Based Testing)

### 9.1 什么是属性测试?

传统单元测试: 测试特定输入 → 期望特定输出
属性测试: 测试所有可能输入 → 期望某个属性始终成立

```typescript
// 传统测试
it('should filter by category', () => {
  const result = getQuestions({ categoryId: 'cat-1' })
  expect(result.data[0].categoryId).toBe('cat-1')
})

// 属性测试
it('should filter by category correctly', () => {
  fc.assert(
    fc.property(
      fc.array(questionArbitrary),      // 生成随机题目数组
      fc.string(),                       // 生成随机分类ID
      (questions, categoryId) => {
        // 设置数据
        questions.forEach(q => createQuestion(q))
        
        // 执行筛选
        const result = getQuestions({ categoryId, page: 1, pageSize: 100 })
        
        // 验证属性: 所有返回的题目都属于目标分类
        result.data.forEach(q => {
          expect(q.categoryId).toBe(categoryId)
        })
      }
    ),
    { numRuns: 100 }  // 运行100次
  )
})
```

### 9.2 常用属性模式

```typescript
// 1. 往返属性 (Round-trip)
// 序列化后反序列化应该得到相同的值
it('should round-trip data correctly', () => {
  fc.assert(
    fc.property(questionArbitrary, (question) => {
      setItem('key', question)
      const retrieved = getItem('key')
      expect(retrieved).toEqual(question)
    })
  )
})

// 2. 不变量 (Invariant)
// 某个条件始终成立
it('should maintain category level constraint', () => {
  fc.assert(
    fc.property(categoryArbitrary, (category) => {
      const created = createCategory(category)
      expect(created.level).toBeLessThanOrEqual(3)  // 层级不超过3
    })
  )
})

// 3. 幂等性 (Idempotence)
// 操作多次和操作一次结果相同
it('should be idempotent', () => {
  fc.assert(
    fc.property(fc.string(), (name) => {
      const result1 = normalize(name)
      const result2 = normalize(normalize(name))
      expect(result1).toBe(result2)
    })
  )
})
```

### 9.3 生成器 (Arbitrary) 编写

```typescript
// 生成随机题目
const questionArbitrary = fc.record({
  title: fc.string({ minLength: 1, maxLength: 100 }),
  content: fc.string({ maxLength: 500 }),
  type: fc.constantFrom(...Object.values(QuestionType)),
  difficulty: fc.constantFrom(...Object.values(DifficultyLevel)),
  categoryId: fc.string({ minLength: 1 }),
  tagIds: fc.array(fc.string(), { maxLength: 5 }),
  answer: fc.string(),
})

// 生成随机颜色
const colorArbitrary = fc.stringMatching(/^#[0-9a-fA-F]{6}$/)
```

---

## 10. 最佳实践总结

### 10.1 代码组织

```
src/
├── components/     # 可复用组件
│   ├── common/    # 通用组件
│   └── question/  # 业务组件
├── pages/         # 页面组件
├── hooks/         # 自定义 Hooks
├── services/      # 服务层
├── stores/        # 状态管理
├── types/         # 类型定义
├── utils/         # 工具函数
└── constants/     # 常量配置
```

### 10.2 命名规范

```typescript
// 组件: PascalCase
function QuestionTable() {}

// Hook: use 前缀
function useQuestions() {}

// 服务函数: 动词开头
function getQuestions() {}
function createQuestion() {}
function deleteQuestion() {}

// 常量: UPPER_SNAKE_CASE
const MAX_CATEGORY_LEVEL = 3

// 类型: PascalCase
interface QuestionFilters {}
type QuestionType = ...
```

### 10.3 性能优化

```typescript
// 1. 使用 React.memo 避免不必要的重渲染
const QuestionTable = React.memo(function QuestionTable(props) {
  // ...
})

// 2. 使用 useMemo 缓存计算结果
const filteredQuestions = useMemo(
  () => questions.filter(q => q.type === selectedType),
  [questions, selectedType]
)

// 3. 使用 useCallback 缓存回调函数
const handleDelete = useCallback((id: string) => {
  remove(id)
}, [remove])

// 4. 懒加载大型组件
const HeavyComponent = lazy(() => import('./HeavyComponent'))
```

### 10.4 错误处理

```typescript
// 1. 服务层抛出具体错误
throw new ServiceError(ErrorType.NOT_FOUND, '题目不存在')

// 2. 组件层捕获并显示
try {
  await remove(id)
  message.success('删除成功')
} catch (error) {
  if (error instanceof ServiceError) {
    message.error(error.message)
  } else {
    message.error('操作失败')
  }
}

// 3. 使用错误边界捕获渲染错误
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>
```

---

## 运行项目

```bash
# 安装依赖
cd question-managing
npm install

# 开发模式
npm run dev

# 运行测试
npm run test

# 构建生产版本
npm run build
```

## 项目结构

```
question-managing/
├── src/
│   ├── components/          # 组件
│   │   ├── layout/         # 布局组件
│   │   └── question/       # 题目相关组件
│   ├── pages/              # 页面
│   ├── hooks/              # 自定义 Hooks
│   ├── services/           # 服务层
│   ├── stores/             # 状态管理
│   ├── types/              # 类型定义
│   ├── utils/              # 工具函数
│   ├── constants/          # 常量
│   ├── lib/                # 第三方库配置
│   └── router/             # 路由配置
├── docs/                   # 文档
└── package.json
```

祝你学习愉快！🎉
