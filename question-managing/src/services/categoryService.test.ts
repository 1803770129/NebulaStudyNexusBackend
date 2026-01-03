/**
 * 分类服务层测试
 * 
 * Feature: question-management-system
 * Property 9: 分类层级约束
 * Property 10: 分类名称唯一性
 * Property 11: 分类删除约束
 * Validates: Requirements 6.2, 6.3, 6.4, 6.5
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
  getCategoryTree,
} from './categoryService'
import { createQuestion } from './questionService'
import type { CategoryFormValues } from '@/types'
import { QuestionType, DifficultyLevel, ErrorType } from '@/types'
import { MAX_CATEGORY_LEVEL } from '@/constants'
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

describe('CategoryService', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  afterEach(() => {
    localStorageMock.clear()
  })

  describe('Basic CRUD Operations', () => {
    it('should create a category', () => {
      const data: CategoryFormValues = {
        name: 'Test Category',
        parentId: null,
      }

      const category = createCategory(data)

      expect(category.id).toBeDefined()
      expect(category.name).toBe(data.name)
      expect(category.level).toBe(1)
      expect(category.parentId).toBeNull()
    })

    it('should create a child category', () => {
      const parent = createCategory({ name: 'Parent', parentId: null })
      const child = createCategory({ name: 'Child', parentId: parent.id })

      expect(child.parentId).toBe(parent.id)
      expect(child.level).toBe(2)
      expect(child.path).toBe(`${parent.path}/${child.id}`)
    })

    it('should get category by id', () => {
      const created = createCategory({ name: 'Test', parentId: null })
      const found = getCategoryById(created.id)

      expect(found).toEqual(created)
    })

    it('should update a category', () => {
      const created = createCategory({ name: 'Original', parentId: null })
      const updated = updateCategory(created.id, {
        name: 'Updated',
        parentId: null,
      })

      expect(updated.name).toBe('Updated')
      expect(updated.id).toBe(created.id)
    })

    it('should delete a category', () => {
      const created = createCategory({ name: 'Test', parentId: null })
      deleteCategory(created.id)

      const found = getCategoryById(created.id)
      expect(found).toBeNull()
    })
  })

  /**
   * Property 9: 分类层级约束
   * For any 分类操作，分类层级不应超过3级，
   * 且每个分类的路径应正确反映其层级关系。
   */
  describe('Property 9: Category Level Constraint', () => {
    it('should not allow creating category beyond max level', () => {
      // 创建三级分类
      const level1 = createCategory({ name: 'Level 1', parentId: null })
      const level2 = createCategory({ name: 'Level 2', parentId: level1.id })
      const level3 = createCategory({ name: 'Level 3', parentId: level2.id })

      expect(level1.level).toBe(1)
      expect(level2.level).toBe(2)
      expect(level3.level).toBe(3)

      // 尝试创建第四级应该失败
      expect(() => {
        createCategory({ name: 'Level 4', parentId: level3.id })
      }).toThrow(ServiceError)
    })

    it('should maintain correct path for all categories', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 3 }),
          (names) => {
            localStorageMock.clear()
            
            let parentId: string | null = null
            const categories: Array<{ id: string; level: number; path: string }> = []

            // 创建层级分类
            names.forEach((name, index) => {
              const uniqueName = `${name}_${index}`
              const category = createCategory({ name: uniqueName, parentId })
              categories.push({
                id: category.id,
                level: category.level,
                path: category.path,
              })
              parentId = category.id
            })

            // 验证层级和路径
            categories.forEach((cat, index) => {
              expect(cat.level).toBe(index + 1)
              expect(cat.level).toBeLessThanOrEqual(MAX_CATEGORY_LEVEL)
              
              // 路径应该包含所有祖先的 ID
              const pathParts = cat.path.split('/')
              expect(pathParts.length).toBe(index + 1)
            })
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  /**
   * Property 10: 分类名称唯一性
   * For any 同级分类，名称应保持唯一，
   * 创建重复名称的分类应被拒绝。
   */
  describe('Property 10: Category Name Uniqueness', () => {
    it('should reject duplicate names at same level', () => {
      createCategory({ name: 'Unique Name', parentId: null })

      expect(() => {
        createCategory({ name: 'Unique Name', parentId: null })
      }).toThrow(ServiceError)
    })

    it('should allow same name at different levels', () => {
      const parent = createCategory({ name: 'Same Name', parentId: null })
      
      // 不同父级下可以有相同名称
      const child = createCategory({ name: 'Same Name', parentId: parent.id })
      
      expect(child.name).toBe('Same Name')
      expect(child.parentId).toBe(parent.id)
    })

    it('should check uniqueness correctly with property testing', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 30 }),
          (name) => {
            localStorageMock.clear()
            
            // 创建第一个分类
            createCategory({ name, parentId: null })
            
            // 同级创建相同名称应该失败
            let duplicateError = false
            try {
              createCategory({ name, parentId: null })
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
   * Property 11: 分类删除约束
   * For any 包含题目的分类，删除操作应被阻止并返回相应提示。
   */
  describe('Property 11: Category Delete Constraint', () => {
    it('should not allow deleting category with questions', () => {
      const category = createCategory({ name: 'Has Questions', parentId: null })
      
      // 创建一个关联该分类的题目
      createQuestion({
        title: 'Test Question',
        content: 'Content',
        type: QuestionType.SINGLE_CHOICE,
        difficulty: DifficultyLevel.EASY,
        categoryId: category.id,
        tagIds: [],
        answer: 'A',
      })

      // 尝试删除应该失败
      expect(() => {
        deleteCategory(category.id)
      }).toThrow(ServiceError)
    })

    it('should not allow deleting category with children', () => {
      const parent = createCategory({ name: 'Parent', parentId: null })
      createCategory({ name: 'Child', parentId: parent.id })

      // 尝试删除有子分类的分类应该失败
      expect(() => {
        deleteCategory(parent.id)
      }).toThrow(ServiceError)
    })

    it('should allow deleting empty category', () => {
      const category = createCategory({ name: 'Empty', parentId: null })
      
      // 没有题目和子分类的分类可以删除
      deleteCategory(category.id)
      
      expect(getCategoryById(category.id)).toBeNull()
    })
  })

  describe('Category Tree', () => {
    it('should build correct tree structure', () => {
      const root1 = createCategory({ name: 'Root 1', parentId: null })
      createCategory({ name: 'Root 2', parentId: null })
      const child1 = createCategory({ name: 'Child 1', parentId: root1.id })
      createCategory({ name: 'Child 2', parentId: root1.id })
      createCategory({ name: 'Grandchild', parentId: child1.id })

      const tree = getCategoryTree()

      expect(tree.length).toBe(2) // 两个根节点
      
      const root1Node = tree.find(n => n.key === root1.id)
      expect(root1Node?.children?.length).toBe(2) // root1 有两个子节点
      
      const child1Node = root1Node?.children?.find(n => n.key === child1.id)
      expect(child1Node?.children?.length).toBe(1) // child1 有一个子节点
    })
  })
})
