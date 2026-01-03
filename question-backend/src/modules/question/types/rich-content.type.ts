/**
 * 富文本内容类型定义
 */

/**
 * 富文本内容结构
 * 用于存储原始内容和渲染后内容
 */
export interface RichContent {
  /** 原始内容，包含 LaTeX 标记，用于编辑器加载 */
  raw: string;
  /** 渲染后内容，公式已转为图片，用于展示 */
  rendered: string;
}

/**
 * 创建 RichContent 对象
 * @param raw 原始内容
 * @param rendered 渲染后内容（可选，默认与 raw 相同）
 */
export function createRichContent(raw: string, rendered?: string): RichContent {
  return {
    raw,
    rendered: rendered ?? raw,
  };
}

/**
 * 检查对象是否为有效的 RichContent
 */
export function isRichContent(obj: unknown): obj is RichContent {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'raw' in obj &&
    'rendered' in obj &&
    typeof (obj as RichContent).raw === 'string' &&
    typeof (obj as RichContent).rendered === 'string'
  );
}
