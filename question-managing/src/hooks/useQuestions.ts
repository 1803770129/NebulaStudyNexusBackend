/**
 * 题目列表 Hook
 * 
 * 封装题目列表的查询逻辑，支持筛选和分页
 * 
 * 学习要点：
 * 1. React Query 的使用方式
 * 2. 查询键（queryKey）的设计
 * 3. 加载状态和错误状态的处理
 * 4. 数据缓存和自动刷新
 */

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryClient'
import { getQuestions } from '@/services/questionService'
import type { QuestionFilters, AppError } from '@/types'
import { useFilterStore } from '@/stores'

/**
 * useQuestions Hook
 * 
 * @param filters - 可选的筛选条件，如果不传则使用 store 中的筛选条件
 * @returns 题目列表数据和状态
 * 
 * 示例：
 * ```tsx
 * function QuestionList() {
 *   const { questions, isLoading, error, refetch } = useQuestions({
 *     page: 1,
 *     pageSize: 10,
 *     keyword: '数学'
 *   });
 * 
 *   if (isLoading) return <Spin />;
 *   if (error) return <Alert message={error.message} type="error" />;
 * 
 *   return <Table dataSource={questions} />;
 * }
 * ```
 */
export function useQuestions(filters?: QuestionFilters) {
  // 从 store 获取默认筛选条件
  const storeFilters = useFilterStore((state) => state.questionFilters)
  const activeFilters = filters ?? storeFilters

  // 使用 React Query 进行数据查询
  const query = useQuery({
    // 查询键：用于缓存和自动刷新
    // 当 activeFilters 变化时，会自动重新查询
    queryKey: queryKeys.questions.list(activeFilters as unknown as Record<string, unknown>),
    // 查询函数：调用服务层方法
    queryFn: () => getQuestions(activeFilters),
    // 配置选项
    staleTime: 30 * 1000, // 30秒内数据被认为是新鲜的，不会重新请求
    retry: 2, // 失败时重试2次
  })

  return {
    // 数据
    questions: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    page: query.data?.page ?? activeFilters.page,
    pageSize: query.data?.pageSize ?? activeFilters.pageSize,
    
    // 状态
    isLoading: query.isLoading,  // 首次加载
    isFetching: query.isFetching, // 任何加载（包括后台刷新）
    isError: query.isError,
    error: query.error as AppError | null,
    
    // 方法
    refetch: query.refetch,
  }
}
