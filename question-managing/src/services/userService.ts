/**
 * Employee/User management service layer.
 *
 * Maps frontend operations to backend /users endpoints.
 */
import { getApiClient, ApiError } from '@/lib/apiClient'
import { ErrorType } from '@/types'
import type { AdminUser, AdminUserRole, UserFilters } from '@/types'
import { ServiceError } from './questionService'

interface UserPaginatedResponse {
  items: AdminUser[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export async function getUsers(filters: UserFilters): Promise<UserPaginatedResponse> {
  const api = getApiClient()

  const params: Record<string, unknown> = {
    page: filters.page,
    limit: filters.limit,
  }

  if (filters.keyword) params.keyword = filters.keyword
  if (filters.role) params.role = filters.role
  if (filters.isActive !== undefined) params.isActive = filters.isActive

  const response = await api.get<{ data: UserPaginatedResponse }>('/users', params)
  return response.data
}

export async function getUserById(id: string): Promise<AdminUser> {
  const api = getApiClient()

  try {
    const response = await api.get<{ data: AdminUser }>(`/users/${id}`)
    return response.data
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      throw new ServiceError(ErrorType.NOT_FOUND, 'Employee not found', 'id')
    }
    throw error
  }
}

export async function updateUserRole(id: string, role: AdminUserRole): Promise<AdminUser> {
  const api = getApiClient()

  try {
    const response = await api.patch<{ data: AdminUser }>(`/users/${id}/role`, { role })
    return response.data
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      throw new ServiceError(ErrorType.NOT_FOUND, 'Employee not found', 'id')
    }
    throw error
  }
}

export async function updateUserStatus(id: string, isActive: boolean): Promise<AdminUser> {
  const api = getApiClient()

  try {
    const response = await api.patch<{ data: AdminUser }>(`/users/${id}/status`, { isActive })
    return response.data
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      throw new ServiceError(ErrorType.NOT_FOUND, 'Employee not found', 'id')
    }
    throw error
  }
}

export async function resetUserPassword(id: string, newPassword: string): Promise<void> {
  const api = getApiClient()

  try {
    await api.patch(`/users/${id}/reset-password`, { newPassword })
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      throw new ServiceError(ErrorType.NOT_FOUND, 'Employee not found', 'id')
    }
    throw error
  }
}

export async function deleteUser(id: string): Promise<void> {
  const api = getApiClient()

  try {
    await api.delete(`/users/${id}`)
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      throw new ServiceError(ErrorType.NOT_FOUND, 'Employee not found', 'id')
    }
    throw error
  }
}

