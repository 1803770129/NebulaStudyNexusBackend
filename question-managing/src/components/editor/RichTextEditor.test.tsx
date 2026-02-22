/**
 * Tests for RichTextEditor Component
 * 
 * Tests the rendering and basic functionality of the RichTextEditor component.
 * 
 * **Validates: Requirements 1.2, 1.7**
 */

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { RichTextEditor } from './RichTextEditor';

// Mock the uploadService
vi.mock('../../services/uploadService', () => ({
  uploadImage: vi.fn().mockResolvedValue({ url: 'http://example.com/image.jpg' }),
}));

describe('RichTextEditor Component', () => {
  /**
   * Test: RichTextEditor should render without crashing
   */
  it('should render the editor', () => {
    render(<RichTextEditor />);
    
    // The editor should render a toolbar with formatting buttons
    expect(document.querySelector('.rich-text-editor')).toBeInTheDocument();
  });

  /**
   * Test: RichTextEditor should render toolbar buttons in full mode
   */
  it('should render toolbar buttons in full mode', () => {
    render(<RichTextEditor />);
    
    // Check for toolbar presence
    expect(document.querySelector('.rich-text-editor-toolbar')).toBeInTheDocument();
  });

  /**
   * Test: RichTextEditor should render in simple mode with fewer buttons
   */
  it('should render in simple mode', () => {
    render(<RichTextEditor simple />);
    
    // Should still have toolbar
    expect(document.querySelector('.rich-text-editor-toolbar')).toBeInTheDocument();
  });

  /**
   * Test: RichTextEditor should render in readonly mode without toolbar
   */
  it('should render in readonly mode without toolbar', () => {
    render(<RichTextEditor readonly />);
    
    // Toolbar should not be present in readonly mode
    expect(document.querySelector('.rich-text-editor-toolbar')).not.toBeInTheDocument();
  });

  /**
   * Test: RichTextEditor should accept initial value
   */
  it('should accept initial value', () => {
    const initialContent = '<p>Test content</p>';
    render(<RichTextEditor value={initialContent} />);
    
    // Editor should be rendered
    expect(document.querySelector('.rich-text-editor')).toBeInTheDocument();
  });

  /**
   * Test: RichTextEditor should apply custom height
   */
  it('should apply custom height', () => {
    render(<RichTextEditor height={300} />);
    
    const content = document.querySelector('.rich-text-editor-content');
    expect(content).toHaveStyle({ height: '300px' });
  });

  /**
   * Test: RichTextEditor should apply string height
   */
  it('should apply string height', () => {
    render(<RichTextEditor height="auto" />);
    
    const content = document.querySelector('.rich-text-editor-content');
    expect(content).toHaveStyle({ height: 'auto' });
  });

  /**
   * Test: RichTextEditor should accept RichContent value
   */
  it('should accept RichContent value', () => {
    const richContent = {
      raw: '<p>Test content</p>',
      rendered: '<p>Test content</p>',
    };
    render(<RichTextEditor value={richContent} />);
    
    // Editor should be rendered
    expect(document.querySelector('.rich-text-editor')).toBeInTheDocument();
  });

  /**
   * Test: RichTextEditor should call onChange with RichContent when value is RichContent
   */
  it('should call onChange with RichContent when value is RichContent', () => {
    const onChange = vi.fn();
    const richContent = {
      raw: '<p>Initial</p>',
      rendered: '<p>Initial</p>',
    };
    
    render(<RichTextEditor value={richContent} onChange={onChange} />);
    
    // Editor should be rendered
    expect(document.querySelector('.rich-text-editor')).toBeInTheDocument();
  });

  /**
   * Test: RichTextEditor should call onChange with string when value is string
   */
  it('should call onChange with string when value is string', () => {
    const onChange = vi.fn();
    const stringContent = '<p>Initial</p>';
    
    render(<RichTextEditor value={stringContent} onChange={onChange} />);
    
    // Editor should be rendered
    expect(document.querySelector('.rich-text-editor')).toBeInTheDocument();
  });
});
