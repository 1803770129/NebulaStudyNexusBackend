# 题目管理模块教程

## 模块概述

题目管理是系统的核心功能，包含题目列表展示、筛选搜索、创建编辑等功能。本模块展示了如何构建一个完整的 CRUD 功能。

## 目录结构

```
src/
├── pages/
│   ├── QuestionList/
│   │   └── index.tsx         # 题目列表页面
│   └── QuestionForm/
│       └── index.tsx         # 题目表单页面（创建/编辑）
├── components/question/
│   ├── QuestionTable.tsx     # 题目表格组件
│   ├── QuestionFilter.tsx    # 筛选组件
│   └── QuestionForm.tsx      # 表单组件
├── hooks/
│   ├── useQuestions.ts       # 题目列表 Hook
│   └── useQuestion.ts        # 单个题目 Hook
├── services/
│   └── questionService.ts    # 题目服务层
├── stores/
│   └── filterStore.ts        # 筛选状态管理
└── types/
    └── question.ts           # 题目类型定义
```

## 页面组件

### 1. 题目列表页面 (QuestionList/index.tsx)

```typescript
import { useNavigate } from 'react-router-dom'
import { Button, message, Modal } from 'antd'
import { PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { QuestionTable } from '@/components/question/QuestionTable'
import { QuestionFilter } from '@/components/question/QuestionFilter'
import { useQuestions } from '@/hooks/useQuestions'
import { useQuestion } from '@/hooks/useQuestion'
import { useCategories } from '@/hooks/useCategories'
import { useFilterStore } from '@/stores'

export function QuestionListPage() {
  const navigate = useNavigate()
  const { questions, total, isLoading } = useQuestions()
  const { remove, isDeleting } = useQuestion()
  const { categories } = useCategories()
  const { questionFilters, setQuestionFilters, resetQuestionFilters } = useFilterStore()

  // 处理编辑
  const handleEdit = (id: string) => {
    navigate(`/questions/edit/${id}`)
  }

  // 处理删除
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除这道题目吗？此操作不可恢复。',
      okText: '确认',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          await remove(id)
          message.success('删除成功')
        } catch (error) {
          message.error('删除失败')
        }
      },
    })
  }

  // 处理分页变化
  const handlePageChange = (page: number, pageSize: number) => {
    setQuestionFilters({ page, pageSize })
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>题目管理</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/questions/create')}
        >
          新建题目
        </Button>
      </div>

      {/* 筛选区域 */}
      <QuestionFilter
        filters={questionFilters}
        categories={categories}
        onFilterChange={setQuestionFilters}
        onSearch={(keyword) => setQuestionFilters({ keyword })}
        onReset={resetQuestionFilters}
      />

      {/* 题目列表 */}
      <QuestionTable
        questions={questions}
        loading={isLoading || isDeleting}
        pagination={{
          current: questionFilters.page,
          pageSize: questionFilters.pageSize,
          total,
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPageChange={handlePageChange}
      />
    </div>
  )
}
```

关键设计点：

| 特性 | 说明 |
|------|------|
| 组件拆分 | 表格、筛选器独立为子组件 |
| 状态管理 | 使用 Zustand 管理筛选状态 |
| 数据获取 | 使用 TanStack Query Hook |
| 删除确认 | 使用 Modal.confirm 二次确认 |

### 2. 题目表单页面 (QuestionForm/index.tsx)

```typescript
import { useNavigate, useParams } from 'react-router-dom'
import { Card, message, Spin } from 'antd'
import { QuestionForm } from '@/components/question/QuestionForm'
import { useQuestion } from '@/hooks/useQuestion'
import { useCategories } from '@/hooks/useCategories'
import { useTags } from '@/hooks/useTags'
import type { QuestionFormValues } from '@/types'

export function QuestionFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id

  const { question, isLoading: isLoadingQuestion, create, update, isCreating, isUpdating } = useQuestion(id)
  const { categories, isLoading: isLoadingCategories } = useCategories()
  const { tags, isLoading: isLoadingTags } = useTags()

  const isLoading = isLoadingQuestion || isLoadingCategories || isLoadingTags
  const isSaving = isCreating || isUpdating

  // 处理表单提交
  const handleSubmit = async (values: QuestionFormValues) => {
    try {
      if (isEdit) {
        await update(values)
        message.success('更新成功')
      } else {
        await create(values)
        message.success('创建成功')
      }
      navigate('/questions')
    } catch (error) {
      message.error(isEdit ? '更新失败' : '创建失败')
    }
  }

  // 处理取消
  const handleCancel = () => {
    navigate('/questions')
  }

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>{isEdit ? '编辑题目' : '新建题目'}</h2>
      
      <Card>
        <QuestionForm
          initialValues={question ?? undefined}
          categories={categories}
          tags={tags}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={isSaving}
        />
      </Card>
    </div>
  )
}
```

关键设计点：

| 特性 | 说明 |
|------|------|
| 复用表单 | 创建和编辑共用同一个表单组件 |
| URL 参数 | 通过 `useParams` 获取编辑 ID |
| 加载状态 | 聚合多个数据源的加载状态 |
| 导航 | 提交成功后自动返回列表 |

## 服务层 (questionService.ts)

### 数据转换

后端返回的数据格式与前端使用的格式不同，服务层负责转换：

```typescript
/**
 * API 返回的题目格式
 */
interface QuestionApiResponse {
  id: string;
  title: string;
  content: RichContent;
  type: Question['type'];
  difficulty: Question['difficulty'];
  categoryId: string;
  tags?: TagApiResponse[];  // 后端返回 tags 对象数组
  options?: OptionApiResponse[];
  answer: string | string[];
  explanation?: RichContent;
  createdAt: string;
  updatedAt: string;
}

/**
 * 将 API 响应转换为前端 Question 类型
 */
function convertApiResponseToQuestion(api: QuestionApiResponse): Question {
  return {
    id: api.id,
    title: api.title,
    content: api.content,
    type: api.type,
    difficulty: api.difficulty,
    categoryId: api.categoryId,
    tagIds: api.tags?.map(tag => tag.id) || [],  // 提取 tag ID
    options: api.options?.map(convertApiOptionToOption),
    answer: api.answer,
    explanation: api.explanation,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
  };
}
```

### API 方法

```typescript
/**
 * 获取题目列表（支持筛选和分页）
 */
export async function getQuestions(
  filters: QuestionFilters
): Promise<PaginatedResponse<Question>> {
  const api = getApiClient();
  
  // 构建查询参数
  const params: QueryQuestionParams = {
    page: filters.page,
    pageSize: filters.pageSize,
  };
  
  // 添加可选筛选条件
  if (filters.keyword?.trim()) {
    params.keyword = filters.keyword.trim();
  }
  if (filters.categoryId) {
    params.categoryId = filters.categoryId;
  }
  // ...
  
  const response = await api.get<{ data: { data: QuestionApiResponse[]; total: number } }>('/questions', params);
  
  return {
    data: response.data.data.map(convertApiResponseToQuestion),
    total: response.data.total,
    page: response.data.page,
    pageSize: response.data.pageSize,
  };
}

/**
 * 创建新题目
 */
export async function createQuestion(data: QuestionFormValues): Promise<Question> {
  const api = getApiClient();
  const request = convertFormValuesToRequest(data);
  const response = await api.post<{ data: QuestionApiResponse }>('/questions', request);
  return convertApiResponseToQuestion(response.data);
}

/**
 * 更新题目
 */
export async function updateQuestion(id: string, data: QuestionFormValues): Promise<Question> {
  const api = getApiClient();
  const request = convertFormValuesToRequest(data);
  const response = await api.patch<{ data: QuestionApiResponse }>(`/questions/${id}`, request);
  return convertApiResponseToQuestion(response.data);
}

/**
 * 删除题目
 */
export async function deleteQuestion(id: string): Promise<void> {
  const api = getApiClient();
  await api.delete(`/questions/${id}`);
}
```

## 自定义 Hooks

### useQuestions - 题目列表

```typescript
import { useQuery } from '@tanstack/react-query';
import { getQuestions } from '@/services/questionService';
import { useFilterStore } from '@/stores';

export function useQuestions() {
  const { questionFilters } = useFilterStore();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['questions', questionFilters],
    queryFn: () => getQuestions(questionFilters),
  });

  return {
    questions: data?.data ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
  };
}
```

### useQuestion - 单个题目操作

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getQuestionById, 
  createQuestion, 
  updateQuestion, 
  deleteQuestion 
} from '@/services/questionService';

export function useQuestion(id?: string) {
  const queryClient = useQueryClient();

  // 获取单个题目
  const { data: question, isLoading } = useQuery({
    queryKey: ['question', id],
    queryFn: () => getQuestionById(id!),
    enabled: !!id,
  });

  // 创建
  const createMutation = useMutation({
    mutationFn: createQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });

  // 更新
  const updateMutation = useMutation({
    mutationFn: (data: QuestionFormValues) => updateQuestion(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['question', id] });
    },
  });

  // 删除
  const deleteMutation = useMutation({
    mutationFn: deleteQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });

  return {
    question,
    isLoading,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
```

## 状态管理 (filterStore.ts)

使用 Zustand 管理筛选状态：

```typescript
import { create } from 'zustand';
import type { QuestionFilters } from '@/types';

interface FilterState {
  questionFilters: QuestionFilters;
  setQuestionFilters: (filters: Partial<QuestionFilters>) => void;
  resetQuestionFilters: () => void;
}

const defaultFilters: QuestionFilters = {
  page: 1,
  pageSize: 10,
  keyword: '',
  categoryId: undefined,
  type: undefined,
  difficulty: undefined,
  tagIds: [],
};

export const useFilterStore = create<FilterState>((set) => ({
  questionFilters: defaultFilters,
  
  setQuestionFilters: (filters) =>
    set((state) => ({
      questionFilters: { ...state.questionFilters, ...filters },
    })),
    
  resetQuestionFilters: () =>
    set({ questionFilters: defaultFilters }),
}));
```

## 数据流图

```
┌─────────────────────────────────────────────────────────────┐
│                      QuestionListPage                        │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │ QuestionFilter  │  │  QuestionTable  │                   │
│  └────────┬────────┘  └────────┬────────┘                   │
└───────────┼────────────────────┼────────────────────────────┘
            │                    │
            ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                         Hooks                                │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │  useFilterStore │  │   useQuestions  │                   │
│  │    (Zustand)    │  │ (TanStack Query)│                   │
│  └────────┬────────┘  └────────┬────────┘                   │
└───────────┼────────────────────┼────────────────────────────┘
            │                    │
            │                    ▼
            │         ┌─────────────────────┐
            │         │  questionService    │
            │         │  (API 调用 + 转换)   │
            │         └──────────┬──────────┘
            │                    │
            │                    ▼
            │         ┌─────────────────────┐
            └────────▶│     后端 API        │
                      └─────────────────────┘
```

## 类型定义

```typescript
// types/question.ts

export type QuestionType = 'single_choice' | 'multiple_choice' | 'true_false' | 'fill_blank' | 'essay';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  title: string;
  content: RichContent;
  type: QuestionType;
  difficulty: Difficulty;
  categoryId: string;
  tagIds: string[];
  options?: Option[];
  answer: string | string[];
  explanation?: RichContent;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionFilters {
  page: number;
  pageSize: number;
  keyword?: string;
  categoryId?: string;
  type?: QuestionType;
  difficulty?: Difficulty;
  tagIds?: string[];
}

export interface QuestionFormValues {
  title: string;
  content: string;  // 原始 HTML
  type: QuestionType;
  difficulty: Difficulty;
  categoryId: string;
  tagIds?: string[];
  options?: FormOption[];
  answer: string | string[];
  explanation?: string;
}
```

## 路由配置

```typescript
// router/index.tsx
import { QuestionListPage } from '@/pages/QuestionList';
import { QuestionFormPage } from '@/pages/QuestionForm';

const routes = [
  {
    path: '/questions',
    element: <QuestionListPage />,
  },
  {
    path: '/questions/create',
    element: <QuestionFormPage />,
  },
  {
    path: '/questions/edit/:id',
    element: <QuestionFormPage />,
  },
];
```

## 最佳实践

### 1. 乐观更新

删除时可以使用乐观更新提升用户体验：

```typescript
const deleteMutation = useMutation({
  mutationFn: deleteQuestion,
  onMutate: async (id) => {
    await queryClient.cancelQueries({ queryKey: ['questions'] });
    const previous = queryClient.getQueryData(['questions']);
    queryClient.setQueryData(['questions'], (old) => 
      old?.data.filter(q => q.id !== id)
    );
    return { previous };
  },
  onError: (err, id, context) => {
    queryClient.setQueryData(['questions'], context?.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['questions'] });
  },
});
```

### 2. 表单验证

使用 Ant Design Form 的验证规则：

```typescript
<Form.Item
  name="title"
  label="题目标题"
  rules={[
    { required: true, message: '请输入题目标题' },
    { max: 200, message: '标题不能超过200字' },
  ]}
>
  <Input placeholder="请输入题目标题" />
</Form.Item>
```

### 3. 防抖搜索

筛选时使用防抖避免频繁请求：

```typescript
import { useDebouncedCallback } from 'use-debounce';

const debouncedSearch = useDebouncedCallback((keyword: string) => {
  setQuestionFilters({ keyword, page: 1 });
}, 300);
```
