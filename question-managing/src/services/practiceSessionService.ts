import { getApiClient } from '@/lib/apiClient'
import type {
  AdminPracticeSession,
  AdminPracticeSessionDetail,
  AdminPracticeSessionFilters,
  AdminPracticeSessionStats,
  CreatePracticeSessionPayload,
  CurrentPracticeSessionItemResponse,
  PaginatedResponse,
  PracticeSession,
  PracticeSessionDetail,
  PracticeSessionFilters,
  SubmitPracticeSessionItemPayload,
  SubmitPracticeSessionItemResponse,
} from '@/types'

interface QueryPracticeSessionParams {
  [key: string]: unknown
  page?: number
  pageSize?: number
  status?: string
  mode?: string
  studentId?: string
  keyword?: string
}

export async function createPracticeSession(
  payload: CreatePracticeSessionPayload
): Promise<PracticeSessionDetail> {
  const api = getApiClient()
  const response = await api.post<{ data: PracticeSessionDetail }>(
    '/student/practice-sessions',
    payload
  )
  return response.data
}

export async function getPracticeSessions(
  filters: PracticeSessionFilters
): Promise<PaginatedResponse<PracticeSession>> {
  const api = getApiClient()
  const params: QueryPracticeSessionParams = {
    page: filters.page,
    pageSize: filters.pageSize,
  }

  if (filters.status) {
    params.status = filters.status
  }

  if (filters.mode) {
    params.mode = filters.mode
  }

  const response = await api.get<{ data: PaginatedResponse<PracticeSession> }>(
    '/student/practice-sessions',
    params
  )
  return response.data
}

export async function getAdminPracticeSessions(
  filters: AdminPracticeSessionFilters
): Promise<PaginatedResponse<AdminPracticeSession>> {
  const api = getApiClient()
  const params: QueryPracticeSessionParams = {
    page: filters.page,
    pageSize: filters.pageSize,
  }

  if (filters.status) {
    params.status = filters.status
  }

  if (filters.mode) {
    params.mode = filters.mode
  }

  if (filters.studentId) {
    params.studentId = filters.studentId
  }

  if (filters.keyword?.trim()) {
    params.keyword = filters.keyword.trim()
  }

  const response = await api.get<{ data: PaginatedResponse<AdminPracticeSession> }>(
    '/admin/practice-sessions',
    params
  )
  return response.data
}

export async function getPracticeSessionById(sessionId: string): Promise<PracticeSessionDetail> {
  const api = getApiClient()
  const response = await api.get<{ data: PracticeSessionDetail }>(
    `/student/practice-sessions/${sessionId}`
  )
  return response.data
}

export async function getAdminPracticeSessionById(
  sessionId: string
): Promise<AdminPracticeSessionDetail> {
  const api = getApiClient()
  const response = await api.get<{ data: AdminPracticeSessionDetail }>(
    `/admin/practice-sessions/${sessionId}`
  )
  return response.data
}

export async function getAdminPracticeSessionStats(): Promise<AdminPracticeSessionStats> {
  const api = getApiClient()
  const response = await api.get<{ data: AdminPracticeSessionStats }>(
    '/admin/practice-sessions/stats'
  )
  return response.data
}

export async function getCurrentPracticeSessionItem(
  sessionId: string
): Promise<CurrentPracticeSessionItemResponse> {
  const api = getApiClient()
  const response = await api.get<{ data: CurrentPracticeSessionItemResponse }>(
    `/student/practice-sessions/${sessionId}/current`
  )
  return response.data
}

export async function submitPracticeSessionItem(
  sessionId: string,
  itemId: string,
  payload: SubmitPracticeSessionItemPayload
): Promise<SubmitPracticeSessionItemResponse> {
  const api = getApiClient()
  const response = await api.post<{ data: SubmitPracticeSessionItemResponse }>(
    `/student/practice-sessions/${sessionId}/items/${itemId}/submit`,
    payload
  )
  return response.data
}

export async function completePracticeSession(sessionId: string): Promise<PracticeSession> {
  const api = getApiClient()
  const response = await api.post<{ data: PracticeSession }>(
    `/student/practice-sessions/${sessionId}/complete`
  )
  return response.data
}
