/**
 * 题目服务层
 * 
 * 提供题目的 CRUD 操作和筛选搜索功能
 * 通过 API Client 与后端交互
 * 
 * 学习要点：
 * 1. 服务层的职责：封装 API 调用、数据格式转换
 * 2. 类型转换：后端响应格式 ↔ 前端类型
 * 3. 错误处理：统一的错误类型
 */

import type {
  Question,
  QuestionFilters,
  QuestionFormValues,
  PaginatedResponse,
  RichContent,
  FormOption,
  Option,
} from '@/types';
import { ErrorType, type AppError, getRawContent } from '@/types';
import { getApiClient, ApiError } from '@/lib/apiClient';

// ==================== 类型定义 ====================

/**
 * 服务错误类
 * 用于服务层抛出的错误
 */
export class ServiceError extends Error implements AppError {
  type: ErrorType;
  field?: string;
  details?: Record<string, unknown>;

  constructor(type: ErrorType, message: string, field?: string) {
    super(message);
    this.name = 'ServiceError';
    this.type = type;
    this.field = field;
  }
}

/**
 * API 返回的选项格式
 */
interface OptionApiResponse {
  id: string;
  content: RichContent;
  isCorrect: boolean;
}

/**
 * API 返回的标签格式
 */
interface TagApiResponse {
  id: string;
  name: string;
}

/**
 * API 返回的题目格式
 */
interface QuestionApiResponse {
  id: string;
  title: string;
  content: RichContent;
  type: Question['type'];
  difficulty: Question['difficulty'];
  categoryId: string;
  tags?: TagApiResponse[];  // 后端返回的是 tags 对象数组
  options?: OptionApiResponse[];
  answer: string | string[];
  explanation?: RichContent;
  createdAt: string;
  updatedAt: string;
}

/**
 * 请求选项格式
 */
interface RequestOption {
  id: string;
  content: string;
  isCorrect: boolean;
}

/**
 * 创建题目请求参数
 */
interface CreateQuestionRequest {
  title: string;
  content: string;  // 原始 HTML
  type: Question['type'];
  difficulty: Question['difficulty'];
  categoryId: string;
  tagIds?: string[];
  knowledgePointIds?: string[];
  options?: RequestOption[];
  answer: string | string[];
  explanation?: string;
}

/**
 * 查询题目参数
 * 添加索引签名以兼容 Record<string, unknown>
 */
interface QueryQuestionParams {
  [key: string]: unknown;
  page?: number;
  pageSize?: number;
  keyword?: string;
  categoryId?: string;
  type?: Question['type'];
  difficulty?: Question['difficulty'];
  tagIds?: string[];
  knowledgePointIds?: string[];
}

// ==================== 数据转换函数 ====================

/**
 * 将 API 响应的选项转换为前端类型
 */
function convertApiOptionToOption(apiOption: OptionApiResponse): Option {
  return {
    id: apiOption.id,
    content: apiOption.content,
    isCorrect: apiOption.isCorrect,
  };
}

/**
 * 将 API 响应转换为前端 Question 类型
 * 
 * 设计思想：
 * - 后端返回的数据格式可能与前端使用的格式不同
 * - 服务层负责进行格式转换，使上层代码无需关心后端格式
 */
function convertApiResponseToQuestion(api: QuestionApiResponse): Question {
  return {
    id: api.id,
    title: api.title,
    content: api.content,
    type: api.type,
    difficulty: api.difficulty,
    categoryId: api.categoryId,
    tagIds: api.tags?.map(tag => tag.id) || [],  // 从 tags 对象数组提取 id
    options: api.options?.map(convertApiOptionToOption),
    answer: api.answer,
    explanation: api.explanation,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
  };
}

/**
 * 将表单选项转换为 API 请求格式
 */
function convertFormOptionToRequest(option: FormOption): RequestOption {
  return {
    id: option.id,
    content: option.content,
    isCorrect: option.isCorrect,
  };
}

/**
 * 将表单值转换为 API 请求格式
 */
function convertFormValuesToRequest(data: QuestionFormValues): CreateQuestionRequest {
  return {
    title: data.title,
    content: data.content,
    type: data.type,
    difficulty: data.difficulty,
    categoryId: data.categoryId,
    tagIds: data.tagIds,
    knowledgePointIds: data.knowledgePointIds,
    options: data.options?.map(convertFormOptionToRequest),
    answer: data.answer,
    explanation: data.explanation,
  };
}

/**
 * 将存储格式的选项转换为表单格式
 */
function convertStorageOptionsToForm(options?: Option[]): FormOption[] | undefined {
  if (!options) return undefined;
  return options.map(opt => ({
    id: opt.id,
    content: getRawContent(opt.content),
    isCorrect: opt.isCorrect,
  }));
}

/**
 * 将题目转换为表单值（用于编辑）
 */
export function convertQuestionToFormValues(question: Question): QuestionFormValues {
  return {
    title: question.title,
    content: getRawContent(question.content),
    type: question.type,
    difficulty: question.difficulty,
    categoryId: question.categoryId,
    tagIds: question.tagIds,
    knowledgePointIds: question.knowledgePointIds,
    options: convertStorageOptionsToForm(question.options as Option[]),
    answer: question.answer,
    explanation: getRawContent(question.explanation),
  };
}

// ==================== API 服务方法 ====================

/**
 * 获取题目列表（支持筛选和分页）
 * 
 * @param filters - 筛选条件
 * @returns 分页后的题目列表
 * 
 * 示例：
 * ```typescript
 * const result = await getQuestions({
 *   page: 1,
 *   pageSize: 10,
 *   keyword: '数学',
 *   type: 'single_choice',
 *   difficulty: 'easy'
 * });
 * console.log(result.data);  // 题目列表
 * console.log(result.total); // 总数
 * ```
 */
export async function getQuestions(
  filters: QuestionFilters
): Promise<PaginatedResponse<Question>> {
  const api = getApiClient();
  
  // 构建查询参数
  const params: QueryQuestionParams = {
    page: filters.page,
    pageSize: filters.pageSize,
  };
  
  // 添加可选筛选条件
  if (filters.keyword?.trim()) {
    params.keyword = filters.keyword.trim();
  }
  if (filters.categoryId) {
    params.categoryId = filters.categoryId;
  }
  if (filters.type) {
    params.type = filters.type;
  }
  if (filters.difficulty) {
    params.difficulty = filters.difficulty;
  }
  if (filters.tagIds && filters.tagIds.length > 0) {
    params.tagIds = filters.tagIds;
  }
  if (filters.knowledgePointIds && filters.knowledgePointIds.length > 0) {
    params.knowledgePointIds = filters.knowledgePointIds;
  }
  
  // 调用 API，后端返回 { statusCode, message, data: { data, total, page, pageSize } }
  const response = await api.get<{ data: { data: QuestionApiResponse[]; total: number; page: number; pageSize: number } }>('/questions', params);
  
  // 转换数据格式
  return {
    data: response.data.data.map(convertApiResponseToQuestion),
    total: response.data.total,
    page: response.data.page,
    pageSize: response.data.pageSize,
  };
}

/**
 * 获取所有题目（不分页）
 * 
 * 注意：仅用于需要获取全部数据的场景，如导出
 * 大量数据时应使用分页接口
 */
export async function getAllQuestions(): Promise<Question[]> {
  const result = await getQuestions({ page: 1, pageSize: 1000 });
  return result.data;
}

/**
 * 根据 ID 获取单个题目
 * 
 * @param id - 题目 ID
 * @returns 题目数据
 * @throws ServiceError 当题目不存在时
 */
export async function getQuestionById(id: string): Promise<Question> {
  const api = getApiClient();
  
  try {
    // 后端返回 { statusCode, message, data: QuestionApiResponse }
    const response = await api.get<{ data: QuestionApiResponse }>(`/questions/${id}`);
    return convertApiResponseToQuestion(response.data);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      throw new ServiceError(ErrorType.NOT_FOUND, '题目不存在', 'id');
    }
    throw error;
  }
}

/**
 * 创建新题目
 * 
 * @param data - 题目表单数据
 * @returns 创建的题目
 * 
 * 示例：
 * ```typescript
 * const question = await createQuestion({
 *   title: '1 + 1 = ?',
 *   content: '<p>请计算</p>',
 *   type: 'single_choice',
 *   difficulty: 'easy',
 *   categoryId: 'xxx',
 *   tagIds: ['tag1', 'tag2'],
 *   options: [
 *     { id: 'a', content: '1', isCorrect: false },
 *     { id: 'b', content: '2', isCorrect: true },
 *   ],
 *   answer: 'b',
 * });
 * ```
 */
export async function createQuestion(data: QuestionFormValues): Promise<Question> {
  const api = getApiClient();
  
  const request = convertFormValuesToRequest(data);
  // 后端返回 { statusCode, message, data: QuestionApiResponse }
  const response = await api.post<{ data: QuestionApiResponse }>('/questions', request);
  
  return convertApiResponseToQuestion(response.data);
}

/**
 * 更新题目
 * 
 * @param id - 题目 ID
 * @param data - 更新的数据
 * @returns 更新后的题目
 * @throws ServiceError 当题目不存在时
 */
export async function updateQuestion(id: string, data: QuestionFormValues): Promise<Question> {
  const api = getApiClient();
  
  try {
    const request = convertFormValuesToRequest(data);
    // 后端返回 { statusCode, message, data: QuestionApiResponse }
    const response = await api.patch<{ data: QuestionApiResponse }>(`/questions/${id}`, request);
    return convertApiResponseToQuestion(response.data);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      throw new ServiceError(ErrorType.NOT_FOUND, '题目不存在', 'id');
    }
    throw error;
  }
}

/**
 * 删除题目
 * 
 * @param id - 题目 ID
 * @throws ServiceError 当题目不存在时
 */
export async function deleteQuestion(id: string): Promise<void> {
  const api = getApiClient();
  
  try {
    await api.delete(`/questions/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      throw new ServiceError(ErrorType.NOT_FOUND, '题目不存在', 'id');
    }
    throw error;
  }
}

/**
 * 批量删除题目
 * 
 * @param ids - 题目 ID 列表
 * 
 * 注意：后端可能不支持批量删除，这里逐个删除
 * 如果后端支持批量删除接口，可以优化为单次请求
 */
export async function deleteQuestions(ids: string[]): Promise<void> {
  await Promise.all(ids.map(id => deleteQuestion(id)));
}

// ==================== 辅助方法（保持向后兼容） ====================

/**
 * 移除题目中的标签引用
 * 当标签被删除时调用
 * 
 * 注意：这个操作现在由后端处理，前端无需手动调用
 * 保留此方法是为了向后兼容
 * 
 * @deprecated 后端会自动处理标签删除时的关联更新
 */
export function removeTagFromQuestions(_tagId: string): void {
  console.warn('removeTagFromQuestions is deprecated. Backend handles this automatically.');
}

/**
 * 获取指定分类下的题目数量
 * 
 * @param categoryId - 分类 ID
 * @returns 题目数量
 */
export async function getQuestionCountByCategory(categoryId: string): Promise<number> {
  const result = await getQuestions({
    page: 1,
    pageSize: 1,
    categoryId,
  });
  return result.total;
}

/**
 * 检查分类是否有关联的题目
 * 
 * @param categoryId - 分类 ID
 * @returns 是否有关联题目
 */
export async function hasCategoryQuestions(categoryId: string): Promise<boolean> {
  const count = await getQuestionCountByCategory(categoryId);
  return count > 0;
}
