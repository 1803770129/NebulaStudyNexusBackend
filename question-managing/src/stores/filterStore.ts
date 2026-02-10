/**
 * 筛选状态存储
 * 
 * 使用 Zustand 管理题目列表的筛选条件
 */

import { create } from 'zustand'
import type { QuestionFilters } from '@/types'
import { DEFAULT_PAGINATION } from '@/constants'

/**
 * 默认筛选条件
 */
const defaultFilters: QuestionFilters = {
  keyword: undefined,
  categoryId: undefined,
  type: undefined,
  difficulty: undefined,
  tagIds: undefined,
  knowledgePointIds: undefined,
  page: DEFAULT_PAGINATION.page,
  pageSize: DEFAULT_PAGINATION.pageSize,
}

/**
 * 筛选状态接口
 */
interface FilterState {
  /** 题目筛选条件 */
  questionFilters: QuestionFilters
}

/**
 * 筛选操作接口
 */
interface FilterActions {
  /** 设置筛选条件（部分更新） */
  setQuestionFilters: (filters: Partial<QuestionFilters>) => void
  /** 重置筛选条件 */
  resetQuestionFilters: () => void
  /** 设置页码 */
  setPage: (page: number) => void
  /** 设置每页数量 */
  setPageSize: (pageSize: number) => void
}

/**
 * Filter Store
 */
export const useFilterStore = create<FilterState & FilterActions>((set) => ({
  // 初始状态
  questionFilters: { ...defaultFilters },

  // 操作方法
  setQuestionFilters: (filters) =>
    set((state) => ({
      questionFilters: {
        ...state.questionFilters,
        ...filters,
        // 当筛选条件改变时，重置到第一页
        page: filters.page ?? 1,
      },
    })),

  resetQuestionFilters: () =>
    set({ questionFilters: { ...defaultFilters } }),

  setPage: (page) =>
    set((state) => ({
      questionFilters: {
        ...state.questionFilters,
        page,
      },
    })),

  setPageSize: (pageSize) =>
    set((state) => ({
      questionFilters: {
        ...state.questionFilters,
        pageSize,
        page: 1, // 改变每页数量时重置到第一页
      },
    })),
}))
