/**
 * 知识点服务层
 * 
 * 提供知识点的 CRUD 操作，支持树形结构管理和与题目的关联
 * 通过 API Client 与后端交互
 * 
 * 学习要点：
 * 1. 树形数据结构的处理
 * 2. 富文本内容的管理
 * 3. 多对多关系的维护
 */

import type { RichContent, PaginatedResponse, Question } from '@/types';
import { ErrorType } from '@/types';
import { getApiClient, ApiError } from '@/lib/apiClient';
import { ServiceError } from './questionService';

// ==================== 类型定义 ====================

/**
 * 知识点接口
 * 系统核心数据模型，包含知识点的所有信息
 */
export interface KnowledgePoint {
  /** 知识点唯一标识 */
  id: string;
  /** 知识点名称 */
  name: string;
  /** 知识点内容（富文本） */
  content: RichContent;
  /** 拓展内容（富文本，可选） */
  extension: RichContent | null;
  /** 所属分类ID */
  categoryId: string | null;
  /** 分类信息 */
  category?: {
    id: string;
    name: string;
  };
  /** 父知识点ID */
  parentId: string | null;
  /** 层级深度 1-3 */
  level: number;
  /** 知识点路径 */
  path: string;
  /** 关联题目数量 */
  questionCount: number;
  /** 关联的标签列表 */
  tags: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/**
 * 知识点树节点接口
 * 用于树形结构展示
 */
export interface KnowledgePointTreeNode {
  /** 知识点ID */
  id: string;
  /** 知识点名称 */
  name: string;
  /** 层级深度 */
  level: number;
  /** 知识点路径 */
  path: string;
  /** 关联题目数量 */
  questionCount: number;
  /** 所属分类ID */
  categoryId: string | null;
  /** 子节点列表 */
  children: KnowledgePointTreeNode[];
}

/**
 * 创建知识点 DTO
 */
export interface CreateKnowledgePointDto {
  /** 知识点名称 */
  name: string;
  /** 知识点内容（富文本） */
  content: RichContent;
  /** 拓展内容（富文本，可选） */
  extension?: RichContent;
  /** 所属分类ID */
  categoryId?: string;
  /** 父知识点ID */
  parentId?: string;
  /** 标签ID列表 */
  tagIds?: string[];
}

/**
 * 查询知识点 DTO
 */
export interface QueryKnowledgePointDto {
  /** 页码 */
  page?: number;
  /** 每页数量 */
  limit?: number;
  /** 搜索关键词 */
  search?: string;
  /** 分类ID筛选 */
  categoryId?: string;
  /** 标签ID筛选 */
  tagId?: string;
  /** 父知识点ID筛选 */
  parentId?: string;
}

/**
 * 分页查询参数
 */
export interface PaginationQueryDto {
  /** 页码 */
  page?: number;
  /** 每页数量 */
  limit?: number;
}

// ==================== API 响应类型 ====================

/**
 * API 返回的知识点格式
 */
interface KnowledgePointApiResponse {
  id: string;
  name: string;
  content: RichContent;
  extension: RichContent | null;
  categoryId: string | null;
  category?: {
    id: string;
    name: string;
  };
  parentId: string | null;
  level: number;
  path: string;
  questionCount: number;
  tags: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

/**
 * API 返回的树节点格式
 */
interface KnowledgePointTreeNodeApiResponse {
  id: string;
  name: string;
  level: number;
  path: string;
  questionCount: number;
  categoryId: string | null;
  children: KnowledgePointTreeNodeApiResponse[];
}

/**
 * API 分页响应格式
 */
// ==================== 数据转换函数 ====================

/**
 * 将 API 响应转换为前端 KnowledgePoint 类型
 */
function convertApiResponseToKnowledgePoint(api: KnowledgePointApiResponse): KnowledgePoint {
  return {
    id: api.id,
    name: api.name,
    content: api.content,
    extension: api.extension,
    categoryId: api.categoryId,
    category: api.category,
    parentId: api.parentId,
    level: api.level,
    path: api.path,
    questionCount: api.questionCount,
    tags: api.tags,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
  };
}

/**
 * 将 API 树节点转换为前端格式
 */
function convertApiTreeNode(node: KnowledgePointTreeNodeApiResponse): KnowledgePointTreeNode {
  return {
    id: node.id,
    name: node.name,
    level: node.level,
    path: node.path,
    questionCount: node.questionCount,
    categoryId: node.categoryId,
    children: node.children?.map(convertApiTreeNode) || [],
  };
}

// ==================== API 服务类 ====================

/**
 * 知识点服务类
 * 封装所有知识点相关的 API 调用
 */
class KnowledgePointService {
  /**
   * 创建知识点
   * 
   * @param data - 创建知识点的数据
   * @returns 创建的知识点
   * @throws ServiceError 当名称重复或层级超限时
   * 
   * 示例：
   * ```typescript
   * const kp = await knowledgePointService.create({
   *   name: '二叉树遍历',
   *   content: {
   *     raw: '<p>二叉树遍历是指...</p>',
   *     rendered: '<p>二叉树遍历是指...</p>'
   *   },
   *   categoryId: 'xxx',
   *   parentId: 'yyy',
   *   tagIds: ['tag1', 'tag2']
   * });
   * ```
   */
  async create(data: CreateKnowledgePointDto): Promise<KnowledgePoint> {
    const api = getApiClient();
    
    try {
      const response = await api.post<{ data: KnowledgePointApiResponse }>(
        '/knowledge-points',
        data
      );
      return convertApiResponseToKnowledgePoint(response.data);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.statusCode === 409) {
          throw new ServiceError(
            ErrorType.DUPLICATE_ERROR,
            '同级知识点名称已存在',
            'name'
          );
        }
        if (error.statusCode === 400 && error.message.includes('层级')) {
          throw new ServiceError(
            ErrorType.CONSTRAINT_ERROR,
            '知识点层级不能超过 3 级',
            'parentId'
          );
        }
      }
      throw error;
    }
  }

  /**
   * 获取知识点列表（支持分页、搜索、筛选）
   * 
   * @param query - 查询参数
   * @returns 分页后的知识点列表
   * 
   * 示例：
   * ```typescript
   * const result = await knowledgePointService.getList({
   *   page: 1,
   *   limit: 20,
   *   search: '二叉树',
   *   categoryId: 'xxx'
   * });
   * console.log(result.data);  // 知识点列表
   * console.log(result.total); // 总数
   * ```
   */
  async getList(query: QueryKnowledgePointDto): Promise<PaginatedResponse<KnowledgePoint>> {
    const api = getApiClient();
    
    // 构建查询参数
    const params: Record<string, unknown> = {};
    
    if (query.page !== undefined) params.page = query.page;
    if (query.limit !== undefined) params.limit = query.limit;
    if (query.search?.trim()) params.search = query.search.trim();
    if (query.categoryId) params.categoryId = query.categoryId;
    if (query.tagId) params.tagId = query.tagId;
    if (query.parentId !== undefined) params.parentId = query.parentId;
    
    // 后端返回格式经过 TransformInterceptor 包装：
    // { statusCode, message, data: { data: [...], total, page, pageSize }, timestamp }
    const response = await api.get<{
      statusCode: number;
      message: string;
      data: {
        data: KnowledgePointApiResponse[];
        total: number;
        page: number;
        pageSize: number;
      };
      timestamp: string;
    }>(
      '/knowledge-points',
      params
    );
    
    // 实际的数据在 response.data.data 中
    return {
      data: response.data.data.map(convertApiResponseToKnowledgePoint),
      total: response.data.total,
      page: response.data.page,
      pageSize: response.data.pageSize,
    };
  }

  /**
   * 获取知识点树
   * 
   * @param categoryId - 可选的分类ID，用于筛选特定分类的知识点树
   * @returns 树形结构的知识点列表
   * 
   * 示例：
   * ```typescript
   * // 获取所有知识点树
   * const tree = await knowledgePointService.getTree();
   * 
   * // 获取特定分类的知识点树
   * const categoryTree = await knowledgePointService.getTree('category-id');
   * ```
   */
  async getTree(categoryId?: string): Promise<KnowledgePointTreeNode[]> {
    const api = getApiClient();
    
    const params: Record<string, unknown> = {};
    if (categoryId) params.categoryId = categoryId;
    
    const response = await api.get<{ data: KnowledgePointTreeNodeApiResponse[] }>(
      '/knowledge-points/tree',
      params
    );
    
    return response.data.map(convertApiTreeNode);
  }

  /**
   * 根据 ID 获取知识点详情
   * 
   * @param id - 知识点 ID
   * @returns 知识点数据
   * @throws ServiceError 当知识点不存在时
   */
  async getById(id: string): Promise<KnowledgePoint> {
    const api = getApiClient();
    
    try {
      const response = await api.get<{ data: KnowledgePointApiResponse }>(
        `/knowledge-points/${id}`
      );
      return convertApiResponseToKnowledgePoint(response.data);
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 404) {
        throw new ServiceError(ErrorType.NOT_FOUND, '知识点不存在', 'id');
      }
      throw error;
    }
  }

  /**
   * 根据 ID 列表批量获取知识点
   * 
   * @param ids - 知识点 ID 列表
   * @returns 知识点列表
   * 
   * 示例：
   * ```typescript
   * const kps = await knowledgePointService.findByIds(['id1', 'id2', 'id3']);
   * ```
   */
  async findByIds(ids: string[]): Promise<KnowledgePoint[]> {
    if (!ids || ids.length === 0) {
      return [];
    }

    // 批量获取知识点，通过多次调用 getById
    // 注意：这是一个简化实现，实际项目中可能需要后端提供批量查询接口
    const promises = ids.map(id => this.getById(id).catch(() => null));
    const results = await Promise.all(promises);
    return results.filter((kp): kp is KnowledgePoint => kp !== null);
  }

  /**
   * 更新知识点
   * 
   * @param id - 知识点 ID
   * @param data - 更新的数据
   * @returns 更新后的知识点
   * @throws ServiceError 当知识点不存在或名称重复时
   */
  async update(id: string, data: Partial<CreateKnowledgePointDto>): Promise<KnowledgePoint> {
    const api = getApiClient();
    
    try {
      const response = await api.patch<{ data: KnowledgePointApiResponse }>(
        `/knowledge-points/${id}`,
        data
      );
      return convertApiResponseToKnowledgePoint(response.data);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.statusCode === 404) {
          throw new ServiceError(ErrorType.NOT_FOUND, '知识点不存在', 'id');
        }
        if (error.statusCode === 409) {
          throw new ServiceError(
            ErrorType.DUPLICATE_ERROR,
            '同级知识点名称已存在',
            'name'
          );
        }
      }
      throw error;
    }
  }

  /**
   * 删除知识点
   * 
   * @param id - 知识点 ID
   * @throws ServiceError 当知识点不存在、有子节点或有关联题目时
   */
  async delete(id: string): Promise<void> {
    const api = getApiClient();
    
    try {
      await api.delete(`/knowledge-points/${id}`);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.statusCode === 404) {
          throw new ServiceError(ErrorType.NOT_FOUND, '知识点不存在', 'id');
        }
        if (error.statusCode === 400) {
          // 根据错误消息判断具体原因
          if (error.message.includes('子知识点')) {
            throw new ServiceError(
              ErrorType.CONSTRAINT_ERROR,
              '请先删除子知识点',
              'id'
            );
          }
          if (error.message.includes('题目')) {
            throw new ServiceError(
              ErrorType.CONSTRAINT_ERROR,
              '该知识点下有题目，请先处理相关题目',
              'id'
            );
          }
        }
      }
      throw error;
    }
  }

  /**
   * 获取知识点关联的题目
   * 
   * @param id - 知识点 ID
   * @param query - 分页查询参数
   * @returns 分页后的题目列表
   * 
   * 示例：
   * ```typescript
   * const result = await knowledgePointService.getQuestions('kp-id', {
   *   page: 1,
   *   limit: 20
   * });
   * ```
   */
  async getQuestions(
    id: string,
    query: PaginationQueryDto
  ): Promise<PaginatedResponse<Question>> {
    const api = getApiClient();
    
    const params: Record<string, unknown> = {};
    if (query.page !== undefined) params.page = query.page;
    if (query.limit !== undefined) params.limit = query.limit;
    
    const response = await api.get<{
      data: {
        data: Question[];
        total: number;
        page: number;
        pageSize: number;
      };
    }>(`/knowledge-points/${id}/questions`, params);
    
    return {
      data: response.data.data,
      total: response.data.total,
      page: response.data.page,
      pageSize: response.data.pageSize,
    };
  }
}

// ==================== 导出单例实例 ====================

/**
 * 知识点服务单例实例
 * 在整个应用中共享同一个实例
 */
export const knowledgePointService = new KnowledgePointService();

/**
 * 默认导出（兼容不同的导入方式）
 */
export default knowledgePointService;
