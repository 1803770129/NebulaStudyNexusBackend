/**
 * localStorage 工具函数测试
 * 
 * Feature: question-management-system
 * Property 14: 数据持久化往返
 * Validates: Requirements 8.1, 8.2, 8.3
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { getItem, setItem, removeItem, isStorageAvailable } from './storage'
import type { Question, Category, Tag } from '@/types'
import { QuestionType, DifficultyLevel } from '@/types'

// Mock localStorage for testing
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

describe('Storage Utils', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  afterEach(() => {
    localStorageMock.clear()
  })

  describe('Basic Operations', () => {
    it('should store and retrieve string values', () => {
      setItem('test', 'hello')
      expect(getItem<string>('test')).toBe('hello')
    })

    it('should store and retrieve object values', () => {
      const obj = { name: 'test', value: 123 }
      setItem('test', obj)
      expect(getItem('test')).toEqual(obj)
    })

    it('should return null for non-existent keys', () => {
      expect(getItem('nonexistent')).toBeNull()
    })

    it('should remove items correctly', () => {
      setItem('test', 'value')
      removeItem('test')
      expect(getItem('test')).toBeNull()
    })

    it('should check storage availability', () => {
      expect(isStorageAvailable()).toBe(true)
    })
  })

  /**
   * Property 14: 数据持久化往返
   * For any 题目/分类/标签数据，序列化到 localStorage 后再反序列化，
   * 应得到与原始数据等价的对象。
   */
  describe('Property 14: Round-trip Persistence', () => {
    // 生成随机 Question 的 Arbitrary
    const questionArbitrary = fc.record({
      id: fc.string({ minLength: 1, maxLength: 50 }),
      title: fc.string({ minLength: 1, maxLength: 200 }),
      content: fc.string({ maxLength: 1000 }),
      type: fc.constantFrom(...Object.values(QuestionType)),
      difficulty: fc.constantFrom(...Object.values(DifficultyLevel)),
      categoryId: fc.string({ minLength: 1, maxLength: 50 }),
      tagIds: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 10 }),
      options: fc.option(
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 20 }),
            content: fc.string({ minLength: 1, maxLength: 500 }),
            isCorrect: fc.boolean(),
          }),
          { minLength: 2, maxLength: 6 }
        ),
        { nil: undefined }
      ),
      answer: fc.oneof(
        fc.string({ maxLength: 500 }),
        fc.array(fc.string({ maxLength: 100 }), { maxLength: 5 })
      ),
      explanation: fc.option(fc.string({ maxLength: 1000 }), { nil: undefined }),
      createdAt: fc.date().map(d => d.toISOString()),
      updatedAt: fc.date().map(d => d.toISOString()),
    }) as fc.Arbitrary<Question>

    // 生成随机 Category 的 Arbitrary
    const categoryArbitrary = fc.record({
      id: fc.string({ minLength: 1, maxLength: 50 }),
      name: fc.string({ minLength: 1, maxLength: 100 }),
      parentId: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: null }),
      level: fc.integer({ min: 1, max: 3 }),
      path: fc.string({ minLength: 1, maxLength: 100 }),
      questionCount: fc.integer({ min: 0, max: 10000 }),
      createdAt: fc.date().map(d => d.toISOString()),
      updatedAt: fc.date().map(d => d.toISOString()),
    }) as fc.Arbitrary<Category>

    // 生成随机 Tag 的 Arbitrary
    const tagArbitrary = fc.record({
      id: fc.string({ minLength: 1, maxLength: 50 }),
      name: fc.string({ minLength: 1, maxLength: 50 }),
      color: fc.stringMatching(/^#[0-9a-fA-F]{6}$/),
      questionCount: fc.integer({ min: 0, max: 10000 }),
      createdAt: fc.date().map(d => d.toISOString()),
      updatedAt: fc.date().map(d => d.toISOString()),
    }) as fc.Arbitrary<Tag>

    it('should round-trip Question data correctly', () => {
      fc.assert(
        fc.property(questionArbitrary, (question) => {
          const key = 'test_question'
          setItem(key, question)
          const retrieved = getItem<Question>(key)
          expect(retrieved).toEqual(question)
        }),
        { numRuns: 100 }
      )
    })

    it('should round-trip Category data correctly', () => {
      fc.assert(
        fc.property(categoryArbitrary, (category) => {
          const key = 'test_category'
          setItem(key, category)
          const retrieved = getItem<Category>(key)
          expect(retrieved).toEqual(category)
        }),
        { numRuns: 100 }
      )
    })

    it('should round-trip Tag data correctly', () => {
      fc.assert(
        fc.property(tagArbitrary, (tag) => {
          const key = 'test_tag'
          setItem(key, tag)
          const retrieved = getItem<Tag>(key)
          expect(retrieved).toEqual(tag)
        }),
        { numRuns: 100 }
      )
    })

    it('should round-trip arrays of Questions correctly', () => {
      fc.assert(
        fc.property(fc.array(questionArbitrary, { maxLength: 20 }), (questions) => {
          const key = 'test_questions'
          setItem(key, questions)
          const retrieved = getItem<Question[]>(key)
          expect(retrieved).toEqual(questions)
        }),
        { numRuns: 50 }
      )
    })

    it('should round-trip primitive types correctly', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.string(),
            fc.integer(),
            fc.double({ noNaN: true }),
            fc.boolean(),
            fc.constant(null)
          ),
          (value) => {
            const key = 'test_primitive'
            setItem(key, value)
            const retrieved = getItem(key)
            expect(retrieved).toEqual(value)
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
