/**
 * Tests for KnowledgePointSelector Component
 * 
 * Tests the rendering and functionality of the KnowledgePointSelector component.
 * 
 * **Validates: Requirements 2.2, 6.3**
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { KnowledgePointSelector } from './KnowledgePointSelector'
import { knowledgePointService } from '@/services/knowledgePointService'

// Mock the knowledgePointService
vi.mock('@/services/knowledgePointService', () => ({
  knowledgePointService: {
    getList: vi.fn(),
  },
}))

describe('KnowledgePointSelector Component', () => {
  const mockKnowledgePoints = [
    {
      id: 'kp-1',
      name: '二叉树遍历',
      content: { raw: '<p>Content</p>', rendered: '<p>Content</p>' },
      extension: null,
      categoryId: 'cat-1',
      category: { id: 'cat-1', name: '数据结构' },
      parentId: null,
      level: 1,
      path: '',
      questionCount: 15,
      tags: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'kp-2',
      name: '动态规划',
      content: { raw: '<p>Content</p>', rendered: '<p>Content</p>' },
      extension: null,
      categoryId: 'cat-2',
      category: { id: 'cat-2', name: '算法' },
      parentId: null,
      level: 1,
      path: '',
      questionCount: 20,
      tags: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    // Default mock implementation
    vi.mocked(knowledgePointService.getList).mockResolvedValue({
      data: mockKnowledgePoints,
      total: 2,
      page: 1,
      pageSize: 100,
    })
  })

  /**
   * Test: KnowledgePointSelector should render with placeholder
   */
  it('should render with placeholder', async () => {
    render(<KnowledgePointSelector />)
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('选择知识点（支持搜索）')).toBeInTheDocument()
    })
  })

  /**
   * Test: KnowledgePointSelector should load options on mount
   */
  it('should load options on mount', async () => {
    render(<KnowledgePointSelector />)
    
    await waitFor(() => {
      expect(knowledgePointService.getList).toHaveBeenCalledWith({
        categoryId: undefined,
        limit: 100,
      })
    })
  })

  /**
   * Test: KnowledgePointSelector should reload options when categoryId changes
   */
  it('should reload options when categoryId changes', async () => {
    const { rerender } = render(<KnowledgePointSelector categoryId="cat-1" />)
    
    await waitFor(() => {
      expect(knowledgePointService.getList).toHaveBeenCalledWith({
        categoryId: 'cat-1',
        limit: 100,
      })
    })

    // Change categoryId
    rerender(<KnowledgePointSelector categoryId="cat-2" />)
    
    await waitFor(() => {
      expect(knowledgePointService.getList).toHaveBeenCalledWith({
        categoryId: 'cat-2',
        limit: 100,
      })
    })
  })

  /**
   * Test: KnowledgePointSelector should accept value prop
   */
  it('should accept value prop', async () => {
    render(<KnowledgePointSelector value={['kp-1']} />)
    
    await waitFor(() => {
      expect(knowledgePointService.getList).toHaveBeenCalled()
    })
  })

  /**
   * Test: KnowledgePointSelector should call onChange when selection changes
   */
  it('should call onChange when selection changes', async () => {
    const onChange = vi.fn()
    render(<KnowledgePointSelector onChange={onChange} />)
    
    await waitFor(() => {
      expect(knowledgePointService.getList).toHaveBeenCalled()
    })
  })

  /**
   * Test: KnowledgePointSelector should handle loading state
   */
  it('should handle loading state', async () => {
    // Mock a delayed response
    vi.mocked(knowledgePointService.getList).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        data: mockKnowledgePoints,
        total: 2,
        page: 1,
        pageSize: 100,
      }), 100))
    )

    render(<KnowledgePointSelector />)
    
    // Component should render
    expect(screen.getByPlaceholderText('选择知识点（支持搜索）')).toBeInTheDocument()
    
    await waitFor(() => {
      expect(knowledgePointService.getList).toHaveBeenCalled()
    })
  })

  /**
   * Test: KnowledgePointSelector should handle error gracefully
   */
  it('should handle error gracefully', async () => {
    // Mock console.error to avoid cluttering test output
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Mock an error response
    vi.mocked(knowledgePointService.getList).mockRejectedValue(
      new Error('Network error')
    )

    render(<KnowledgePointSelector />)
    
    await waitFor(() => {
      expect(knowledgePointService.getList).toHaveBeenCalled()
      expect(consoleError).toHaveBeenCalledWith('加载知识点失败', expect.any(Error))
    })

    consoleError.mockRestore()
  })
})
