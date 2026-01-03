/**
 * 分类服务层
 * 
 * 提供分类的 CRUD 操作，支持多级分类结构（最多三级）
 * 通过 API Client 与后端交互
 * 
 * 学习要点：
 * 1. 树形数据结构的处理
 * 2. 父子关系的维护
 * 3. 层级限制的校验
 */

import type { Category, CategoryFormValues, CategoryTreeNode } from '@/types';
import { ErrorType } from '@/types';
import { getApiClient, ApiError } from '@/lib/apiClient';
import { ServiceError } from './questionService';

// ==================== 类型定义 ====================

/**
 * API 返回的分类格式
 */
interface CategoryApiResponse {
  id: string;
  name: string;
  parentId: string | null;
  level: number;
  path: string;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 创建分类请求参数
 */
interface CreateCategoryRequest {
  name: string;
  parentId?: string;
}

// ==================== 数据转换函数 ====================

/**
 * 将 API 响应转换为前端 Category 类型
 */
function convertApiResponseToCategory(api: CategoryApiResponse): Category {
  return {
    id: api.id,
    name: api.name,
    parentId: api.parentId,
    level: api.level,
    path: api.path,
    questionCount: api.questionCount,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
  };
}

/**
 * 将表单值转换为 API 请求格式
 */
function convertFormValuesToRequest(data: CategoryFormValues): CreateCategoryRequest {
  return {
    name: data.name,
    parentId: data.parentId || undefined,
  };
}

// ==================== API 服务方法 ====================

/**
 * 获取所有分类
 * 
 * @returns 分类列表（扁平结构）
 */
export async function getAllCategories(): Promise<Category[]> {
  const api = getApiClient();
  const response = await api.get<CategoryApiResponse[]>('/categories');
  return response.map(convertApiResponseToCategory);
}

/**
 * 根据 ID 获取分类
 * 
 * @param id - 分类 ID
 * @returns 分类数据
 * @throws ServiceError 当分类不存在时
 */
export async function getCategoryById(id: string): Promise<Category> {
  const api = getApiClient();
  
  try {
    const response = await api.get<CategoryApiResponse>(`/categories/${id}`);
    return convertApiResponseToCategory(response);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      throw new ServiceError(ErrorType.NOT_FOUND, '分类不存在', 'id');
    }
    throw error;
  }
}

/**
 * 创建分类
 * 
 * @param data - 分类表单数据
 * @returns 创建的分类
 * @throws ServiceError 当名称重复或层级超限时
 * 
 * 示例：
 * ```typescript
 * const category = await createCategory({
 *   name: '数学',
 *   parentId: null  // 顶级分类
 * });
 * 
 * const subCategory = await createCategory({
 *   name: '代数',
 *   parentId: category.id  // 子分类
 * });
 * ```
 */
export async function createCategory(data: CategoryFormValues): Promise<Category> {
  const api = getApiClient();
  
  try {
    const request = convertFormValuesToRequest(data);
    const response = await api.post<CategoryApiResponse>('/categories', request);
    return convertApiResponseToCategory(response);
  } catch (error) {
    if (error instanceof ApiError) {
      // 处理特定错误
      if (error.statusCode === 409) {
        throw new ServiceError(
          ErrorType.DUPLICATE_ERROR,
          '同级分类下已存在相同名称',
          'name'
        );
      }
      if (error.statusCode === 400 && error.message.includes('层级')) {
        throw new ServiceError(
          ErrorType.CONSTRAINT_ERROR,
          '分类层级不能超过 3 级',
          'parentId'
        );
      }
    }
    throw error;
  }
}

/**
 * 更新分类
 * 
 * @param id - 分类 ID
 * @param data - 更新的数据
 * @returns 更新后的分类
 * @throws ServiceError 当分类不存在或名称重复时
 */
export async function updateCategory(id: string, data: CategoryFormValues): Promise<Category> {
  const api = getApiClient();
  
  try {
    const request = convertFormValuesToRequest(data);
    const response = await api.patch<CategoryApiResponse>(`/categories/${id}`, request);
    return convertApiResponseToCategory(response);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.statusCode === 404) {
        throw new ServiceError(ErrorType.NOT_FOUND, '分类不存在', 'id');
      }
      if (error.statusCode === 409) {
        throw new ServiceError(
          ErrorType.DUPLICATE_ERROR,
          '同级分类下已存在相同名称',
          'name'
        );
      }
    }
    throw error;
  }
}

/**
 * 删除分类
 * 
 * @param id - 分类 ID
 * @throws ServiceError 当分类不存在、有子分类或有关联题目时
 */
export async function deleteCategory(id: string): Promise<void> {
  const api = getApiClient();
  
  try {
    await api.delete(`/categories/${id}`);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.statusCode === 404) {
        throw new ServiceError(ErrorType.NOT_FOUND, '分类不存在', 'id');
      }
      if (error.statusCode === 400) {
        // 根据错误消息判断具体原因
        if (error.message.includes('子分类')) {
          throw new ServiceError(
            ErrorType.CONSTRAINT_ERROR,
            '请先删除子分类',
            'id'
          );
        }
        if (error.message.includes('题目')) {
          throw new ServiceError(
            ErrorType.CONSTRAINT_ERROR,
            '该分类下有题目，请先移动或删除相关题目',
            'id'
          );
        }
      }
    }
    throw error;
  }
}

/**
 * 获取子分类
 * 
 * @param parentId - 父分类 ID，null 表示获取顶级分类
 * @returns 子分类列表
 */
export async function getChildCategories(parentId: string | null): Promise<Category[]> {
  const categories = await getAllCategories();
  return categories.filter(c => c.parentId === parentId);
}

/**
 * 获取分类树
 * 
 * 从后端获取树形结构的分类数据
 * 
 * @returns 树形结构数据
 */
export async function getCategoryTree(): Promise<CategoryTreeNode[]> {
  const api = getApiClient();
  
  try {
    // 尝试调用后端的树形接口
    const response = await api.get<CategoryTreeNode[]>('/categories/tree');
    return response;
  } catch {
    // 如果后端没有树形接口，则在前端构建
    const categories = await getAllCategories();
    return buildCategoryTree(categories);
  }
}

/**
 * 在前端构建分类树
 * 
 * 将扁平的分类列表转换为树形结构
 * 
 * @param categories - 扁平的分类列表
 * @returns 树形结构
 */
function buildCategoryTree(categories: Category[]): CategoryTreeNode[] {
  function buildTree(parentId: string | null): CategoryTreeNode[] {
    return categories
      .filter(c => c.parentId === parentId)
      .map(category => ({
        key: category.id,
        title: category.name,
        children: buildTree(category.id),
        data: category,
      }));
  }

  return buildTree(null);
}

/**
 * 检查同级分类名称是否重复
 * 
 * @param name - 分类名称
 * @param parentId - 父分类 ID
 * @param excludeId - 排除的分类 ID（编辑时使用）
 * @returns 是否重复
 */
export async function isDuplicateCategoryName(
  name: string,
  parentId: string | null,
  excludeId?: string
): Promise<boolean> {
  const categories = await getAllCategories();
  return categories.some(
    c =>
      c.name === name &&
      c.parentId === parentId &&
      c.id !== excludeId
  );
}

/**
 * 更新分类的题目数量
 * 
 * @deprecated 后端会自动维护题目数量
 */
export function updateCategoryQuestionCount(
  _categoryId: string,
  _delta: number
): void {
  console.warn('updateCategoryQuestionCount is deprecated. Backend handles this automatically.');
}
