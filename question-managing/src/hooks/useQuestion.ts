/**
 * 单个题目操作 Hook
 * 
 * 封装单个题目的查询和 CRUD 操作
 * 
 * 学习要点：
 * 1. useMutation 的使用方式
 * 2. 乐观更新（Optimistic Updates）
 * 3. 缓存失效策略
 * 4. 错误处理
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryClient'
import {
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from '@/services/questionService'
import type { Question, QuestionFormValues, AppError } from '@/types'

/**
 * useQuestion Hook
 * 
 * @param id - 题目 ID，如果不传则不查询
 * @returns 题目数据和操作方法
 * 
 * 示例：
 * ```tsx
 * // 查询题目
 * const { question, isLoading } = useQuestion('xxx-id');
 * 
 * // 创建题目
 * const { create, isCreating } = useQuestion();
 * await create({ title: '新题目', ... });
 * 
 * // 更新题目
 * const { update, isUpdating } = useQuestion('xxx-id');
 * await update({ title: '更新后的标题' });
 * 
 * // 删除题目
 * const { remove, isDeleting } = useQuestion();
 * await remove('xxx-id');
 * ```
 */
export function useQuestion(id?: string) {
  const queryClient = useQueryClient()

  // 查询单个题目
  const query = useQuery({
    queryKey: queryKeys.questions.detail(id ?? ''),
    queryFn: () => getQuestionById(id!),
    enabled: !!id, // 只有传入 id 时才查询
    staleTime: 60 * 1000, // 1分钟内数据被认为是新鲜的
    retry: 2,
  })

  // 创建题目
  const createMutation = useMutation({
    mutationFn: (data: QuestionFormValues) => createQuestion(data),
    onSuccess: () => {
      // 创建成功后，使列表缓存失效，触发重新查询
      queryClient.invalidateQueries({ queryKey: queryKeys.questions.lists() })
    },
  })

  // 更新题目
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: QuestionFormValues }) => 
      updateQuestion(id, data),
    onSuccess: (updatedQuestion: Question) => {
      // 更新成功后，直接更新缓存中的数据（乐观更新）
      queryClient.setQueryData(
        queryKeys.questions.detail(updatedQuestion.id),
        updatedQuestion
      )
      // 同时使列表缓存失效
      queryClient.invalidateQueries({ queryKey: queryKeys.questions.lists() })
    },
  })

  // 删除题目
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteQuestion(id).then(() => id),
    onSuccess: (deletedId) => {
      // 删除成功后，移除缓存中的数据
      queryClient.removeQueries({ queryKey: queryKeys.questions.detail(deletedId) })
      // 使列表缓存失效
      queryClient.invalidateQueries({ queryKey: queryKeys.questions.lists() })
    },
  })

  return {
    // 查询结果
    question: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as AppError | null,
    refetch: query.refetch,

    // 创建操作
    create: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error as AppError | null,

    // 更新操作
    update: (data: QuestionFormValues) =>
      updateMutation.mutateAsync({ id: id!, data }),
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error as AppError | null,

    // 删除操作
    remove: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error as AppError | null,
  }
}
