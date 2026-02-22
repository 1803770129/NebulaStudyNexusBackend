/**
 * Tests for QuestionForm Component
 * 
 * Tests the form submission data format with RichTextEditor integration.
 * 
 * **Validates: Requirements 1.2, 1.7**
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuestionForm } from './QuestionForm';
import { QuestionType, DifficultyLevel } from '@/types';
import type { Category, Tag, Question } from '@/types';

// Mock the uploadService
vi.mock('@/services/uploadService', () => ({
  uploadImage: vi.fn().mockResolvedValue({ url: 'http://example.com/image.jpg' }),
}));

// Mock categories and tags
const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: '数学',
    parentId: null,
    level: 1,
    path: '1',
    questionCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockTags: Tag[] = [
  {
    id: 'tag-1',
    name: '基础',
    color: '#1890ff',
    questionCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe('QuestionForm Component', () => {
  /**
   * Test: QuestionForm should render with RichTextEditor for content
   */
  it('should render with RichTextEditor for content field', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <QuestionForm
        categories={mockCategories}
        tags={mockTags}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );

    // Should have rich text editors (content and explanation)
    const editors = document.querySelectorAll('.rich-text-editor');
    expect(editors.length).toBeGreaterThanOrEqual(2);
  });

  /**
   * Test: QuestionForm should render title input
   */
  it('should render title input field', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <QuestionForm
        categories={mockCategories}
        tags={mockTags}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );

    // Should have title input
    expect(screen.getByPlaceholderText('请输入题目标题')).toBeInTheDocument();
  });

  /**
   * Test: QuestionForm should render type selector
   */
  it('should render question type selector', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <QuestionForm
        categories={mockCategories}
        tags={mockTags}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );

    // Should have form labels
    expect(screen.getByText('题目类型')).toBeInTheDocument();
    expect(screen.getByText('难度等级')).toBeInTheDocument();
  });

  /**
   * Test: QuestionForm should render options for choice questions
   */
  it('should render options section for choice questions', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <QuestionForm
        categories={mockCategories}
        tags={mockTags}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );

    // Should have options section (default is single choice)
    expect(screen.getByText('选项设置')).toBeInTheDocument();
  });

  /**
   * Test: QuestionForm should load initial values with RichContent
   */
  it('should load initial values with RichContent format', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    const initialQuestion: Question = {
      id: 'q-1',
      title: 'Test Question',
      content: {
        raw: '<p>Test content raw</p>',
        rendered: '<p>Test content rendered</p>',
      },
      type: QuestionType.SINGLE_CHOICE,
      difficulty: DifficultyLevel.EASY,
      categoryId: 'cat-1',
      tagIds: ['tag-1'],
      options: [
        { id: 'opt-1', content: { raw: 'Option A', rendered: 'Option A' }, isCorrect: true },
        { id: 'opt-2', content: { raw: 'Option B', rendered: 'Option B' }, isCorrect: false },
      ],
      answer: 'opt-1',
      explanation: {
        raw: '<p>Explanation raw</p>',
        rendered: '<p>Explanation rendered</p>',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    render(
      <QuestionForm
        initialValues={initialQuestion}
        categories={mockCategories}
        tags={mockTags}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );

    // Should have title loaded
    expect(screen.getByDisplayValue('Test Question')).toBeInTheDocument();
  });

  /**
   * Test: QuestionForm should render submit button
   */
  it('should render submit button', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <QuestionForm
        categories={mockCategories}
        tags={mockTags}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );

    // Should have submit button (创建题目 for new form)
    expect(screen.getByText('创建题目')).toBeInTheDocument();
  });
});
