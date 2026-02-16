/**
 * TanStack Query 客户端配置
 *
 * 配置全局的 QueryClient 实例
 */

import { QueryClient } from '@tanstack/react-query'

/**
 * 创建 QueryClient 实例
 *
 * 配置说明：
 * - staleTime: 数据被认为是新鲜的时间（5分钟）
 * - gcTime: 未使用的数据在缓存中保留的时间（10分钟）
 * - retry: 失败后重试次数
 * - refetchOnWindowFocus: 窗口获得焦点时是否重新获取数据
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 数据在 5 分钟内被认为是新鲜的
      staleTime: 5 * 60 * 1000,
      // 缓存数据保留 10 分钟
      gcTime: 10 * 60 * 1000,
      // 失败后重试 1 次
      retry: 1,
      // 窗口获得焦点时不自动重新获取（本地存储数据不需要）
      refetchOnWindowFocus: false,
      // 重新连接时不自动重新获取
      refetchOnReconnect: false,
    },
    mutations: {
      // mutation 失败后不重试
      retry: 0,
    },
  },
})

/**
 * Query Keys 常量
 *
 * 集中管理所有查询的 key，便于缓存失效和重新获取
 */
export const queryKeys = {
  // 题目相关
  questions: {
    all: ['questions'] as const,
    lists: () => [...queryKeys.questions.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.questions.lists(), filters] as const,
    details: () => [...queryKeys.questions.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.questions.details(), id] as const,
  },
  // 分类相关
  categories: {
    all: ['categories'] as const,
    lists: () => [...queryKeys.categories.all, 'list'] as const,
    tree: () => [...queryKeys.categories.all, 'tree'] as const,
    detail: (id: string) => [...queryKeys.categories.all, 'detail', id] as const,
  },
  // 标签相关
  tags: {
    all: ['tags'] as const,
    lists: () => [...queryKeys.tags.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.tags.all, 'detail', id] as const,
  },
  // 知识点相关
  knowledgePoints: {
    all: ['knowledgePoints'] as const,
    lists: () => [...queryKeys.knowledgePoints.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.knowledgePoints.lists(), filters] as const,
    tree: (categoryId?: string) =>
      categoryId
        ? ([...queryKeys.knowledgePoints.all, 'tree', categoryId] as const)
        : ([...queryKeys.knowledgePoints.all, 'tree'] as const),
    details: () => [...queryKeys.knowledgePoints.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.knowledgePoints.details(), id] as const,
    questions: (id: string) => [...queryKeys.knowledgePoints.detail(id), 'questions'] as const,
  },
  // 学生相关
  students: {
    all: ['students'] as const,
    lists: () => [...queryKeys.students.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.students.lists(), filters] as const,
    details: () => [...queryKeys.students.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.students.details(), id] as const,
  },
} as const
