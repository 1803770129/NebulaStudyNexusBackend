/**
 * 题目后台管理系统 - 核心类型定义
 *
 * 本文件定义了系统中所有核心数据模型的 TypeScript 类型
 * 使用枚举确保类型安全，使用接口定义数据结构
 */

// ==================== 枚举定义 ====================

/**
 * 题目类型枚举
 * 定义系统支持的所有题目类型
 */
export const QuestionType = {
  /** 单选题 - 只有一个正确答案 */
  SINGLE_CHOICE: 'single_choice',
  /** 多选题 - 可以有多个正确答案 */
  MULTIPLE_CHOICE: 'multiple_choice',
  /** 判断题 - 只有对/错两个选项 */
  TRUE_FALSE: 'true_false',
  /** 填空题 - 需要填写答案 */
  FILL_BLANK: 'fill_blank',
  /** 简答题 - 需要文字描述答案 */
  SHORT_ANSWER: 'short_answer',
} as const

export type QuestionType = (typeof QuestionType)[keyof typeof QuestionType]

/**
 * 难度等级枚举
 * 用于标记题目的难易程度
 */
export const DifficultyLevel = {
  /** 简单 */
  EASY: 'easy',
  /** 中等 */
  MEDIUM: 'medium',
  /** 困难 */
  HARD: 'hard',
} as const

export type DifficultyLevel = (typeof DifficultyLevel)[keyof typeof DifficultyLevel]

// ==================== 基础接口定义 ====================

/**
 * 富文本内容接口
 * 用于存储原始内容和渲染后内容
 */
export interface RichContent {
  /** 原始 HTML（包含 LaTeX 标记），用于编辑器加载 */
  raw: string
  /** 渲染后 HTML（公式已转图片），用于展示 */
  rendered: string
}

/**
 * 选项接口
 * 用于选择题的选项定义
 */
export interface Option {
  /** 选项唯一标识 */
  id: string
  /** 选项内容（支持富文本） */
  content: string | RichContent
  /** 是否为正确答案 */
  isCorrect: boolean
}

/**
 * 题目接口
 * 系统核心数据模型，包含题目的所有信息
 */
export interface Question {
  /** 题目唯一标识 */
  id: string
  /** 题目标题 */
  title: string
  /** 题目内容/题干（支持富文本） */
  content: string | RichContent
  /** 题目类型 */
  type: QuestionType
  /** 难度等级 */
  difficulty: DifficultyLevel
  /** 所属分类ID */
  categoryId: string
  /** 关联的标签ID列表 */
  tagIds: string[]
  /** 关联的知识点ID列表 */
  knowledgePointIds?: string[]
  /** 选择题选项（仅选择题有此字段） */
  options?: Option[]
  /** 答案（字符串或字符串数组） */
  answer: string | string[]
  /** 答案解析（支持富文本） */
  explanation?: string | RichContent
  /** 创建时间 ISO 格式 */
  createdAt: string
  /** 更新时间 ISO 格式 */
  updatedAt: string
}

/**
 * 分类接口
 * 支持多级分类结构（最多三级）
 */
export interface Category {
  /** 分类唯一标识 */
  id: string
  /** 分类名称 */
  name: string
  /** 父分类ID，顶级分类为 null */
  parentId: string | null
  /** 层级深度 1-3 */
  level: number
  /** 分类路径，如 "1/2/3" */
  path: string
  /** 该分类下的题目数量 */
  questionCount: number
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
}

/**
 * 标签接口
 * 用于题目的多维度标记
 */
export interface Tag {
  /** 标签唯一标识 */
  id: string
  /** 标签名称 */
  name: string
  /** 标签颜色（十六进制） */
  color: string
  /** 使用该标签的题目数量 */
  questionCount: number
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
}

/**
 * 学生用户接口
 * 对应后端 Student 实体
 */
export interface Student {
  /** 学生唯一标识 */
  id: string
  /** 手机号 */
  phone: string | null
  /** 微信 openid */
  wxOpenid: string | null
  /** 微信 unionid */
  wxUnionid: string | null
  /** 昵称 */
  nickname: string
  /** 头像 URL */
  avatar: string
  /** 账号是否启用 */
  isActive: boolean
  /** 最后登录时间 */
  lastLoginAt: string | null
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
}

/**
 * 学生筛选条件
 */
export interface StudentFilters {
  /** 搜索关键词（昵称/手机号） */
  keyword?: string
  /** 账号状态 */
  isActive?: boolean
  /** 页码 */
  page: number
  /** 每页数量 */
  limit: number
}

// ==================== 筛选与分页接口 ====================

/**
 * 题目筛选条件接口
 * 用于列表页的搜索和筛选
 */
export interface QuestionFilters {
  /** 搜索关键词 */
  keyword?: string
  /** 分类ID筛选 */
  categoryId?: string
  /** 题目类型筛选 */
  type?: QuestionType
  /** 难度筛选 */
  difficulty?: DifficultyLevel
  /** 标签ID列表筛选 */
  tagIds?: string[]
  /** 知识点ID列表筛选 */
  knowledgePointIds?: string[]
  /** 当前页码 */
  page: number
  /** 每页数量 */
  pageSize: number
}

/**
 * 分页配置接口
 * 用于表格分页组件
 */
export interface PaginationConfig {
  /** 当前页码 */
  current: number
  /** 每页数量 */
  pageSize: number
  /** 总数据量 */
  total: number
}

// ==================== 表单值接口 ====================

/**
 * 表单选项接口
 * 用于表单中的选项数据（使用原始字符串）
 */
export interface FormOption {
  /** 选项唯一标识 */
  id: string
  /** 选项内容（原始 HTML） */
  content: string
  /** 是否为正确答案 */
  isCorrect: boolean
}

/**
 * 题目表单值接口
 * 用于创建和编辑题目时的表单数据
 * 表单中使用原始 HTML 字符串，提交时由后端处理为 RichContent
 */
export interface QuestionFormValues {
  title: string
  /** 题目内容（原始 HTML） */
  content: string
  type: QuestionType
  difficulty: DifficultyLevel
  categoryId: string
  tagIds: string[]
  /** 知识点 ID 列表 */
  knowledgePointIds?: string[]
  /** 选项（使用原始 HTML） */
  options?: FormOption[]
  answer: string | string[]
  /** 答案解析（原始 HTML） */
  explanation?: string
}

/**
 * 分类表单值接口
 */
export interface CategoryFormValues {
  name: string
  parentId: string | null
}

/**
 * 标签表单值接口
 */
export interface TagFormValues {
  name: string
  color: string
}

// ==================== 树形结构接口 ====================

/**
 * 分类树节点接口
 * 用于 Ant Design Tree 组件
 */
export interface CategoryTreeNode {
  key: string
  title: string
  children?: CategoryTreeNode[]
  /** 原始分类数据 */
  data: Category
}

// ==================== 错误处理接口 ====================

/**
 * 错误类型枚举
 */
export const ErrorType = {
  /** 验证错误 */
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  /** 资源未找到 */
  NOT_FOUND: 'NOT_FOUND',
  /** 重复错误 */
  DUPLICATE_ERROR: 'DUPLICATE_ERROR',
  /** 约束错误 */
  CONSTRAINT_ERROR: 'CONSTRAINT_ERROR',
  /** 存储错误 */
  STORAGE_ERROR: 'STORAGE_ERROR',
  /** 网络错误 */
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const

export type ErrorType = (typeof ErrorType)[keyof typeof ErrorType]

/**
 * 应用错误接口
 */
export interface AppError {
  /** 错误类型 */
  type: ErrorType
  /** 错误消息 */
  message: string
  /** 相关字段（表单验证时使用） */
  field?: string
  /** 额外详情 */
  details?: Record<string, unknown>
}

// ==================== API 响应接口 ====================

/**
 * 分页响应接口
 */
export interface PaginatedResponse<T> {
  /** 数据列表 */
  data: T[]
  /** 总数量 */
  total: number
  /** 当前页码 */
  page: number
  /** 每页数量 */
  pageSize: number
}

// ==================== 工具函数 ====================

/**
 * 从 RichContent 或字符串中提取原始内容
 * 用于编辑器加载
 */
export function getRawContent(content: string | RichContent | undefined): string {
  if (!content) return ''
  if (typeof content === 'string') return content
  return content.raw || ''
}

/**
 * 从 RichContent 或字符串中提取渲染后内容
 * 用于展示
 */
export function getRenderedContent(content: string | RichContent | undefined): string {
  if (!content) return ''
  if (typeof content === 'string') return content
  return content.rendered || content.raw || ''
}

/**
 * 检查内容是否为 RichContent 类型
 */
export function isRichContent(content: unknown): content is RichContent {
  return (
    typeof content === 'object' && content !== null && 'raw' in content && 'rendered' in content
  )
}
