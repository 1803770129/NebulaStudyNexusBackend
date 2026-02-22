import { getApiClient } from '@/lib/apiClient'
import type { ReviewTaskGenerationResult, ReviewTaskSummary } from '@/types'

interface ReviewTaskQueryParams {
  [key: string]: unknown
  runDate?: string
}

function appendRunDate(url: string, runDate?: string): string {
  if (!runDate) {
    return url
  }
  return `${url}?runDate=${encodeURIComponent(runDate)}`
}

export async function getReviewTaskSummary(runDate?: string): Promise<ReviewTaskSummary> {
  const api = getApiClient()
  const params: ReviewTaskQueryParams = {}
  if (runDate) {
    params.runDate = runDate
  }
  const response = await api.get<{ data: ReviewTaskSummary }>('/admin/review-tasks/summary', params)
  return response.data
}

export async function generateReviewTasks(runDate?: string): Promise<ReviewTaskGenerationResult> {
  const api = getApiClient()
  const response = await api.post<{ data: ReviewTaskGenerationResult }>(
    appendRunDate('/admin/review-tasks/generate', runDate)
  )
  return response.data
}

