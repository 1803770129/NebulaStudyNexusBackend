import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryClient'
import { createExamPaper, getExamPaperById, getExamPapers, publishExamPaper } from '@/services/examService'
import type { CreateExamPaperPayload, ExamPaperFilters } from '@/types'

export function useExamPapers(filters: ExamPaperFilters) {
  const query = useQuery({
    queryKey: queryKeys.examPapers.list(filters as unknown as Record<string, unknown>),
    queryFn: () => getExamPapers(filters),
  })

  return {
    papers: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    page: query.data?.page ?? filters.page,
    pageSize: query.data?.pageSize ?? filters.pageSize,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useExamPaper(paperId?: string) {
  return useQuery({
    queryKey: paperId ? queryKeys.examPapers.detail(paperId) : queryKeys.examPapers.details(),
    queryFn: () => getExamPaperById(paperId as string),
    enabled: Boolean(paperId),
  })
}

export function useCreateExamPaper() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateExamPaperPayload) => createExamPaper(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.examPapers.all })
    },
  })
}

export function usePublishExamPaper() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (paperId: string) => publishExamPaper(paperId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.examPapers.all })
    },
  })
}

