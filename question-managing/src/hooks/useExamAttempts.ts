import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryClient'
import {
  gradeExamAttemptItem,
  getAdminExamAttemptById,
  getAdminExamAttempts,
  getExamTimeoutSummary,
  manualScanExamTimeoutAttempts,
} from '@/services/examService'
import type { AdminExamAttemptFilters, GradeExamAttemptItemPayload } from '@/types'

export function useAdminExamAttempts(filters: AdminExamAttemptFilters) {
  const query = useQuery({
    queryKey: queryKeys.examAttempts.list(filters as unknown as Record<string, unknown>),
    queryFn: () => getAdminExamAttempts(filters),
  })

  return {
    attempts: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    page: query.data?.page ?? filters.page,
    pageSize: query.data?.pageSize ?? filters.pageSize,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useAdminExamAttempt(attemptId?: string) {
  return useQuery({
    queryKey: attemptId
      ? queryKeys.examAttempts.detail(attemptId)
      : queryKeys.examAttempts.details(),
    queryFn: () => getAdminExamAttemptById(attemptId as string),
    enabled: Boolean(attemptId),
  })
}

export function useExamTimeoutSummary() {
  return useQuery({
    queryKey: queryKeys.examAttempts.timeoutSummary(),
    queryFn: () => getExamTimeoutSummary(),
  })
}

export function useManualScanExamTimeoutAttempts() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => manualScanExamTimeoutAttempts(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.examAttempts.all })
    },
  })
}

export function useGradeExamAttemptItem(attemptId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, payload }: { itemId: string; payload: GradeExamAttemptItemPayload }) =>
      gradeExamAttemptItem(attemptId, itemId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.examAttempts.detail(attemptId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.examAttempts.all })
    },
  })
}
