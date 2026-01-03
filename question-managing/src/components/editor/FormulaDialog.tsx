import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Input, Typography, Space, Alert } from 'antd';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const { TextArea } = Input;
const { Text } = Typography;

export interface FormulaDialogProps {
  /** 是否显示 */
  visible: boolean;
  /** 初始 LaTeX 代码 */
  initialLatex?: string;
  /** 确认回调 */
  onConfirm: (latex: string) => void;
  /** 取消回调 */
  onCancel: () => void;
}

interface FormulaPreviewResult {
  html: string;
  error: string | null;
}

/**
 * Parse and render LaTeX formula using KaTeX
 */
export function parseLatexFormula(latex: string): FormulaPreviewResult {
  if (!latex.trim()) {
    return { html: '', error: null };
  }

  try {
    const html = katex.renderToString(latex, {
      throwOnError: true,
      displayMode: false,
      strict: false,
    });
    return { html, error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '公式语法错误';
    return { html: '', error: errorMessage };
  }
}

export const FormulaDialog: React.FC<FormulaDialogProps> = ({
  visible,
  initialLatex = '',
  onConfirm,
  onCancel,
}) => {
  const [latex, setLatex] = useState(initialLatex);

  useEffect(() => {
    if (visible) {
      setLatex(initialLatex);
    }
  }, [visible, initialLatex]);

  const previewResult = useMemo(() => parseLatexFormula(latex), [latex]);

  const handleConfirm = () => {
    if (latex.trim() && !previewResult.error) {
      onConfirm(latex.trim());
    }
  };

  const handleCancel = () => {
    setLatex('');
    onCancel();
  };

  const commonFormulas = [
    { label: '分数', latex: '\\frac{a}{b}' },
    { label: '平方根', latex: '\\sqrt{x}' },
    { label: '上标', latex: 'x^{2}' },
    { label: '下标', latex: 'x_{i}' },
    { label: '求和', latex: '\\sum_{i=1}^{n}' },
    { label: '积分', latex: '\\int_{a}^{b}' },
    { label: '极限', latex: '\\lim_{x \\to \\infty}' },
    { label: '希腊字母', latex: '\\alpha, \\beta, \\gamma' },
  ];

  return (
    <Modal
      title="插入数学公式"
      open={visible}
      onOk={handleConfirm}
      onCancel={handleCancel}
      okText="插入"
      cancelText="取消"
      okButtonProps={{ disabled: !latex.trim() || !!previewResult.error }}
      width={600}
      destroyOnClose
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            输入 LaTeX 公式代码：
          </Text>
          <TextArea
            value={latex}
            onChange={(e) => setLatex(e.target.value)}
            placeholder="例如: E = mc^2 或 \frac{a}{b}"
            autoSize={{ minRows: 3, maxRows: 6 }}
            style={{ marginTop: 8, fontFamily: 'monospace' }}
          />
        </div>

        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            常用公式：
          </Text>
          <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {commonFormulas.map((formula) => (
              <Text
                key={formula.latex}
                code
                style={{ cursor: 'pointer', padding: '2px 8px' }}
                onClick={() => setLatex((prev) => prev + formula.latex)}
              >
                {formula.label}
              </Text>
            ))}
          </div>
        </div>

        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            预览：
          </Text>
          <div className="formula-preview" style={{ marginTop: 8 }}>
            {previewResult.error ? (
              <Alert
                message="公式语法错误"
                description={previewResult.error}
                type="error"
                showIcon
                style={{ width: '100%' }}
              />
            ) : latex.trim() ? (
              <div dangerouslySetInnerHTML={{ __html: previewResult.html }} />
            ) : (
              <Text type="secondary">请输入公式</Text>
            )}
          </div>
        </div>

        <Alert
          message="提示"
          description={
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>行内公式使用 $...$ 包裹</li>
              <li>块级公式使用 $$...$$ 包裹</li>
              <li>支持标准 LaTeX 数学语法</li>
            </ul>
          }
          type="info"
          showIcon
        />
      </Space>
    </Modal>
  );
};

export default FormulaDialog;
