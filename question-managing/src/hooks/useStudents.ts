/**
 * 学生管理 Hook
 *
 * 封装学生列表查询、状态切换、删除操作
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryClient'
import { getStudents, updateStudentStatus, deleteStudent } from '@/services/studentService'
import type { StudentFilters, AppError } from '@/types'

/**
 * useStudents Hook
 *
 * @param filters - 筛选条件（keyword, isActive, page, limit）
 * @returns 学生列表数据和操作方法
 */
export function useStudents(filters: StudentFilters) {
  const queryClient = useQueryClient()

  // 分页查询学生列表
  const query = useQuery({
    queryKey: queryKeys.students.list(filters as unknown as Record<string, unknown>),
    queryFn: () => getStudents(filters),
  })

  // 使学生相关缓存失效
  const invalidateStudents = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.students.all })
  }

  // 切换状态
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateStudentStatus(id, isActive),
    onSuccess: invalidateStudents,
  })

  // 删除学生
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteStudent(id),
    onSuccess: invalidateStudents,
  })

  return {
    // 数据
    students: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    totalPages: query.data?.totalPages ?? 0,

    // 状态
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as AppError | null,

    // 刷新
    refetch: query.refetch,

    // 切换状态
    updateStatus: (id: string, isActive: boolean) =>
      updateStatusMutation.mutateAsync({ id, isActive }),
    isUpdatingStatus: updateStatusMutation.isPending,

    // 删除
    remove: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  }
}
