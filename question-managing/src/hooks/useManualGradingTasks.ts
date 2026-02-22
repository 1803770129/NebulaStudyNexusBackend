import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryClient'
import {
  claimManualGradingTask,
  getManualGradingTaskById,
  getManualGradingTasks,
  reopenManualGradingTask,
  submitManualGradingTask,
} from '@/services/manualGradingService'
import type {
  ManualGradingTaskFilters,
  ReopenManualGradingPayload,
  SubmitManualGradingPayload,
} from '@/types'

export function useManualGradingTasks(filters: ManualGradingTaskFilters) {
  const query = useQuery({
    queryKey: queryKeys.manualGradingTasks.list(filters as unknown as Record<string, unknown>),
    queryFn: () => getManualGradingTasks(filters),
  })

  return {
    tasks: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    page: query.data?.page ?? filters.page,
    pageSize: query.data?.pageSize ?? filters.pageSize,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useManualGradingTask(taskId?: string) {
  return useQuery({
    queryKey: taskId
      ? queryKeys.manualGradingTasks.detail(taskId)
      : queryKeys.manualGradingTasks.details(),
    queryFn: () => getManualGradingTaskById(taskId as string),
    enabled: Boolean(taskId),
  })
}

export function useClaimManualGradingTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (taskId: string) => claimManualGradingTask(taskId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.manualGradingTasks.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.manualGradingTasks.detail(data.id) })
    },
  })
}

export function useSubmitManualGradingTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: SubmitManualGradingPayload }) =>
      submitManualGradingTask(taskId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.manualGradingTasks.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.manualGradingTasks.detail(data.id) })
    },
  })
}

export function useReopenManualGradingTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload?: ReopenManualGradingPayload }) =>
      reopenManualGradingTask(taskId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.manualGradingTasks.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.manualGradingTasks.detail(data.id) })
    },
  })
}
