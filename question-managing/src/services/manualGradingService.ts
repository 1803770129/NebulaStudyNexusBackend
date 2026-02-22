import { getApiClient } from '@/lib/apiClient'
import type {
  ManualGradingTaskDetail,
  ManualGradingTaskFilters,
  ManualGradingTaskSummary,
  PaginatedResponse,
  ReopenManualGradingPayload,
  SubmitManualGradingPayload,
} from '@/types'

interface QueryManualGradingTaskParams {
  [key: string]: unknown
  page?: number
  pageSize?: number
  status?: string
  assigneeId?: string
  keyword?: string
}

export async function getManualGradingTasks(
  filters: ManualGradingTaskFilters
): Promise<PaginatedResponse<ManualGradingTaskSummary>> {
  const api = getApiClient()
  const params: QueryManualGradingTaskParams = {
    page: filters.page,
    pageSize: filters.pageSize,
  }

  if (filters.status) {
    params.status = filters.status
  }

  if (filters.assigneeId) {
    params.assigneeId = filters.assigneeId
  }

  if (filters.keyword?.trim()) {
    params.keyword = filters.keyword.trim()
  }

  const response = await api.get<{ data: PaginatedResponse<ManualGradingTaskSummary> }>(
    '/grading/tasks',
    params
  )
  return response.data
}

export async function getManualGradingTaskById(taskId: string): Promise<ManualGradingTaskDetail> {
  const api = getApiClient()
  const response = await api.get<{ data: ManualGradingTaskDetail }>(`/grading/tasks/${taskId}`)
  return response.data
}

export async function claimManualGradingTask(taskId: string): Promise<ManualGradingTaskDetail> {
  const api = getApiClient()
  const response = await api.post<{ data: ManualGradingTaskDetail }>(`/grading/tasks/${taskId}/claim`)
  return response.data
}

export async function submitManualGradingTask(
  taskId: string,
  payload: SubmitManualGradingPayload
): Promise<ManualGradingTaskDetail> {
  const api = getApiClient()
  const response = await api.post<{ data: ManualGradingTaskDetail }>(
    `/grading/tasks/${taskId}/submit`,
    payload
  )
  return response.data
}

export async function reopenManualGradingTask(
  taskId: string,
  payload?: ReopenManualGradingPayload
): Promise<ManualGradingTaskDetail> {
  const api = getApiClient()
  const response = await api.post<{ data: ManualGradingTaskDetail }>(
    `/grading/tasks/${taskId}/reopen`,
    payload ?? {}
  )
  return response.data
}
