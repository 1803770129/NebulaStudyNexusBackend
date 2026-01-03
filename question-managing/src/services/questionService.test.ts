/**
 * 题目服务层测试
 * 
 * Feature: question-management-system
 * Property 3: 筛选结果正确性
 * Property 4: 搜索结果相关性
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from './questionService'
import type { Question, QuestionFormValues } from '@/types'
import { QuestionType, DifficultyLevel } from '@/types'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// 生成随机题目的 Arbitrary
const questionFormArbitrary = fc.record({
  title: fc.string({ minLength: 1, maxLength: 100 }),
  content: fc.string({ minLength: 1, maxLength: 500 }),
  type: fc.constantFrom(...Object.values(QuestionType)),
  difficulty: fc.constantFrom(...Object.values(DifficultyLevel)),
  categoryId: fc.string({ minLength: 1, maxLength: 20 }),
  tagIds: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }),
  answer: fc.string({ minLength: 1, maxLength: 200 }),
  explanation: fc.option(fc.string({ maxLength: 300 }), { nil: undefined }),
}) as fc.Arbitrary<QuestionFormValues>

// 创建测试题目的辅助函数
function createTestQuestion(overrides: Partial<QuestionFormValues> = {}): Question {
  const defaults: QuestionFormValues = {
    title: 'Test Question',
    content: 'Test Content',
    type: QuestionType.SINGLE_CHOICE,
    difficulty: DifficultyLevel.EASY,
    categoryId: 'cat-1',
    tagIds: ['tag-1'],
    answer: 'A',
  }
  return createQuestion({ ...defaults, ...overrides })
}

describe('QuestionService', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  afterEach(() => {
    localStorageMock.clear()
  })

  describe('Basic CRUD Operations', () => {
    it('should create a question', () => {
      const data: QuestionFormValues = {
        title: 'Test Question',
        content: 'Test Content',
        type: QuestionType.SINGLE_CHOICE,
        difficulty: DifficultyLevel.EASY,
        categoryId: 'cat-1',
        tagIds: ['tag-1'],
        answer: 'A',
      }

      const question = createQuestion(data)

      expect(question.id).toBeDefined()
      expect(question.title).toBe(data.title)
      expect(question.createdAt).toBeDefined()
    })

    it('should get question by id', () => {
      const created = createTestQuestion()
      const found = getQuestionById(created.id)

      expect(found).toEqual(created)
    })

    it('should return null for non-existent question', () => {
      const found = getQuestionById('non-existent')
      expect(found).toBeNull()
    })

    it('should update a question', () => {
      const created = createTestQuestion()
      const updated = updateQuestion(created.id, {
        ...created,
        title: 'Updated Title',
      })

      expect(updated.title).toBe('Updated Title')
      expect(updated.id).toBe(created.id)
      expect(updated.createdAt).toBe(created.createdAt)
    })

    it('should delete a question', () => {
      const created = createTestQuestion()
      deleteQuestion(created.id)

      const found = getQuestionById(created.id)
      expect(found).toBeNull()
    })
  })

  /**
   * Property 3: 筛选结果正确性
   * For any 筛选条件组合（分类、难度、类型、标签），
   * 返回的所有题目都应满足所有指定的筛选条件。
   */
  describe('Property 3: Filter Results Correctness', () => {
    it('should filter by category correctly', () => {
      fc.assert(
        fc.property(
          fc.array(questionFormArbitrary, { minLength: 5, maxLength: 20 }),
          fc.string({ minLength: 1, maxLength: 20 }),
          (questions, targetCategoryId) => {
            // Setup: 创建题目
            localStorageMock.clear()
            questions.forEach(q => createQuestion(q))

            // 随机选择一个分类进行筛选
            const result = getQuestions({
              categoryId: targetCategoryId,
              page: 1,
              pageSize: 100,
            })

            // 验证: 所有返回的题目都属于目标分类
            result.data.forEach(q => {
              expect(q.categoryId).toBe(targetCategoryId)
            })
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should filter by difficulty correctly', () => {
      fc.assert(
        fc.property(
          fc.array(questionFormArbitrary, { minLength: 5, maxLength: 20 }),
          fc.constantFrom(...Object.values(DifficultyLevel)),
          (questions, targetDifficulty) => {
            localStorageMock.clear()
            questions.forEach(q => createQuestion(q))

            const result = getQuestions({
              difficulty: targetDifficulty,
              page: 1,
              pageSize: 100,
            })

            result.data.forEach(q => {
              expect(q.difficulty).toBe(targetDifficulty)
            })
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should filter by type correctly', () => {
      fc.assert(
        fc.property(
          fc.array(questionFormArbitrary, { minLength: 5, maxLength: 20 }),
          fc.constantFrom(...Object.values(QuestionType)),
          (questions, targetType) => {
            localStorageMock.clear()
            questions.forEach(q => createQuestion(q))

            const result = getQuestions({
              type: targetType,
              page: 1,
              pageSize: 100,
            })

            result.data.forEach(q => {
              expect(q.type).toBe(targetType)
            })
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should filter by combined conditions correctly', () => {
      fc.assert(
        fc.property(
          fc.array(questionFormArbitrary, { minLength: 10, maxLength: 30 }),
          fc.constantFrom(...Object.values(QuestionType)),
          fc.constantFrom(...Object.values(DifficultyLevel)),
          (questions, targetType, targetDifficulty) => {
            localStorageMock.clear()
            questions.forEach(q => createQuestion(q))

            const result = getQuestions({
              type: targetType,
              difficulty: targetDifficulty,
              page: 1,
              pageSize: 100,
            })

            // 所有返回的题目都应满足所有筛选条件
            result.data.forEach(q => {
              expect(q.type).toBe(targetType)
              expect(q.difficulty).toBe(targetDifficulty)
            })
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  /**
   * Property 4: 搜索结果相关性
   * For any 搜索关键词，返回的所有题目的标题或内容中
   * 应包含该关键词（不区分大小写）。
   */
  describe('Property 4: Search Results Relevance', () => {
    it('should return questions containing keyword in title or content', () => {
      fc.assert(
        fc.property(
          fc.array(questionFormArbitrary, { minLength: 5, maxLength: 20 }),
          fc.string({ minLength: 1, maxLength: 20 }),
          (questions, keyword) => {
            localStorageMock.clear()
            questions.forEach(q => createQuestion(q))

            const result = getQuestions({
              keyword,
              page: 1,
              pageSize: 100,
            })

            const lowerKeyword = keyword.toLowerCase().trim()
            
            // 所有返回的题目的标题或内容都应包含关键词
            result.data.forEach(q => {
              const titleContains = q.title.toLowerCase().includes(lowerKeyword)
              const contentContains = q.content.toLowerCase().includes(lowerKeyword)
              expect(titleContains || contentContains).toBe(true)
            })
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should be case-insensitive when searching', () => {
      localStorageMock.clear()
      
      createTestQuestion({ title: 'UPPERCASE Title', content: 'content' })
      createTestQuestion({ title: 'lowercase title', content: 'content' })
      createTestQuestion({ title: 'MixedCase Title', content: 'content' })

      const result = getQuestions({
        keyword: 'title',
        page: 1,
        pageSize: 100,
      })

      expect(result.data.length).toBe(3)
    })
  })

  describe('Pagination', () => {
    it('should return correct page size', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 50 }),
          fc.integer({ min: 1, max: 10 }),
          (totalCount, pageSize) => {
            localStorageMock.clear()
            
            // 创建指定数量的题目
            for (let i = 0; i < totalCount; i++) {
              createTestQuestion({ title: `Question ${i}` })
            }

            const result = getQuestions({ page: 1, pageSize })

            // 返回的数据量不应超过 pageSize
            expect(result.data.length).toBeLessThanOrEqual(pageSize)
            expect(result.total).toBe(totalCount)
          }
        ),
        { numRuns: 30 }
      )
    })
  })
})
