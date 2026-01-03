/**
 * 标签服务层测试
 * 
 * Feature: question-management-system
 * Property 12: 标签名称唯一性
 * Property 13: 标签关联清理
 * Validates: Requirements 7.2, 7.4
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import {
  createTag,
  updateTag,
  deleteTag,
  getTagById,
} from './tagService'
import { createQuestion, getQuestionById, getAllQuestions } from './questionService'
import type { TagFormValues } from '@/types'
import { QuestionType, DifficultyLevel, ErrorType } from '@/types'
import { ServiceError } from './questionService'

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

describe('TagService', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  afterEach(() => {
    localStorageMock.clear()
  })

  describe('Basic CRUD Operations', () => {
    it('should create a tag', () => {
      const data: TagFormValues = {
        name: 'Test Tag',
        color: '#ff0000',
      }

      const tag = createTag(data)

      expect(tag.id).toBeDefined()
      expect(tag.name).toBe(data.name)
      expect(tag.color).toBe(data.color)
      expect(tag.questionCount).toBe(0)
    })

    it('should create a tag with random color if not provided', () => {
      const tag = createTag({ name: 'No Color', color: '' })
      
      expect(tag.color).toBeDefined()
      expect(tag.color).toMatch(/^#[0-9a-fA-F]+$/)
    })

    it('should get tag by id', () => {
      const created = createTag({ name: 'Test', color: '#000' })
      const found = getTagById(created.id)

      expect(found).toEqual(created)
    })

    it('should update a tag', () => {
      const created = createTag({ name: 'Original', color: '#000' })
      const updated = updateTag(created.id, {
        name: 'Updated',
        color: '#fff',
      })

      expect(updated.name).toBe('Updated')
      expect(updated.color).toBe('#fff')
      expect(updated.id).toBe(created.id)
    })

    it('should delete a tag', () => {
      const created = createTag({ name: 'Test', color: '#000' })
      deleteTag(created.id)

      const found = getTagById(created.id)
      expect(found).toBeNull()
    })
  })

  /**
   * Property 12: 标签名称唯一性
   * For any 标签，名称应保持唯一，
   * 创建重复名称的标签应被拒绝。
   */
  describe('Property 12: Tag Name Uniqueness', () => {
    it('should reject duplicate tag names', () => {
      createTag({ name: 'Unique Tag', color: '#000' })

      expect(() => {
        createTag({ name: 'Unique Tag', color: '#fff' })
      }).toThrow(ServiceError)
    })

    it('should reject duplicate names when updating', () => {
      createTag({ name: 'Tag A', color: '#000' })
      const tagB = createTag({ name: 'Tag B', color: '#fff' })

      expect(() => {
        updateTag(tagB.id, { name: 'Tag A', color: '#fff' })
      }).toThrow(ServiceError)
    })

    it('should allow updating tag with same name', () => {
      const tag = createTag({ name: 'Same Name', color: '#000' })
      
      // 更新为相同名称应该成功
      const updated = updateTag(tag.id, { name: 'Same Name', color: '#fff' })
      
      expect(updated.name).toBe('Same Name')
      expect(updated.color).toBe('#fff')
    })

    it('should check uniqueness correctly with property testing', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 30 }),
          (name) => {
            localStorageMock.clear()
            
            // 创建第一个标签
            createTag({ name, color: '#000' })
            
            // 创建相同名称应该失败
            let duplicateError = false
            try {
              createTag({ name, color: '#fff' })
            } catch (e) {
              if (e instanceof ServiceError && e.type === ErrorType.DUPLICATE_ERROR) {
                duplicateError = true
              }
            }
            
            expect(duplicateError).toBe(true)
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  /**
   * Property 13: 标签关联清理
   * For any 被删除的标签，所有题目中对该标签的引用应被自动移除。
   */
  describe('Property 13: Tag Association Cleanup', () => {
    it('should remove tag reference from questions when tag is deleted', () => {
      // 创建标签
      const tag1 = createTag({ name: 'Tag 1', color: '#000' })
      const tag2 = createTag({ name: 'Tag 2', color: '#fff' })

      // 创建关联标签的题目
      const question = createQuestion({
        title: 'Test Question',
        content: 'Content',
        type: QuestionType.SINGLE_CHOICE,
        difficulty: DifficultyLevel.EASY,
        categoryId: 'cat-1',
        tagIds: [tag1.id, tag2.id],
        answer: 'A',
      })

      // 验证题目关联了两个标签
      expect(question.tagIds).toContain(tag1.id)
      expect(question.tagIds).toContain(tag2.id)

      // 删除 tag1
      deleteTag(tag1.id)

      // 验证题目中 tag1 的引用被移除
      const updatedQuestion = getQuestionById(question.id)
      expect(updatedQuestion?.tagIds).not.toContain(tag1.id)
      expect(updatedQuestion?.tagIds).toContain(tag2.id)
    })

    it('should cleanup all questions when tag is deleted', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 10 }),
          (questionCount) => {
            localStorageMock.clear()
            
            // 创建标签
            const tag = createTag({ name: 'To Delete', color: '#000' })
            const otherTag = createTag({ name: 'Keep', color: '#fff' })

            // 创建多个关联该标签的题目
            for (let i = 0; i < questionCount; i++) {
              createQuestion({
                title: `Question ${i}`,
                content: 'Content',
                type: QuestionType.SINGLE_CHOICE,
                difficulty: DifficultyLevel.EASY,
                categoryId: 'cat-1',
                tagIds: [tag.id, otherTag.id],
                answer: 'A',
              })
            }

            // 删除标签
            deleteTag(tag.id)

            // 验证所有题目中该标签的引用都被移除
            const questions = getAllQuestions()
            questions.forEach(q => {
              expect(q.tagIds).not.toContain(tag.id)
              // 其他标签应该保留
              expect(q.tagIds).toContain(otherTag.id)
            })
          }
        ),
        { numRuns: 30 }
      )
    })

    it('should handle questions with only the deleted tag', () => {
      const tag = createTag({ name: 'Only Tag', color: '#000' })

      const question = createQuestion({
        title: 'Single Tag Question',
        content: 'Content',
        type: QuestionType.SINGLE_CHOICE,
        difficulty: DifficultyLevel.EASY,
        categoryId: 'cat-1',
        tagIds: [tag.id],
        answer: 'A',
      })

      deleteTag(tag.id)

      const updatedQuestion = getQuestionById(question.id)
      expect(updatedQuestion?.tagIds).toEqual([])
    })
  })
})
