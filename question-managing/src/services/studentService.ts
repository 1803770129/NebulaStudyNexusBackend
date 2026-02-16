/**
 * 学生管理服务层
 *
 * 提供管理端对学生的查询和管理操作
 * 对接后端 /students API
 */

import type { Student, StudentFilters } from '@/types'
import { ErrorType } from '@/types'
import { getApiClient, ApiError } from '@/lib/apiClient'
import { ServiceError } from './questionService'

// ==================== 类型定义 ====================

/**
 * 后端分页响应格式
 */
interface StudentPaginatedResponse {
  items: Student[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ==================== API 服务方法 ====================

/**
 * 分页查询学生列表
 *
 * @param filters - 筛选参数（keyword, isActive, page, limit）
 * @returns 分页数据
 */
export async function getStudents(filters: StudentFilters): Promise<StudentPaginatedResponse> {
  const api = getApiClient()

  // 构建查询参数，移除 undefined 的值
  const params: Record<string, unknown> = {
    page: filters.page,
    limit: filters.limit,
  }
  if (filters.keyword) {
    params.keyword = filters.keyword
  }
  if (filters.isActive !== undefined) {
    params.isActive = filters.isActive
  }

  const response = await api.get<{ data: StudentPaginatedResponse }>('/students', params)
  return response.data
}

/**
 * 根据 ID 获取学生详情
 *
 * @param id - 学生 ID
 * @returns 学生数据
 */
export async function getStudentById(id: string): Promise<Student> {
  const api = getApiClient()

  try {
    const response = await api.get<{ data: Student }>(`/students/${id}`)
    return response.data
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      throw new ServiceError(ErrorType.NOT_FOUND, '学生不存在', 'id')
    }
    throw error
  }
}

/**
 * 更新学生状态（启用/禁用）
 *
 * @param id - 学生 ID
 * @param isActive - 目标状态
 * @returns 更新后的学生数据
 */
export async function updateStudentStatus(id: string, isActive: boolean): Promise<Student> {
  const api = getApiClient()

  try {
    const response = await api.patch<{ data: Student }>(`/students/${id}/status`, { isActive })
    return response.data
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      throw new ServiceError(ErrorType.NOT_FOUND, '学生不存在', 'id')
    }
    throw error
  }
}

/**
 * 删除学生
 *
 * @param id - 学生 ID
 */
export async function deleteStudent(id: string): Promise<void> {
  const api = getApiClient()

  try {
    await api.delete(`/students/${id}`)
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      throw new ServiceError(ErrorType.NOT_FOUND, '学生不存在', 'id')
    }
    throw error
  }
}
