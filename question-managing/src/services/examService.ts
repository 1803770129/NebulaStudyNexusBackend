import { getApiClient } from '@/lib/apiClient'
import type {
  AdminExamAttempt,
  AdminExamAttemptDetail,
  AdminExamAttemptFilters,
  CreateExamPaperPayload,
  ExamPaper,
  ExamPaperDetail,
  ExamPaperFilters,
  GradeExamAttemptItemPayload,
  GradeExamAttemptItemResult,
  ExamTimeoutScanResult,
  ExamTimeoutSummary,
  PaginatedResponse,
} from '@/types'

interface QueryExamPaperParams {
  [key: string]: unknown
  page?: number
  pageSize?: number
  status?: string
  keyword?: string
}

interface QueryExamAttemptParams {
  [key: string]: unknown
  page?: number
  pageSize?: number
  status?: string
  paperId?: string
  studentId?: string
  keyword?: string
}

function appendPaperId(url: string, paperId: string, action?: string): string {
  return action ? `${url}/${paperId}/${action}` : `${url}/${paperId}`
}

export async function getExamPapers(
  filters: ExamPaperFilters
): Promise<PaginatedResponse<ExamPaper>> {
  const api = getApiClient()
  const params: QueryExamPaperParams = {
    page: filters.page,
    pageSize: filters.pageSize,
  }
  if (filters.status) {
    params.status = filters.status
  }
  if (filters.keyword?.trim()) {
    params.keyword = filters.keyword.trim()
  }
  const response = await api.get<{ data: PaginatedResponse<ExamPaper> }>('/exam/papers', params)
  return response.data
}

export async function getExamPaperById(paperId: string): Promise<ExamPaperDetail> {
  const api = getApiClient()
  const response = await api.get<{ data: ExamPaperDetail }>(appendPaperId('/exam/papers', paperId))
  return response.data
}

export async function createExamPaper(payload: CreateExamPaperPayload): Promise<ExamPaperDetail> {
  const api = getApiClient()
  const response = await api.post<{ data: ExamPaperDetail }>('/exam/papers', payload)
  return response.data
}

export async function publishExamPaper(paperId: string): Promise<ExamPaperDetail> {
  const api = getApiClient()
  const response = await api.post<{ data: ExamPaperDetail }>(
    appendPaperId('/exam/papers', paperId, 'publish')
  )
  return response.data
}

export async function getAdminExamAttempts(
  filters: AdminExamAttemptFilters
): Promise<PaginatedResponse<AdminExamAttempt>> {
  const api = getApiClient()
  const params: QueryExamAttemptParams = {
    page: filters.page,
    pageSize: filters.pageSize,
  }

  if (filters.status) {
    params.status = filters.status
  }
  if (filters.paperId?.trim()) {
    params.paperId = filters.paperId.trim()
  }
  if (filters.studentId?.trim()) {
    params.studentId = filters.studentId.trim()
  }
  if (filters.keyword?.trim()) {
    params.keyword = filters.keyword.trim()
  }

  const response = await api.get<{ data: PaginatedResponse<AdminExamAttempt> }>('/exam/attempts', params)
  return response.data
}

export async function getAdminExamAttemptById(attemptId: string): Promise<AdminExamAttemptDetail> {
  const api = getApiClient()
  const response = await api.get<{ data: AdminExamAttemptDetail }>(`/exam/attempts/${attemptId}`)
  return response.data
}

export async function getExamTimeoutSummary(): Promise<ExamTimeoutSummary> {
  const api = getApiClient()
  const response = await api.get<{ data: ExamTimeoutSummary }>('/exam/attempts/timeout-summary')
  return response.data
}

export async function manualScanExamTimeoutAttempts(): Promise<ExamTimeoutScanResult> {
  const api = getApiClient()
  const response = await api.post<{ data: ExamTimeoutScanResult }>('/exam/attempts/timeout-scan')
  return response.data
}

export async function gradeExamAttemptItem(
  attemptId: string,
  itemId: string,
  payload: GradeExamAttemptItemPayload
): Promise<GradeExamAttemptItemResult> {
  const api = getApiClient()
  const response = await api.post<{ data: GradeExamAttemptItemResult }>(
    `/exam/attempts/${attemptId}/items/${itemId}/grade`,
    payload
  )
  return response.data
}
