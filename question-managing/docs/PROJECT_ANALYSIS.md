# 题目后台管理系统 - 项目完整解析

## 目录

1. [项目概述](#1-项目概述)
2. [技术栈详解](#2-技术栈详解)
3. [项目结构解析](#3-项目结构解析)
4. [配置文件详解](#4-配置文件详解)
5. [类型系统设计](#5-类型系统设计)
6. [服务层架构](#6-服务层架构)
7. [状态管理方案](#7-状态管理方案)
8. [自定义 Hooks](#8-自定义-hooks)
9. [组件设计模式](#9-组件设计模式)
10. [路由与懒加载](#10-路由与懒加载)
11. [测试策略](#11-测试策略)
12. [最佳实践总结](#12-最佳实践总结)

---

## 1. 项目概述

### 1.1 项目定位

这是一个基于 React 19 的题目后台管理系统前端项目，实现了题目、分类、标签的完整 CRUD 功能。项目采用现代化的前端技术栈，注重类型安全、代码可维护性和测试覆盖。

### 1.2 核心功能

- **题目管理**：创建、编辑、删除、搜索、筛选题目
- **分类管理**：支持三级分类树形结构
- **标签管理**：多维度标签系统
- **数据持久化**：使用 localStorage 存储数据

### 1.3 架构特点

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Layer                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │    Pages    │  │ Components  │  │   Layout    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                      Hooks Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ useQuestions│  │useCategories│  │   useTags   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                     State Layer                              │
│  ┌─────────────────────┐  ┌─────────────────────┐          │
│  │  TanStack Query     │  │      Zustand        │          │
│  │  (Server State)     │  │   (Client State)    │          │
│  └─────────────────────┘  └─────────────────────┘          │
├─────────────────────────────────────────────────────────────┤
│                    Service Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │questionSvc  │  │ categorySvc │  │   tagSvc    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                    Storage Layer                             │
│  ┌─────────────────────────────────────────────┐           │
│  │              localStorage                    │           │
│  └─────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 技术栈详解

### 2.1 核心依赖分析

```json
{
  "dependencies": {
    "react": "^19.2.0",           // React 19 最新版本
    "react-dom": "^19.2.0",       // React DOM 渲染
    "react-router-dom": "^7.11.0", // 路由管理
    "@tanstack/react-query": "^5.90.12", // 服务端状态管理
    "zustand": "^5.0.9",          // 客户端状态管理
    "antd": "^5.29.3",            // UI 组件库
    "@ant-design/icons": "^6.1.0", // 图标库
    "axios": "^1.13.2",           // HTTP 客户端（预留）
    "dayjs": "^1.11.19"           // 日期处理
  }
}
```

### 2.2 技术选型理由

| 技术 | 选型理由 |
|------|----------|
| **React 19** | 最新版本，支持并发特性、自动批处理、Suspense 改进 |
| **TypeScript 5.9** | 严格类型检查，提升代码质量和开发体验 |
| **Vite 7** | 极速开发服务器，原生 ESM 支持，构建速度快 |
| **TanStack Query** | 专业的服务端状态管理，自动缓存、重试、失效 |
| **Zustand** | 轻量级客户端状态管理，API 简洁，无 boilerplate |
| **Ant Design 5** | 企业级 UI 组件库，组件丰富，设计规范 |
| **Vitest** | 与 Vite 深度集成，速度快，兼容 Jest API |
| **fast-check** | 属性测试库，自动生成测试用例 |

### 2.3 开发依赖说明

```json
{
  "devDependencies": {
    "@vitejs/plugin-react": "^5.1.1",  // Vite React 插件
    "vitest": "^3.2.4",                 // 测试框架
    "fast-check": "^4.5.2",             // 属性测试
    "@testing-library/react": "^16.3.1", // React 测试工具
    "@testing-library/jest-dom": "^6.9.1", // DOM 断言扩展
    "jsdom": "^27.0.1",                 // 浏览器环境模拟
    "typescript": "~5.9.3",             // TypeScript 编译器
    "eslint": "^9.39.1",                // 代码检查
    "prettier": "^3.7.4"                // 代码格式化
  }
}
```

---

## 3. 项目结构解析

### 3.1 目录结构

```
src/
├── main.tsx              # 应用入口
├── App.tsx               # 根组件
├── index.css             # 全局样式
├── App.css               # 应用样式
│
├── types/                # 类型定义
│   └── index.ts          # 所有类型集中导出
│
├── constants/            # 常量配置
│   └── index.ts          # 枚举映射、默认值等
│
├── utils/                # 工具函数
│   ├── storage.ts        # localStorage 封装
│   ├── id.ts             # ID 生成器
│   └── index.ts          # 统一导出
│
├── services/             # 服务层（业务逻辑）
│   ├── questionService.ts
│   ├── categoryService.ts
│   ├── tagService.ts
│   └── *.test.ts         # 服务层测试
│
├── stores/               # 状态管理
│   ├── filterStore.ts    # 筛选条件状态
│   ├── uiStore.ts        # UI 状态
│   └── index.ts          # 统一导出
│
├── lib/                  # 第三方库配置
│   └── queryClient.ts    # TanStack Query 配置
│
├── hooks/                # 自定义 Hooks
│   ├── useQuestions.ts   # 题目列表
│   ├── useQuestion.ts    # 单个题目 CRUD
│   ├── useCategories.ts  # 分类管理
│   ├── useTags.ts        # 标签管理
│   └── index.ts          # 统一导出
│
├── components/           # 可复用组件
│   ├── layout/           # 布局组件
│   │   └── MainLayout.tsx
│   └── question/         # 题目相关组件
│       ├── QuestionFilter.tsx
│       ├── QuestionForm.tsx
│       └── QuestionTable.tsx
│
├── pages/                # 页面组件
│   ├── Home/
│   ├── QuestionList/
│   ├── QuestionForm/
│   ├── CategoryManage/
│   └── TagManage/
│
├── router/               # 路由配置
│   └── index.tsx
│
└── test/                 # 测试配置
    └── setup.ts
```

### 3.2 文件命名规范

| 类型 | 命名规范 | 示例 |
|------|----------|------|
| 组件文件 | PascalCase | `QuestionForm.tsx` |
| Hook 文件 | camelCase + use 前缀 | `useQuestions.ts` |
| 服务文件 | camelCase + Service 后缀 | `questionService.ts` |
| 测试文件 | 原文件名 + .test | `questionService.test.ts` |
| 类型文件 | index.ts 集中导出 | `types/index.ts` |
| 常量文件 | index.ts 集中导出 | `constants/index.ts` |

---

## 4. 配置文件详解

### 4.1 Vite 配置 (vite.config.ts)

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],  // React 插件，支持 JSX 转换和 Fast Refresh
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),  // 路径别名
    },
  },
})
```

**知识点：**
- `@vitejs/plugin-react`：提供 React Fast Refresh（热更新）和 JSX 转换
- 路径别名 `@`：避免相对路径地狱，如 `../../../components` → `@/components`

### 4.2 TypeScript 配置

项目使用 Project References 模式，分为三个配置文件：

**tsconfig.json（根配置）：**
```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },   // 应用代码配置
    { "path": "./tsconfig.node.json" }   // Node.js 配置（Vite 配置文件）
  ]
}
```

**技巧：** Project References 可以：
- 分离不同环境的配置
- 加速增量编译
- 更好的 IDE 支持

### 4.3 Vitest 配置 (vitest.config.ts)

```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,           // 全局 API（describe, it, expect）
    environment: 'jsdom',    // 浏览器环境模拟
    setupFiles: ['./src/test/setup.ts'],  // 测试前置配置
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',        // 覆盖率引擎
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/main.tsx',
      ],
    },
  },
})
```

**知识点：**
- `globals: true`：无需每个文件导入 `describe`、`it`、`expect`
- `environment: 'jsdom'`：模拟浏览器 DOM 环境
- `setupFiles`：在每个测试文件前执行，用于全局配置

---

## 5. 类型系统设计

### 5.1 枚举的替代方案

**问题：** TypeScript 的 `enum` 在 `erasableSyntaxOnly` 配置下不可用。

**解决方案：** 使用 `const` 对象 + 类型推断

```typescript
// ❌ 传统枚举（不可用）
enum QuestionType {
  SINGLE_CHOICE = 'single_choice',
}

// ✅ const 对象 + 类型推断
export const QuestionType = {
  SINGLE_CHOICE: 'single_choice',
  MULTIPLE_CHOICE: 'multiple_choice',
  TRUE_FALSE: 'true_false',
  FILL_BLANK: 'fill_blank',
  SHORT_ANSWER: 'short_answer',
} as const

// 提取类型
export type QuestionType = typeof QuestionType[keyof typeof QuestionType]
// 结果: 'single_choice' | 'multiple_choice' | 'true_false' | 'fill_blank' | 'short_answer'
```

**技巧解析：**
1. `as const`：将对象变为只读，值变为字面量类型
2. `typeof QuestionType`：获取对象的类型
3. `keyof typeof QuestionType`：获取所有键的联合类型
4. `typeof QuestionType[keyof typeof QuestionType]`：获取所有值的联合类型

### 5.2 核心接口设计

```typescript
/**
 * 题目接口 - 系统核心数据模型
 */
export interface Question {
  id: string                    // UUID
  title: string                 // 标题
  content: string               // 题干
  type: QuestionType            // 类型（使用上面定义的类型）
  difficulty: DifficultyLevel   // 难度
  categoryId: string            // 分类 ID（外键）
  tagIds: string[]              // 标签 ID 列表（多对多）
  options?: Option[]            // 选项（选择题）
  answer: string | string[]     // 答案（支持单选和多选）
  explanation?: string          // 解析
  createdAt: string             // ISO 时间字符串
  updatedAt: string
}
```

**设计原则：**
1. **ID 使用字符串**：兼容 UUID，便于前后端统一
2. **时间使用 ISO 字符串**：JSON 序列化友好
3. **可选字段使用 `?`**：明确哪些字段可以为空
4. **联合类型**：`answer: string | string[]` 支持多种答案格式

### 5.3 表单值与实体分离

```typescript
// 实体接口（完整数据）
export interface Question {
  id: string
  title: string
  // ... 所有字段
  createdAt: string
  updatedAt: string
}

// 表单值接口（用户输入）
export interface QuestionFormValues {
  title: string
  content: string
  type: QuestionType
  difficulty: DifficultyLevel
  categoryId: string
  tagIds: string[]
  options?: Option[]
  answer: string | string[]
  explanation?: string
  // 注意：没有 id、createdAt、updatedAt
}
```

**设计思想：**
- **实体**：数据库/存储中的完整数据
- **表单值**：用户可编辑的字段
- 分离后，创建和更新操作更清晰

### 5.4 错误类型设计

```typescript
// 错误类型枚举
export const ErrorType = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_ERROR: 'DUPLICATE_ERROR',
  CONSTRAINT_ERROR: 'CONSTRAINT_ERROR',
  STORAGE_ERROR: 'STORAGE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const

// 错误接口
export interface AppError {
  type: ErrorType
  message: string
  field?: string           // 关联的表单字段
  details?: Record<string, unknown>
}
```

**技巧：** 统一错误格式便于：
- 前端统一处理错误
- 表单字段级错误提示
- 日志记录和监控

---

## 6. 服务层架构

### 6.1 服务层设计原则

```
┌─────────────────────────────────────────────────────────────┐
│                     Service Layer                            │
│                                                              │
│  职责：                                                       │
│  1. 封装数据访问逻辑                                          │
│  2. 实现业务规则验证                                          │
│  3. 提供统一的错误处理                                        │
│  4. 与存储层解耦                                              │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │questionSvc  │  │ categorySvc │  │   tagSvc    │         │
│  │             │  │             │  │             │         │
│  │ - CRUD      │  │ - CRUD      │  │ - CRUD      │         │
│  │ - 筛选      │  │ - 树形结构   │  │ - 关联清理   │         │
│  │ - 分页      │  │ - 层级限制   │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│         │                │                │                 │
│         └────────────────┼────────────────┘                 │
│                          ▼                                   │
│                   ┌─────────────┐                           │
│                   │   storage   │                           │
│                   │ (工具函数)   │                           │
│                   └─────────────┘                           │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 questionService.ts 详解

```typescript
/**
 * 自定义错误类
 * 继承 Error 并实现 AppError 接口
 */
export class ServiceError extends Error implements AppError {
  type: ErrorType
  field?: string
  details?: Record<string, unknown>

  constructor(type: ErrorType, message: string, field?: string) {
    super(message)
    this.name = 'ServiceError'
    this.type = type
    this.field = field
  }
}
```

**技巧：** 自定义错误类的好处：
1. `instanceof` 检查：`if (error instanceof ServiceError)`
2. 携带额外信息：错误类型、关联字段
3. 统一错误处理逻辑

### 6.3 筛选与分页实现

```typescript
export function getQuestions(
  filters: QuestionFilters = { page: 1, pageSize: 10 }
): PaginatedResponse<Question> {
  let questions = getAllQuestions()

  // 1. 关键词搜索（标题和内容）
  if (filters.keyword?.trim()) {
    const keyword = filters.keyword.toLowerCase().trim()
    questions = questions.filter(
      q =>
        q.title.toLowerCase().includes(keyword) ||
        q.content.toLowerCase().includes(keyword)
    )
  }

  // 2. 分类筛选
  if (filters.categoryId) {
    questions = questions.filter(q => q.categoryId === filters.categoryId)
  }

  // 3. 题目类型筛选
  if (filters.type) {
    questions = questions.filter(q => q.type === filters.type)
  }

  // 4. 难度筛选
  if (filters.difficulty) {
    questions = questions.filter(q => q.difficulty === filters.difficulty)
  }

  // 5. 标签筛选（包含任意一个标签即可）
  if (filters.tagIds && filters.tagIds.length > 0) {
    questions = questions.filter(q =>
      filters.tagIds!.some(tagId => q.tagIds.includes(tagId))
    )
  }

  // 6. 排序（按创建时间倒序）
  questions.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  // 7. 分页
  const total = questions.length
  const { page, pageSize } = filters
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = questions.slice(startIndex, endIndex)

  return {
    data: paginatedData,
    total,
    page,
    pageSize,
  }
}
```

**设计要点：**
1. **链式筛选**：每个条件独立判断，可组合
2. **可选参数**：使用 `?.` 和 `&&` 安全访问
3. **大小写不敏感**：搜索时统一转小写
4. **分页计算**：`(page - 1) * pageSize` 计算起始索引

### 6.4 categoryService.ts - 树形结构处理

```typescript
/**
 * 将分类列表转换为树形结构
 * 递归构建，支持无限层级
 */
export function getCategoryTree(): CategoryTreeNode[] {
  const categories = getAllCategories()

  function buildTree(parentId: string | null): CategoryTreeNode[] {
    return categories
      .filter(c => c.parentId === parentId)  // 找到当前层级的分类
      .map(category => ({
        key: category.id,
        title: category.name,
        children: buildTree(category.id),    // 递归构建子树
        data: category,                       // 保留原始数据
      }))
  }

  // 从顶级分类开始构建
  return categories
    .filter(c => c.parentId === null)
    .map(category => ({
      key: category.id,
      title: category.name,
      children: buildTree(category.id),
      data: category,
    }))
}
```

**递归技巧：**
1. **终止条件**：当没有子分类时，`filter` 返回空数组
2. **数据保留**：`data` 字段保留原始分类数据，便于后续操作
3. **Ant Design 兼容**：`key`、`title`、`children` 是 Tree 组件需要的字段

### 6.5 层级限制实现

```typescript
/**
 * 计算分类层级
 */
function calculateLevel(parentId: string | null): number {
  if (!parentId) return 1  // 顶级分类是第 1 级
  const parent = getCategoryById(parentId)
  return parent ? parent.level + 1 : 1
}

/**
 * 创建分类时检查层级
 */
export function createCategory(data: CategoryFormValues): Category {
  // 检查层级限制
  const level = calculateLevel(data.parentId)
  if (level > MAX_CATEGORY_LEVEL) {  // MAX_CATEGORY_LEVEL = 3
    throw new ServiceError(
      ErrorType.CONSTRAINT_ERROR,
      `分类层级不能超过 ${MAX_CATEGORY_LEVEL} 级`,
      'parentId'
    )
  }
  // ...
}
```

### 6.6 tagService.ts - 关联清理

```typescript
/**
 * 删除标签时自动清理关联
 */
export function deleteTag(id: string): void {
  const tags = getAllTags()
  const index = tags.findIndex(t => t.id === id)

  if (index === -1) {
    throw new ServiceError(ErrorType.NOT_FOUND, '标签不存在', 'id')
  }

  // 关键：移除所有题目中对该标签的引用
  removeTagFromQuestions(id)

  // 删除标签
  tags.splice(index, 1)
  saveAllTags(tags)
}

// questionService.ts 中的实现
export function removeTagFromQuestions(tagId: string): void {
  const questions = getAllQuestions()
  let hasChanges = false

  const updatedQuestions = questions.map(q => {
    if (q.tagIds.includes(tagId)) {
      hasChanges = true
      return {
        ...q,
        tagIds: q.tagIds.filter(id => id !== tagId),
        updatedAt: new Date().toISOString(),
      }
    }
    return q
  })

  if (hasChanges) {
    saveAllQuestions(updatedQuestions)
  }
}
```

**设计思想：**
- **级联操作**：删除标签时自动清理关联
- **数据一致性**：避免悬空引用
- **性能优化**：只在有变化时才保存

---

## 7. 状态管理方案

### 7.1 状态分类策略

```
┌─────────────────────────────────────────────────────────────┐
│                     状态管理策略                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────┐    ┌─────────────────────┐        │
│  │   Server State      │    │   Client State      │        │
│  │   (服务端状态)       │    │   (客户端状态)       │        │
│  ├─────────────────────┤    ├─────────────────────┤        │
│  │ • 题目列表          │    │ • 筛选条件          │        │
│  │ • 分类数据          │    │ • 侧边栏折叠        │        │
│  │ • 标签数据          │    │ • 主题设置          │        │
│  │ • 单个题目详情      │    │ • 表单临时状态      │        │
│  ├─────────────────────┤    ├─────────────────────┤        │
│  │ 工具: TanStack Query│    │ 工具: Zustand       │        │
│  │                     │    │                     │        │
│  │ 特点:               │    │ 特点:               │        │
│  │ • 自动缓存          │    │ • 轻量简洁          │        │
│  │ • 自动重试          │    │ • 无 boilerplate    │        │
│  │ • 后台刷新          │    │ • 支持持久化        │        │
│  │ • 乐观更新          │    │ • 选择器优化        │        │
│  └─────────────────────┘    └─────────────────────┘        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 TanStack Query 配置

```typescript
// lib/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5分钟内数据被认为是新鲜的
      gcTime: 10 * 60 * 1000,        // 缓存保留10分钟
      retry: 1,                       // 失败重试1次
      refetchOnWindowFocus: false,   // 窗口聚焦不刷新（本地数据）
      refetchOnReconnect: false,     // 重连不刷新
    },
    mutations: {
      retry: 0,                       // mutation 不重试
    },
  },
})
```

**配置解释：**
- `staleTime`：数据新鲜期，期间不会重新请求
- `gcTime`：垃圾回收时间，未使用的缓存保留时长
- `refetchOnWindowFocus`：关闭是因为使用 localStorage，数据不会外部变化

### 7.3 Query Keys 设计

```typescript
/**
 * Query Keys 常量
 * 集中管理所有查询的 key，便于缓存失效和重新获取
 */
export const queryKeys = {
  // 题目相关
  questions: {
    all: ['questions'] as const,
    lists: () => [...queryKeys.questions.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.questions.lists(), filters] as const,
    details: () => [...queryKeys.questions.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.questions.details(), id] as const,
  },
  // 分类相关
  categories: {
    all: ['categories'] as const,
    lists: () => [...queryKeys.categories.all, 'list'] as const,
    tree: () => [...queryKeys.categories.all, 'tree'] as const,
  },
  // 标签相关
  tags: {
    all: ['tags'] as const,
    lists: () => [...queryKeys.tags.all, 'list'] as const,
  },
} as const
```

**设计模式：Query Key Factory**

```
queryKeys.questions.all        → ['questions']
queryKeys.questions.lists()    → ['questions', 'list']
queryKeys.questions.list({...})→ ['questions', 'list', {...}]
queryKeys.questions.detail(id) → ['questions', 'detail', id]
```

**好处：**
1. **层级失效**：`invalidateQueries({ queryKey: queryKeys.questions.all })` 会失效所有题目相关缓存
2. **精确失效**：`invalidateQueries({ queryKey: queryKeys.questions.detail(id) })` 只失效特定题目
3. **类型安全**：`as const` 确保类型推断正确

### 7.4 Zustand Store 设计

```typescript
// stores/filterStore.ts
import { create } from 'zustand'

interface FilterState {
  questionFilters: QuestionFilters
}

interface FilterActions {
  setQuestionFilters: (filters: Partial<QuestionFilters>) => void
  resetQuestionFilters: () => void
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
}

export const useFilterStore = create<FilterState & FilterActions>((set) => ({
  // 初始状态
  questionFilters: { ...defaultFilters },

  // 操作方法
  setQuestionFilters: (filters) =>
    set((state) => ({
      questionFilters: {
        ...state.questionFilters,
        ...filters,
        page: filters.page ?? 1,  // 筛选条件改变时重置页码
      },
    })),

  resetQuestionFilters: () =>
    set({ questionFilters: { ...defaultFilters } }),

  setPage: (page) =>
    set((state) => ({
      questionFilters: { ...state.questionFilters, page },
    })),

  setPageSize: (pageSize) =>
    set((state) => ({
      questionFilters: {
        ...state.questionFilters,
        pageSize,
        page: 1,  // 改变每页数量时重置到第一页
      },
    })),
}))
```

**Zustand 技巧：**
1. **合并状态和操作**：`FilterState & FilterActions`
2. **部分更新**：`set((state) => ({ ...state, ...newState }))`
3. **派生操作**：`setPage` 和 `setPageSize` 是 `setQuestionFilters` 的特化版本

### 7.5 持久化 Store

```typescript
// stores/uiStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUIStore = create<UIState & UIActions>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      currentTheme: 'light',

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setTheme: (theme) =>
        set({ currentTheme: theme }),
    }),
    {
      name: 'question_manager_ui_state',  // localStorage key
    }
  )
)
```

**persist 中间件：**
- 自动将状态保存到 localStorage
- 页面刷新后自动恢复状态
- 支持自定义序列化和存储引擎

---

## 8. 自定义 Hooks

### 8.1 Hook 设计原则

```
┌─────────────────────────────────────────────────────────────┐
│                    Custom Hooks 设计原则                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. 单一职责：每个 Hook 只做一件事                            │
│  2. 封装复杂性：隐藏 Query/Mutation 细节                      │
│  3. 返回友好 API：解构后即可使用                              │
│  4. 处理加载和错误状态                                        │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    useQuestions                         ││
│  │  ┌─────────────┐    ┌─────────────┐                    ││
│  │  │   Input     │    │   Output    │                    ││
│  │  │ • filters   │ →  │ • questions │                    ││
│  │  │             │    │ • total     │                    ││
│  │  │             │    │ • isLoading │                    ││
│  │  │             │    │ • error     │                    ││
│  │  │             │    │ • refetch   │                    ││
│  │  └─────────────┘    └─────────────┘                    ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 useQuestions - 列表查询 Hook

```typescript
export function useQuestions(filters?: QuestionFilters) {
  // 如果没有传入 filters，使用 store 中的筛选条件
  const storeFilters = useFilterStore((state) => state.questionFilters)
  const activeFilters = filters ?? storeFilters

  const query = useQuery({
    queryKey: queryKeys.questions.list(activeFilters as unknown as Record<string, unknown>),
    queryFn: () => getQuestions(activeFilters),
  })

  // 返回友好的 API
  return {
    questions: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    page: query.data?.page ?? activeFilters.page,
    pageSize: query.data?.pageSize ?? activeFilters.pageSize,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  }
}
```

**设计要点：**
1. **可选参数**：支持传入 filters 或使用 store 中的
2. **默认值处理**：`query.data?.data ?? []` 避免 undefined
3. **状态分离**：`isLoading`（首次加载）vs `isFetching`（后台刷新）

### 8.3 useQuestion - 单个题目 CRUD Hook

```typescript
export function useQuestion(id?: string) {
  const queryClient = useQueryClient()

  // 查询单个题目
  const query = useQuery({
    queryKey: queryKeys.questions.detail(id ?? ''),
    queryFn: () => getQuestionById(id!),
    enabled: !!id,  // 只有传入 id 时才查询
  })

  // 创建题目
  const createMutation = useMutation({
    mutationFn: async (data: QuestionFormValues) => {
      return createQuestion(data)
    },
    onSuccess: () => {
      // 创建成功后，失效列表缓存
      queryClient.invalidateQueries({ queryKey: queryKeys.questions.lists() })
    },
  })

  // 更新题目
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: QuestionFormValues }) => {
      return updateQuestion(id, data)
    },
    onSuccess: (updatedQuestion: Question) => {
      // 更新成功后，直接更新缓存（乐观更新）
      queryClient.setQueryData(
        queryKeys.questions.detail(updatedQuestion.id),
        updatedQuestion
      )
      // 同时失效列表缓存
      queryClient.invalidateQueries({ queryKey: queryKeys.questions.lists() })
    },
  })

  // 删除题目
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      deleteQuestion(id)
      return id
    },
    onSuccess: (deletedId) => {
      // 删除成功后，移除详情缓存
      queryClient.removeQueries({ queryKey: queryKeys.questions.detail(deletedId) })
      // 失效列表缓存
      queryClient.invalidateQueries({ queryKey: queryKeys.questions.lists() })
    },
  })

  return {
    question: query.data as Question | null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,

    create: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,

    update: (data: QuestionFormValues) =>
      updateMutation.mutateAsync({ id: id!, data }),
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,

    remove: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
  }
}
```

**缓存策略：**
1. **invalidateQueries**：标记缓存为过期，下次访问时重新获取
2. **setQueryData**：直接更新缓存，无需重新请求
3. **removeQueries**：删除缓存条目

### 8.4 useCategories - 分类管理 Hook

```typescript
export function useCategories() {
  const queryClient = useQueryClient()

  // 列表查询
  const listQuery = useQuery({
    queryKey: queryKeys.categories.lists(),
    queryFn: getAllCategories,
  })

  // 树形结构查询
  const treeQuery = useQuery({
    queryKey: queryKeys.categories.tree(),
    queryFn: getCategoryTree,
  })

  // 统一失效函数
  const invalidateCategories = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.categories.all })
  }

  // CRUD mutations...

  return {
    categories: listQuery.data ?? [],
    treeData: treeQuery.data ?? [],
    isLoading: listQuery.isLoading || treeQuery.isLoading,
    // ...
  }
}
```

**技巧：** 同时维护列表和树形两种数据结构，满足不同场景需求。

---

## 9. 组件设计模式

### 9.1 组件分类

```
┌─────────────────────────────────────────────────────────────┐
│                      组件分类                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────┐    ┌─────────────────────┐        │
│  │   Page Components   │    │  Feature Components │        │
│  │   (页面组件)         │    │  (功能组件)          │        │
│  ├─────────────────────┤    ├─────────────────────┤        │
│  │ • 路由入口          │    │ • 业务逻辑封装       │        │
│  │ • 组合子组件        │    │ • 可复用            │        │
│  │ • 页面级状态        │    │ • Props 驱动        │        │
│  │                     │    │                     │        │
│  │ 示例:               │    │ 示例:               │        │
│  │ • QuestionListPage  │    │ • QuestionFilter    │        │
│  │ • CategoryManagePage│    │ • QuestionForm      │        │
│  └─────────────────────┘    │ • QuestionTable     │        │
│                              └─────────────────────┘        │
│                                                              │
│  ┌─────────────────────┐                                    │
│  │  Layout Components  │                                    │
│  │  (布局组件)          │                                    │
│  ├─────────────────────┤                                    │
│  │ • 页面结构          │                                    │
│  │ • 导航菜单          │                                    │
│  │ • 响应式布局        │                                    │
│  │                     │                                    │
│  │ 示例:               │                                    │
│  │ • MainLayout        │                                    │
│  └─────────────────────┘                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 MainLayout - 布局组件

```typescript
export function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken()

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
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        {/* Logo */}
        <div style={{ height: 64, /* ... */ }}>
          {sidebarCollapsed ? '题库' : '题目管理系统'}
        </div>

        {/* 导航菜单 */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      {/* 主内容区 */}
      <Layout style={{ marginLeft: sidebarCollapsed ? 80 : 200 }}>
        <Header>
          <Button onClick={toggleSidebar}>
            {sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </Button>
        </Header>

        <Content>
          <Outlet />  {/* 子路由渲染位置 */}
        </Content>
      </Layout>
    </Layout>
  )
}
```

**设计要点：**
1. **固定侧边栏**：`position: fixed` 保持侧边栏固定
2. **响应式折叠**：`breakpoint="lg"` 在小屏幕自动折叠
3. **动态边距**：`marginLeft` 根据折叠状态调整
4. **路由高亮**：`selectedKeys={[location.pathname]}` 高亮当前路由

### 9.3 QuestionForm - 复杂表单组件

```typescript
export function QuestionForm({
  initialValues,
  categories,
  tags,
  onSubmit,
  onCancel,
  loading,
}: QuestionFormProps) {
  const [form] = Form.useForm()
  const questionType = Form.useWatch('type', form)  // 监听类型变化

  // 初始化表单值
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues)
    } else {
      form.setFieldsValue({
        type: QuestionType.SINGLE_CHOICE,
        difficulty: DifficultyLevel.EASY,
        options: [
          { id: generateShortId(), content: '', isCorrect: false },
          { id: generateShortId(), content: '', isCorrect: false },
        ],
      })
    }
  }, [initialValues, form])

  // 是否是选择题
  const isChoiceQuestion = [
    QuestionType.SINGLE_CHOICE,
    QuestionType.MULTIPLE_CHOICE,
    QuestionType.TRUE_FALSE,
  ].includes(questionType)

  // 处理题目类型变化
  const handleTypeChange = (type: QuestionType) => {
    if (type === QuestionType.TRUE_FALSE) {
      form.setFieldsValue({
        options: [
          { id: generateShortId(), content: '正确', isCorrect: false },
          { id: generateShortId(), content: '错误', isCorrect: false },
        ],
      })
    }
  }

  return (
    <Form form={form} layout="vertical">
      {/* 基本信息 */}
      <Form.Item name="title" label="题目标题" rules={[{ required: true }]}>
        <Input maxLength={200} showCount />
      </Form.Item>

      {/* 选择题选项 - 动态表单 */}
      {isChoiceQuestion && (
        <Form.List name="options">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name }) => (
                <Space key={key}>
                  <Form.Item name={[name, 'isCorrect']}>
                    <Select options={[
                      { value: true, label: '✓ 正确' },
                      { value: false, label: '✗ 错误' },
                    ]} />
                  </Form.Item>
                  <Form.Item name={[name, 'content']}>
                    <Input placeholder={`选项 ${String.fromCharCode(65 + index)}`} />
                  </Form.Item>
                  {fields.length > 2 && (
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  )}
                </Space>
              ))}
              <Button onClick={() => add({ id: generateShortId(), content: '', isCorrect: false })}>
                添加选项
              </Button>
            </>
          )}
        </Form.List>
      )}
    </Form>
  )
}
```

**表单技巧：**
1. **Form.useWatch**：监听字段变化，实现条件渲染
2. **Form.List**：动态表单项，支持增删
3. **条件渲染**：根据题目类型显示不同的表单区域
4. **受控初始化**：`useEffect` 中设置初始值

### 9.4 QuestionTable - 表格组件

```typescript
export function QuestionTable({
  questions,
  loading,
  pagination,
  onEdit,
  onDelete,
  onPageChange,
}: QuestionTableProps) {
  const columns: ColumnsType<Question> = [
    {
      title: '题目标题',
      dataIndex: 'title',
      ellipsis: true,
      render: (title) => (
        <Tooltip title={title}>
          <span>{title}</span>
        </Tooltip>
      ),
    },
    {
      title: '题目类型',
      dataIndex: 'type',
      width: 100,
      render: (type) => (
        <Tag>{QUESTION_TYPE_LABELS[type]}</Tag>
      ),
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      width: 80,
      render: (difficulty) => (
        <Tag color={DIFFICULTY_COLORS[difficulty]}>
          {DIFFICULTY_LABELS[difficulty]}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => onEdit(record.id)}>编辑</Button>
          <Button type="link" danger onClick={() => onDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      dataSource={questions}
      rowKey="id"
      loading={loading}
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 道题目`,
        onChange: onPageChange,
      }}
    />
  )
}
```

**表格技巧：**
1. **ellipsis + Tooltip**：长文本截断并悬浮显示完整内容
2. **render 函数**：自定义单元格渲染
3. **受控分页**：通过 props 控制分页状态
4. **rowKey**：指定唯一键，避免 React 警告

---

## 10. 路由与懒加载

### 10.1 路由配置

```typescript
// router/index.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { Spin } from 'antd'
import { MainLayout } from '@/components/layout'

// 懒加载页面组件
const HomePage = lazy(() => import('@/pages/Home'))
const QuestionListPage = lazy(() => import('@/pages/QuestionList'))
const QuestionFormPage = lazy(() => import('@/pages/QuestionForm'))
const CategoryManagePage = lazy(() => import('@/pages/CategoryManage'))
const TagManagePage = lazy(() => import('@/pages/TagManage'))

// 加载中组件
const Loading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: 50 }}>
    <Spin size="large" />
  </div>
)

// 包装懒加载组件
const withSuspense = (Component: React.LazyExoticComponent<any>) => (
  <Suspense fallback={<Loading />}>
    <Component />
  </Suspense>
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: withSuspense(HomePage),
      },
      {
        path: 'questions',
        children: [
          { index: true, element: withSuspense(QuestionListPage) },
          { path: 'create', element: withSuspense(QuestionFormPage) },
          { path: 'edit/:id', element: withSuspense(QuestionFormPage) },
        ],
      },
      { path: 'categories', element: withSuspense(CategoryManagePage) },
      { path: 'tags', element: withSuspense(TagManagePage) },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
```

### 10.2 懒加载原理

```
┌─────────────────────────────────────────────────────────────┐
│                     懒加载工作流程                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. 初始加载                                                 │
│     ┌─────────────────────────────────────────────────────┐ │
│     │  main.tsx → App.tsx → MainLayout                    │ │
│     │  (只加载必要的代码)                                   │ │
│     └─────────────────────────────────────────────────────┘ │
│                                                              │
│  2. 访问 /questions                                         │
│     ┌─────────────────────────────────────────────────────┐ │
│     │  触发 lazy(() => import('@/pages/QuestionList'))    │ │
│     │  ↓                                                   │ │
│     │  显示 <Loading /> (Suspense fallback)               │ │
│     │  ↓                                                   │ │
│     │  加载 QuestionList chunk                            │ │
│     │  ↓                                                   │ │
│     │  渲染 QuestionListPage                              │ │
│     └─────────────────────────────────────────────────────┘ │
│                                                              │
│  3. 代码分割结果                                             │
│     ┌─────────────────────────────────────────────────────┐ │
│     │  dist/                                               │ │
│     │  ├── index.html                                      │ │
│     │  ├── assets/                                         │ │
│     │  │   ├── index-[hash].js      (主包)                │ │
│     │  │   ├── Home-[hash].js       (首页 chunk)          │ │
│     │  │   ├── QuestionList-[hash].js                     │ │
│     │  │   ├── QuestionForm-[hash].js                     │ │
│     │  │   ├── CategoryManage-[hash].js                   │ │
│     │  │   └── TagManage-[hash].js                        │ │
│     └─────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**懒加载好处：**
1. **首屏加载快**：只加载当前路由需要的代码
2. **按需加载**：访问新页面时才加载对应代码
3. **缓存友好**：每个 chunk 独立缓存

### 10.3 页面组件导出规范

```typescript
// pages/QuestionList/index.tsx
export function QuestionListPage() {
  // ...
}

// 默认导出用于懒加载
export default QuestionListPage
```

**技巧：** 同时提供命名导出和默认导出：
- 命名导出：用于测试和直接导入
- 默认导出：用于 `lazy()` 动态导入

---

## 11. 测试策略

### 11.1 测试金字塔

```
                    ┌───────────┐
                    │   E2E     │  少量
                    │  Tests    │
                   ─┴───────────┴─
                  ┌───────────────┐
                  │  Integration  │  适量
                  │    Tests      │
                 ─┴───────────────┴─
                ┌───────────────────┐
                │    Unit Tests     │  大量
                │  Property Tests   │
               ─┴───────────────────┴─
```

### 11.2 属性测试 (Property-Based Testing)

```typescript
// questionService.test.ts
import * as fc from 'fast-check'

/**
 * Property 3: 筛选结果正确性
 * For any 筛选条件组合，返回的所有题目都应满足所有指定的筛选条件。
 */
describe('Property 3: Filter Results Correctness', () => {
  it('should filter by difficulty correctly', () => {
    fc.assert(
      fc.property(
        // 生成随机题目数组
        fc.array(questionFormArbitrary, { minLength: 5, maxLength: 20 }),
        // 生成随机难度
        fc.constantFrom(...Object.values(DifficultyLevel)),
        // 测试逻辑
        (questions, targetDifficulty) => {
          localStorageMock.clear()
          questions.forEach(q => createQuestion(q))

          const result = getQuestions({
            difficulty: targetDifficulty,
            page: 1,
            pageSize: 100,
          })

          // 断言：所有返回的题目都应该匹配筛选条件
          result.data.forEach(q => {
            expect(q.difficulty).toBe(targetDifficulty)
          })
        }
      ),
      { numRuns: 50 }  // 运行 50 次
    )
  })
})
```

**属性测试 vs 单元测试：**

| 特性 | 单元测试 | 属性测试 |
|------|----------|----------|
| 输入 | 手动指定 | 自动生成 |
| 覆盖范围 | 有限用例 | 大量随机用例 |
| 发现边界情况 | 依赖经验 | 自动发现 |
| 适用场景 | 具体行为 | 通用属性 |

### 11.3 Arbitrary 生成器

```typescript
// 生成随机题目的 Arbitrary
const questionFormArbitrary = fc.record({
  title: fc.string({ minLength: 1, maxLength: 100 }),
  content: fc.string({ minLength: 1, maxLength: 500 }),
  type: fc.constantFrom(...Object.values(QuestionType)),
  difficulty: fc.constantFrom(...Object.values(DifficultyLevel)),
  categoryId: fc.string({ minLength: 1, maxLength: 20 }),
  tagIds: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }),
  answer: fc.string({ minLength: 1, maxLength: 200 }),
  explanation: fc.option(fc.string({ maxLength: 300 }), { nil: undefined }),
}) as fc.Arbitrary<QuestionFormValues>
```

**fast-check 常用生成器：**

| 生成器 | 说明 | 示例 |
|--------|------|------|
| `fc.string()` | 随机字符串 | `fc.string({ minLength: 1 })` |
| `fc.integer()` | 随机整数 | `fc.integer({ min: 1, max: 100 })` |
| `fc.boolean()` | 随机布尔值 | `fc.boolean()` |
| `fc.constantFrom()` | 从常量中选择 | `fc.constantFrom('a', 'b', 'c')` |
| `fc.array()` | 随机数组 | `fc.array(fc.string())` |
| `fc.record()` | 随机对象 | `fc.record({ name: fc.string() })` |
| `fc.option()` | 可选值 | `fc.option(fc.string(), { nil: undefined })` |

### 11.4 Mock localStorage

```typescript
// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})
```

**技巧：** 使用闭包创建隔离的存储，每个测试可以独立清理。

### 11.5 测试配置

```typescript
// test/setup.ts
import '@testing-library/jest-dom'
```

**@testing-library/jest-dom 提供的断言：**
- `toBeInTheDocument()`
- `toHaveTextContent()`
- `toBeVisible()`
- `toBeDisabled()`
- `toHaveClass()`

---

## 12. 最佳实践总结

### 12.1 代码组织

| 实践 | 说明 |
|------|------|
| **Barrel 导出** | 使用 `index.ts` 统一导出，简化导入路径 |
| **路径别名** | 使用 `@/` 替代相对路径 |
| **类型集中** | 所有类型定义在 `types/index.ts` |
| **常量集中** | 所有常量定义在 `constants/index.ts` |

### 12.2 状态管理

| 实践 | 说明 |
|------|------|
| **状态分类** | Server State 用 TanStack Query，Client State 用 Zustand |
| **Query Keys** | 使用 Factory 模式管理 Query Keys |
| **缓存策略** | 合理设置 staleTime 和 gcTime |
| **乐观更新** | 更新成功后直接更新缓存 |

### 12.3 组件设计

| 实践 | 说明 |
|------|------|
| **Props 驱动** | 功能组件通过 Props 接收数据和回调 |
| **Hooks 封装** | 复杂逻辑封装到自定义 Hooks |
| **条件渲染** | 使用 `&&` 和三元运算符 |
| **表单验证** | 使用 Ant Design Form 的 rules |

### 12.4 性能优化

| 实践 | 说明 |
|------|------|
| **懒加载** | 页面组件使用 `lazy()` 动态导入 |
| **Suspense** | 配合 Suspense 显示加载状态 |
| **选择器** | Zustand 使用选择器避免不必要的重渲染 |
| **缓存** | TanStack Query 自动缓存数据 |

### 12.5 类型安全

| 实践 | 说明 |
|------|------|
| **严格模式** | 启用 TypeScript 严格模式 |
| **const 枚举** | 使用 `as const` 替代 enum |
| **泛型** | 使用泛型提高代码复用性 |
| **类型推断** | 利用 TypeScript 的类型推断 |

### 12.6 测试策略

| 实践 | 说明 |
|------|------|
| **属性测试** | 使用 fast-check 测试通用属性 |
| **Mock** | 隔离外部依赖（localStorage） |
| **覆盖率** | 关注核心业务逻辑的覆盖率 |
| **测试命名** | 清晰描述测试的预期行为 |

---

## 附录：文件清单

| 文件路径 | 作用 |
|----------|------|
| `src/main.tsx` | 应用入口，挂载 React 应用 |
| `src/App.tsx` | 根组件，配置全局 Provider |
| `src/types/index.ts` | 所有类型定义 |
| `src/constants/index.ts` | 常量配置 |
| `src/utils/storage.ts` | localStorage 封装 |
| `src/utils/id.ts` | ID 生成器 |
| `src/services/questionService.ts` | 题目业务逻辑 |
| `src/services/categoryService.ts` | 分类业务逻辑 |
| `src/services/tagService.ts` | 标签业务逻辑 |
| `src/stores/filterStore.ts` | 筛选条件状态 |
| `src/stores/uiStore.ts` | UI 状态（持久化） |
| `src/lib/queryClient.ts` | TanStack Query 配置 |
| `src/hooks/useQuestions.ts` | 题目列表 Hook |
| `src/hooks/useQuestion.ts` | 单个题目 CRUD Hook |
| `src/hooks/useCategories.ts` | 分类管理 Hook |
| `src/hooks/useTags.ts` | 标签管理 Hook |
| `src/components/layout/MainLayout.tsx` | 主布局组件 |
| `src/components/question/QuestionFilter.tsx` | 筛选组件 |
| `src/components/question/QuestionForm.tsx` | 表单组件 |
| `src/components/question/QuestionTable.tsx` | 表格组件 |
| `src/pages/*/index.tsx` | 页面组件 |
| `src/router/index.tsx` | 路由配置 |
| `vite.config.ts` | Vite 配置 |
| `vitest.config.ts` | Vitest 配置 |
| `tsconfig.json` | TypeScript 配置 |
