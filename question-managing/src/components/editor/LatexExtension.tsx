/**
 * TipTap LaTeX 公式扩展
 * 支持在编辑器中渲染 LaTeX 公式
 */
import { Node, mergeAttributes } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from '@tiptap/react';
import katex from 'katex';

// LaTeX 节点视图组件
function LatexNodeView({ node }: NodeViewProps) {
  const latex = decodeURIComponent(node.attrs.latex || '');
  
  let html = '';
  try {
    html = katex.renderToString(latex, {
      throwOnError: false,
      displayMode: false,
    });
  } catch {
    html = `<span style="color: red;">[公式错误: ${latex}]</span>`;
  }

  return (
    <NodeViewWrapper as="span" className="latex-formula-rendered">
      <span dangerouslySetInnerHTML={{ __html: html }} />
    </NodeViewWrapper>
  );
}

// LaTeX 扩展定义
export const LatexExtension = Node.create({
  name: 'latexFormula',
  group: 'inline',
  inline: true,
  atom: true,  // 原子节点，不可编辑内部内容

  addAttributes() {
    return {
      latex: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-latex') || '',
        renderHTML: (attributes) => ({
          'data-latex': attributes.latex,
          'class': 'latex-formula',
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span.latex-formula',
        getAttrs: (element) => {
          if (typeof element === 'string') return false;
          return {
            latex: element.getAttribute('data-latex') || '',
          };
        },
      },
    ];
  },

  // atom 节点不能有内容，所以不使用 0
  renderHTML({ HTMLAttributes }) {
    const latex = decodeURIComponent(HTMLAttributes['data-latex'] || '');
    return ['span', mergeAttributes(HTMLAttributes, { class: 'latex-formula' }), latex];
  },

  addNodeView() {
    return ReactNodeViewRenderer(LatexNodeView);
  },
});

export default LatexExtension;
