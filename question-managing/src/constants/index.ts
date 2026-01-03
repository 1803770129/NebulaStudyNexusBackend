/**
 * 题目后台管理系统 - 常量配置
 * 
 * 集中管理系统中使用的所有常量，便于维护和修改
 */

import { QuestionType, DifficultyLevel } from '@/types'

// ==================== 题目类型配置 ====================

/**
 * 题目类型选项配置
 * 用于下拉选择框和显示
 */
export const QUESTION_TYPE_OPTIONS = [
  { value: QuestionType.SINGLE_CHOICE, label: '单选题', color: '#1890ff' },
  { value: QuestionType.MULTIPLE_CHOICE, label: '多选题', color: '#52c41a' },
  { value: QuestionType.TRUE_FALSE, label: '判断题', color: '#faad14' },
  { value: QuestionType.FILL_BLANK, label: '填空题', color: '#722ed1' },
  { value: QuestionType.SHORT_ANSWER, label: '简答题', color: '#eb2f96' },
] as const

/**
 * 题目类型标签映射
 * 快速获取类型的中文名称
 */
export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  [QuestionType.SINGLE_CHOICE]: '单选题',
  [QuestionType.MULTIPLE_CHOICE]: '多选题',
  [QuestionType.TRUE_FALSE]: '判断题',
  [QuestionType.FILL_BLANK]: '填空题',
  [QuestionType.SHORT_ANSWER]: '简答题',
}

// ==================== 难度等级配置 ====================

/**
 * 难度等级选项配置
 */
export const DIFFICULTY_OPTIONS = [
  { value: DifficultyLevel.EASY, label: '简单', color: '#52c41a' },
  { value: DifficultyLevel.MEDIUM, label: '中等', color: '#faad14' },
  { value: DifficultyLevel.HARD, label: '困难', color: '#f5222d' },
] as const

/**
 * 难度等级标签映射
 */
export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  [DifficultyLevel.EASY]: '简单',
  [DifficultyLevel.MEDIUM]: '中等',
  [DifficultyLevel.HARD]: '困难',
}

/**
 * 难度等级颜色映射
 */
export const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  [DifficultyLevel.EASY]: '#52c41a',
  [DifficultyLevel.MEDIUM]: '#faad14',
  [DifficultyLevel.HARD]: '#f5222d',
}

// ==================== 分页配置 ====================

/**
 * 默认分页配置
 */
export const DEFAULT_PAGINATION = {
  page: 1,
  pageSize: 10,
} as const

/**
 * 每页数量选项
 */
export const PAGE_SIZE_OPTIONS = ['10', '20', '50', '100'] as const

// ==================== 分类配置 ====================

/**
 * 分类最大层级
 */
export const MAX_CATEGORY_LEVEL = 3

// ==================== 存储键名 ====================

/**
 * localStorage 存储键名
 */
export const STORAGE_KEYS = {
  QUESTIONS: 'question_manager_questions',
  CATEGORIES: 'question_manager_categories',
  TAGS: 'question_manager_tags',
  UI_STATE: 'question_manager_ui_state',
} as const

// ==================== 默认标签颜色 ====================

/**
 * 预设标签颜色列表
 */
export const TAG_COLORS = [
  '#f50',
  '#2db7f5',
  '#87d068',
  '#108ee9',
  '#722ed1',
  '#eb2f96',
  '#faad14',
  '#13c2c2',
  '#52c41a',
  '#1890ff',
] as const

// ==================== 表单验证规则 ====================

/**
 * 题目标题最大长度
 */
export const MAX_TITLE_LENGTH = 200

/**
 * 题目内容最大长度
 */
export const MAX_CONTENT_LENGTH = 5000

/**
 * 选项最大数量
 */
export const MAX_OPTIONS_COUNT = 10

/**
 * 选项最小数量（选择题）
 */
export const MIN_OPTIONS_COUNT = 2

// ==================== 响应式断点 ====================

/**
 * 响应式布局断点
 */
export const BREAKPOINTS = {
  /** 移动端 */
  MOBILE: 768,
  /** 平板端 */
  TABLET: 1024,
  /** 桌面端 */
  DESKTOP: 1200,
} as const
