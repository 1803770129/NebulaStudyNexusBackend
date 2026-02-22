import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryClient'
import { generateReviewTasks, getReviewTaskSummary } from '@/services/reviewTaskService'

export function useReviewTaskSummary(runDate?: string) {
  return useQuery({
    queryKey: queryKeys.reviewTasks.summary(runDate),
    queryFn: () => getReviewTaskSummary(runDate),
  })
}

export function useGenerateReviewTasks() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (runDate?: string) => generateReviewTasks(runDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviewTasks.all })
    },
  })
}

