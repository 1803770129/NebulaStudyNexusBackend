# 富文本编辑器教程

## 概述

富文本编辑器基于 TipTap 构建，支持：
- 基础格式（加粗、斜体、列表等）
- 图片上传（支持裁切和调整大小）
- LaTeX 数学公式
- 撤销/重做

## 文件结构

```
src/components/editor/
├── RichTextEditor.tsx      # 主编辑器组件
├── RichTextEditor.css      # 样式
├── FormulaDialog.tsx       # 公式输入对话框
├── ImageEditDialog.tsx     # 图片编辑对话框
└── LatexExtension.tsx      # LaTeX 公式扩展
```

## 依赖安装

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image
npm install katex react-image-crop
```

## 主编辑器组件

```typescript
// RichTextEditor.tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { LatexExtension } from './LatexExtension';

export interface RichTextEditorProps {
  value?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  readonly?: boolean;
  height?: number | string;
  simple?: boolean;  // 简化模式（用于选项编辑）
}

export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  ({ value, onChange, placeholder, readonly, height, simple }, ref) => {
    const [formulaDialogVisible, setFormulaDialogVisible] = useState(false);
    const [imageEditVisible, setImageEditVisible] = useState(false);
    const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);

    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: simple ? false : undefined,
          blockquote: simple ? false : undefined,
        }),
        Image.configure({ inline: true, allowBase64: true }),
        LatexExtension,  // 自定义 LaTeX 扩展
      ],
      content: '',
      editable: !readonly,
      onUpdate: ({ editor }) => {
        onChange?.(editor.getHTML());
      },
    });

    // 外部 value 变化时更新编辑器
    useEffect(() => {
      if (editor && value) {
        const processedValue = convertImageUrls(value);
        if (processedValue !== editor.getHTML()) {
          editor.commands.setContent(processedValue);
        }
      }
    }, [editor, value]);

    // 图片上传处理
    const handleImageUpload = async (file: File) => {
      const result = await uploadImage(file);
      if (editor && result.url) {
        const fullUrl = getBaseUrl() + result.url;
        editor.chain().focus().setImage({ src: fullUrl }).run();
      }
    };

    // 公式插入
    const handleFormulaInsert = (latex: string) => {
      editor?.chain().focus().insertContent({
        type: 'latexFormula',
        attrs: { latex: encodeURIComponent(latex) },
      }).run();
      setFormulaDialogVisible(false);
    };

    return (
      <div className="rich-text-editor">
        <div className="rich-text-editor-toolbar">
          {/* 工具栏按钮 */}
        </div>
        <EditorContent editor={editor} />
        <FormulaDialog
          visible={formulaDialogVisible}
          onConfirm={handleFormulaInsert}
          onCancel={() => setFormulaDialogVisible(false)}
        />
        <ImageEditDialog
          visible={imageEditVisible}
          imageFile={pendingImageFile}
          onConfirm={handleImageEditConfirm}
          onCancel={() => setImageEditVisible(false)}
        />
      </div>
    );
  }
);
```

## LaTeX 公式扩展

```typescript
// LatexExtension.tsx
import { Node, mergeAttributes } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// 公式渲染组件
function LatexNodeView({ node }: NodeViewProps) {
  const latex = decodeURIComponent(node.attrs.latex || '');
  
  let html = '';
  try {
    html = katex.renderToString(latex, {
      throwOnError: false,
      displayMode: false,
    });
  } catch {
    html = `<span style="color: red;">[公式错误]</span>`;
  }

  return (
    <NodeViewWrapper as="span" className="latex-formula-rendered">
      <span dangerouslySetInnerHTML={{ __html: html }} />
    </NodeViewWrapper>
  );
}

// TipTap 扩展定义
export const LatexExtension = Node.create({
  name: 'latexFormula',
  group: 'inline',
  inline: true,
  atom: true,  // 原子节点，不可编辑内部

  addAttributes() {
    return {
      latex: {
        default: '',
        parseHTML: (el) => el.getAttribute('data-latex') || '',
        renderHTML: (attrs) => ({
          'data-latex': attrs.latex,
          'class': 'latex-formula',
        }),
      },
    };
  },

  parseHTML() {
    return [{
      tag: 'span.latex-formula',
      getAttrs: (el) => ({
        latex: (el as HTMLElement).getAttribute('data-latex') || '',
      }),
    }];
  },

  renderHTML({ HTMLAttributes }) {
    const latex = decodeURIComponent(HTMLAttributes['data-latex'] || '');
    return ['span', mergeAttributes(HTMLAttributes), latex];
  },

  addNodeView() {
    return ReactNodeViewRenderer(LatexNodeView);
  },
});
```

## 公式输入对话框

```typescript
// FormulaDialog.tsx
import { Modal, Input, Space } from 'antd';
import katex from 'katex';

interface FormulaDialogProps {
  visible: boolean;
  onConfirm: (latex: string) => void;
  onCancel: () => void;
}

export function FormulaDialog({ visible, onConfirm, onCancel }: FormulaDialogProps) {
  const [latex, setLatex] = useState('');
  const [preview, setPreview] = useState('');

  useEffect(() => {
    try {
      const html = katex.renderToString(latex, { throwOnError: false });
      setPreview(html);
    } catch {
      setPreview('<span style="color: red;">公式错误</span>');
    }
  }, [latex]);

  return (
    <Modal
      title="插入公式"
      open={visible}
      onOk={() => onConfirm(latex)}
      onCancel={onCancel}
      destroyOnHidden
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Input.TextArea
          value={latex}
          onChange={(e) => setLatex(e.target.value)}
          placeholder="输入 LaTeX 公式，如：\frac{a}{b}"
          rows={3}
        />
        <div className="formula-preview">
          <span dangerouslySetInnerHTML={{ __html: preview }} />
        </div>
      </Space>
    </Modal>
  );
}
```

## 图片编辑对话框

```typescript
// ImageEditDialog.tsx
import { Modal, Slider, InputNumber, Row, Col, Button } from 'antd';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageEditDialogProps {
  visible: boolean;
  imageFile: File | null;
  onConfirm: (editedFile: File) => void;
  onCancel: () => void;
}

export function ImageEditDialog({ visible, imageFile, onConfirm, onCancel }: ImageEditDialogProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [outputWidth, setOutputWidth] = useState(0);
  const [outputHeight, setOutputHeight] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  // 生成编辑后的图片
  const generateEditedImage = async (): Promise<File | null> => {
    if (!imgRef.current || !imageFile) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const image = imgRef.current;

    // 计算裁切区域
    let sourceX = 0, sourceY = 0;
    let sourceWidth = image.naturalWidth;
    let sourceHeight = image.naturalHeight;

    if (completedCrop?.width > 0) {
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      sourceX = completedCrop.x * scaleX;
      sourceY = completedCrop.y * scaleY;
      sourceWidth = completedCrop.width * scaleX;
      sourceHeight = completedCrop.height * scaleY;
    }

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    ctx?.drawImage(
      image,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, outputWidth, outputHeight
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(new File([blob], 'edited.jpg', { type: 'image/jpeg' }));
        } else {
          resolve(null);
        }
      }, 'image/jpeg', 0.9);
    });
  };

  return (
    <Modal
      title="编辑图片"
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={onCancel}>取消</Button>,
        <Button key="confirm" type="primary" onClick={async () => {
          const file = await generateEditedImage();
          if (file) onConfirm(file);
        }}>确认上传</Button>,
      ]}
    >
      <Row gutter={16}>
        <Col span={12}>
          <span>宽度:</span>
          <InputNumber value={outputWidth} onChange={setOutputWidth} />
        </Col>
        <Col span={12}>
          <span>高度:</span>
          <InputNumber value={outputHeight} onChange={setOutputHeight} />
        </Col>
      </Row>
      
      <ReactCrop crop={crop} onChange={setCrop} onComplete={setCompletedCrop}>
        <img ref={imgRef} src={imageSrc} alt="编辑预览" />
      </ReactCrop>
    </Modal>
  );
}
```

## 图片 URL 处理

后端返回的图片 URL 是相对路径，需要转换为完整 URL：

```typescript
const getBaseUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
  return apiUrl.replace(/\/api$/, '');
};

const convertImageUrls = (html: string): string => {
  if (!html) return html;
  const baseUrl = getBaseUrl();
  return html.replace(
    /src=["'](\/(?:api\/)?upload\/images\/[^"']+)["']/g,
    (_, path) => {
      const fullPath = path.startsWith('/api') ? path : `/api${path}`;
      return `src="${baseUrl}${fullPath}"`;
    }
  );
};
```

## 样式

```css
/* RichTextEditor.css */
.rich-text-editor {
  border: 1px solid #d9d9d9;
  border-radius: 6px;
}

.rich-text-editor-toolbar {
  padding: 8px 12px;
  border-bottom: 1px solid #d9d9d9;
  background: #fafafa;
}

.rich-text-editor-content .tiptap {
  padding: 12px;
  min-height: 100%;
  outline: none;
}

.rich-text-editor-content .tiptap img {
  max-width: 100%;
  height: auto;
}

.latex-formula-rendered .katex {
  font-size: 1.1em;
}
```

## 使用示例

```typescript
// 在表单中使用
<Form.Item name="content" label="题目内容">
  <RichTextEditor
    placeholder="请输入题目内容"
    height={200}
  />
</Form.Item>

// 简化模式（用于选项）
<RichTextEditor
  simple
  height={80}
  placeholder="选项内容"
/>
```
