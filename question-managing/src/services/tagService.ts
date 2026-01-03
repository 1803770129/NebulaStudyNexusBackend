/**
 * 标签服务层
 * 
 * 提供标签的 CRUD 操作
 * 通过 API Client 与后端交互
 * 
 * 学习要点：
 * 1. 简单 CRUD 服务的实现模式
 * 2. 名称唯一性校验
 * 3. 颜色处理
 */

import type { Tag, TagFormValues } from '@/types';
import { ErrorType } from '@/types';
import { getApiClient, ApiError } from '@/lib/apiClient';
import { ServiceError } from './questionService';

// ==================== 类型定义 ====================

/**
 * API 返回的标签格式
 */
interface TagApiResponse {
  id: string;
  name: string;
  color: string;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 创建标签请求参数
 */
interface CreateTagRequest {
  name: string;
  color?: string;
}

// ==================== 数据转换函数 ====================

/**
 * 将 API 响应转换为前端 Tag 类型
 */
function convertApiResponseToTag(api: TagApiResponse): Tag {
  return {
    id: api.id,
    name: api.name,
    color: api.color,
    questionCount: api.questionCount,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
  };
}

/**
 * 将表单值转换为 API 请求格式
 */
function convertFormValuesToRequest(data: TagFormValues): CreateTagRequest {
  return {
    name: data.name,
    color: data.color || undefined,
  };
}

// ==================== API 服务方法 ====================

/**
 * 获取所有标签
 * 
 * @returns 标签列表
 */
export async function getAllTags(): Promise<Tag[]> {
  const api = getApiClient();
  const response = await api.get<TagApiResponse[]>('/tags');
  return response.map(convertApiResponseToTag);
}

/**
 * 根据 ID 获取标签
 * 
 * @param id - 标签 ID
 * @returns 标签数据
 * @throws ServiceError 当标签不存在时
 */
export async function getTagById(id: string): Promise<Tag> {
  const api = getApiClient();
  
  try {
    const response = await api.get<TagApiResponse>(`/tags/${id}`);
    return convertApiResponseToTag(response);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      throw new ServiceError(ErrorType.NOT_FOUND, '标签不存在', 'id');
    }
    throw error;
  }
}

/**
 * 创建标签
 * 
 * @param data - 标签表单数据
 * @returns 创建的标签
 * @throws ServiceError 当名称重复时
 * 
 * 示例：
 * ```typescript
 * const tag = await createTag({
 *   name: '重点',
 *   color: '#ff4d4f'
 * });
 * ```
 */
export async function createTag(data: TagFormValues): Promise<Tag> {
  const api = getApiClient();
  
  try {
    const request = convertFormValuesToRequest(data);
    const response = await api.post<TagApiResponse>('/tags', request);
    return convertApiResponseToTag(response);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 409) {
      throw new ServiceError(
        ErrorType.DUPLICATE_ERROR,
        '标签名称已存在',
        'name'
      );
    }
    throw error;
  }
}

/**
 * 更新标签
 * 
 * @param id - 标签 ID
 * @param data - 更新的数据
 * @returns 更新后的标签
 * @throws ServiceError 当标签不存在或名称重复时
 */
export async function updateTag(id: string, data: TagFormValues): Promise<Tag> {
  const api = getApiClient();
  
  try {
    const request = convertFormValuesToRequest(data);
    const response = await api.patch<TagApiResponse>(`/tags/${id}`, request);
    return convertApiResponseToTag(response);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.statusCode === 404) {
        throw new ServiceError(ErrorType.NOT_FOUND, '标签不存在', 'id');
      }
      if (error.statusCode === 409) {
        throw new ServiceError(
          ErrorType.DUPLICATE_ERROR,
          '标签名称已存在',
          'name'
        );
      }
    }
    throw error;
  }
}

/**
 * 删除标签
 * 
 * 删除时后端会自动移除所有题目中对该标签的引用
 * 
 * @param id - 标签 ID
 * @throws ServiceError 当标签不存在时
 */
export async function deleteTag(id: string): Promise<void> {
  const api = getApiClient();
  
  try {
    await api.delete(`/tags/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      throw new ServiceError(ErrorType.NOT_FOUND, '标签不存在', 'id');
    }
    throw error;
  }
}

/**
 * 批量获取标签
 * 
 * @param ids - 标签 ID 列表
 * @returns 标签列表
 */
export async function getTagsByIds(ids: string[]): Promise<Tag[]> {
  if (ids.length === 0) return [];
  
  const allTags = await getAllTags();
  return allTags.filter(t => ids.includes(t.id));
}

/**
 * 检查标签名称是否重复
 * 
 * @param name - 标签名称
 * @param excludeId - 排除的标签 ID（编辑时使用）
 * @returns 是否重复
 */
export async function isDuplicateTagName(name: string, excludeId?: string): Promise<boolean> {
  const tags = await getAllTags();
  return tags.some(t => t.name === name && t.id !== excludeId);
}

/**
 * 搜索标签
 * 
 * @param keyword - 搜索关键词
 * @returns 匹配的标签列表
 */
export async function searchTags(keyword: string): Promise<Tag[]> {
  const tags = await getAllTags();
  const lowerKeyword = keyword.toLowerCase().trim();
  
  if (!lowerKeyword) return tags;
  
  return tags.filter(t => t.name.toLowerCase().includes(lowerKeyword));
}

/**
 * 更新标签的题目数量
 * 
 * @deprecated 后端会自动维护题目数量
 */
export function updateTagQuestionCount(_tagId: string, _delta: number): void {
  console.warn('updateTagQuestionCount is deprecated. Backend handles this automatically.');
}

/**
 * 移除题目中的标签引用
 * 
 * @deprecated 后端会自动处理
 */
export function removeTagFromQuestions(_tagId: string): void {
  console.warn('removeTagFromQuestions is deprecated. Backend handles this automatically.');
}
