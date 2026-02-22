import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryClient'
import {
  completePracticeSession,
  createPracticeSession,
  getAdminPracticeSessionById,
  getAdminPracticeSessionStats,
  getAdminPracticeSessions,
  getCurrentPracticeSessionItem,
  getPracticeSessionById,
  getPracticeSessions,
  submitPracticeSessionItem,
} from '@/services/practiceSessionService'
import type {
  AdminPracticeSessionFilters,
  CreatePracticeSessionPayload,
  PracticeSessionFilters,
  SubmitPracticeSessionItemPayload,
} from '@/types'

export function usePracticeSessions(filters: PracticeSessionFilters) {
  const query = useQuery({
    queryKey: queryKeys.practiceSessions.list(filters as unknown as Record<string, unknown>),
    queryFn: () => getPracticeSessions(filters),
  })

  return {
    sessions: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    page: query.data?.page ?? filters.page,
    pageSize: query.data?.pageSize ?? filters.pageSize,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useAdminPracticeSessions(filters: AdminPracticeSessionFilters) {
  const query = useQuery({
    queryKey: [
      ...queryKeys.practiceSessions.list(filters as unknown as Record<string, unknown>),
      'admin',
    ] as const,
    queryFn: () => getAdminPracticeSessions(filters),
  })

  return {
    sessions: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    page: query.data?.page ?? filters.page,
    pageSize: query.data?.pageSize ?? filters.pageSize,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function usePracticeSession(sessionId?: string) {
  return useQuery({
    queryKey: sessionId
      ? queryKeys.practiceSessions.detail(sessionId)
      : queryKeys.practiceSessions.details(),
    queryFn: () => getPracticeSessionById(sessionId as string),
    enabled: Boolean(sessionId),
  })
}

export function useAdminPracticeSession(sessionId?: string) {
  return useQuery({
    queryKey: sessionId
      ? [...queryKeys.practiceSessions.detail(sessionId), 'admin'] as const
      : [...queryKeys.practiceSessions.details(), 'admin'] as const,
    queryFn: () => getAdminPracticeSessionById(sessionId as string),
    enabled: Boolean(sessionId),
  })
}

export function useAdminPracticeSessionStats() {
  return useQuery({
    queryKey: [...queryKeys.practiceSessions.all, 'stats', 'admin'] as const,
    queryFn: () => getAdminPracticeSessionStats(),
  })
}

export function useCurrentPracticeSessionItem(sessionId?: string) {
  return useQuery({
    queryKey: sessionId
      ? queryKeys.practiceSessions.current(sessionId)
      : [...queryKeys.practiceSessions.all, 'current'] as const,
    queryFn: () => getCurrentPracticeSessionItem(sessionId as string),
    enabled: Boolean(sessionId),
  })
}

export function useCreatePracticeSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreatePracticeSessionPayload) => createPracticeSession(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.practiceSessions.all })
    },
  })
}

export function useSubmitPracticeSessionItem(sessionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, payload }: { itemId: string; payload: SubmitPracticeSessionItemPayload }) =>
      submitPracticeSessionItem(sessionId, itemId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.practiceSessions.detail(sessionId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.practiceSessions.current(sessionId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.practiceSessions.all })
    },
  })
}

export function useCompletePracticeSession(sessionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => completePracticeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.practiceSessions.detail(sessionId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.practiceSessions.current(sessionId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.practiceSessions.all })
    },
  })
}
