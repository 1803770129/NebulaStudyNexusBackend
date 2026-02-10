import { useCallback, useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Button, Space, Tooltip, Upload, message, Modal, Input } from 'antd';
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  PictureOutlined,
  FunctionOutlined,
  UndoOutlined,
  RedoOutlined,
  LinkOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import 'katex/dist/katex.min.css';
import { FormulaDialog } from './FormulaDialog';
import { ImageEditDialog } from './ImageEditDialog';
import { LatexExtension } from './LatexExtension';
import { uploadImage } from '../../services/uploadService';
import './RichTextEditor.css';

// 获取 API 基础 URL（去掉 /api 后缀）
const getBaseUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
  return apiUrl.replace(/\/api$/, '');
};

/**
 * 将内容中的相对图片路径转换为完整 URL
 */
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

export interface RichContent {
  raw: string;
  rendered: string;
}

export interface RichTextEditorProps {
  value?: string | RichContent;
  onChange?: (content: string | RichContent) => void;
  placeholder?: string;
  readonly?: boolean;
  height?: number | string;
  simple?: boolean;
}

export interface RichTextEditorRef {
  getHTML: () => string;
  setHTML: (html: string) => void;
  clear: () => void;
  focus: () => void;
}

export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  ({ value = '', onChange, placeholder = '请输入内容...', readonly = false, height = 200, simple = false }, ref) => {
    const [formulaDialogVisible, setFormulaDialogVisible] = useState(false);
    const [imageEditVisible, setImageEditVisible] = useState(false);
    const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [linkDialogVisible, setLinkDialogVisible] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [linkText, setLinkText] = useState('');

    // Helper function to extract raw content from value
    const getRawContent = (val: string | RichContent | undefined): string => {
      if (!val) return '';
      if (typeof val === 'string') return val;
      return val.raw || '';
    };

    // Helper function to check if value is RichContent
    const isRichContent = (val: unknown): val is RichContent => {
      return typeof val === 'object' && val !== null && 'raw' in val && 'rendered' in val;
    };

    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: simple ? false : undefined,
          blockquote: simple ? false : undefined,
          codeBlock: simple ? false : undefined,
          horizontalRule: simple ? false : undefined,
        }),
        Image.configure({ inline: true, allowBase64: true }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            target: '_blank',
            rel: 'noopener noreferrer',
          },
        }),
        LatexExtension,
      ],
      content: '',
      editable: !readonly,
      immediatelyRender: false,
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        // If the original value was RichContent, return RichContent
        if (isRichContent(value)) {
          onChange?.({
            raw: html,
            rendered: html, // For now, raw and rendered are the same
          });
        } else {
          // Otherwise, return string for backward compatibility
          onChange?.(html);
        }
      },
    });

    useEffect(() => {
      if (editor && value !== undefined) {
        const rawContent = getRawContent(value);
        if (rawContent !== '') {
          if (!editor.isDestroyed) {
            const processedValue = convertImageUrls(rawContent);
            const currentContent = editor.getHTML();
            const normalizedCurrent = currentContent === '<p></p>' ? '' : currentContent;
            const normalizedValue = processedValue === '<p></p>' ? '' : processedValue;
            if (normalizedValue && normalizedValue !== normalizedCurrent) {
              editor.commands.setContent(processedValue);
            }
          }
        }
      }
    }, [editor, value]);

    useImperativeHandle(ref, () => ({
      getHTML: () => editor?.getHTML() || '',
      setHTML: (html: string) => editor?.commands.setContent(html),
      clear: () => editor?.commands.clearContent(),
      focus: () => editor?.commands.focus(),
    }));

    const handleImageUpload = useCallback(async (file: File) => {
      setUploading(true);
      try {
        const result = await uploadImage(file);
        if (editor && result.url) {
          const baseUrl = getBaseUrl();
          const fullUrl = result.url.startsWith('http') ? result.url : `${baseUrl}${result.url}`;
          editor.chain().focus().setImage({ src: fullUrl }).run();
          message.success('图片上传成功');
        }
      } catch (error) {
        message.error(error instanceof Error ? error.message : '图片上传失败');
      } finally {
        setUploading(false);
      }
    }, [editor]);

    const handleImageSelect = useCallback((file: File) => {
      setPendingImageFile(file);
      setImageEditVisible(true);
    }, []);

    const handleImageEditConfirm = useCallback(async (editedFile: File) => {
      setImageEditVisible(false);
      setPendingImageFile(null);
      await handleImageUpload(editedFile);
    }, [handleImageUpload]);

    const handleImageEditCancel = useCallback(() => {
      setImageEditVisible(false);
      setPendingImageFile(null);
    }, []);

    const uploadProps: UploadProps = {
      accept: 'image/jpeg,image/png,image/gif,image/webp',
      showUploadList: false,
      beforeUpload: (file) => {
        const isValidType = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type);
        if (!isValidType) {
          message.error('只支持 JPG、PNG、GIF、WEBP 格式的图片');
          return false;
        }
        if (file.size / 1024 / 1024 > 10) {
          message.error('图片大小不能超过 10MB');
          return false;
        }
        handleImageSelect(file);
        return false;
      },
    };

    const handleFormulaInsert = useCallback((latex: string) => {
      if (editor) {
        editor.chain().focus().insertContent({
          type: 'latexFormula',
          attrs: { latex: encodeURIComponent(latex) },
        }).run();
      }
      setFormulaDialogVisible(false);
    }, [editor]);

    const handleLinkInsert = useCallback(() => {
      if (editor) {
        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(from, to, '');
        setLinkText(selectedText);
        setLinkUrl('');
        setLinkDialogVisible(true);
      }
    }, [editor]);

    const handleLinkConfirm = useCallback(() => {
      if (editor && linkUrl) {
        if (linkText) {
          // Insert new link with text
          editor.chain().focus().insertContent({
            type: 'text',
            text: linkText,
            marks: [{ type: 'link', attrs: { href: linkUrl } }],
          }).run();
        } else {
          // Set link on selected text
          editor.chain().focus().setLink({ href: linkUrl }).run();
        }
      }
      setLinkDialogVisible(false);
      setLinkUrl('');
      setLinkText('');
    }, [editor, linkUrl, linkText]);

    const handleClearFormat = useCallback(() => {
      if (editor) {
        editor.chain().focus().clearNodes().unsetAllMarks().run();
      }
    }, [editor]);

    if (!editor) {
      return null;
    }


    const toolbarButtons = simple ? (
      <Space size="small" wrap>
        <Tooltip title="加粗">
          <Button
            type={editor.isActive('bold') ? 'primary' : 'text'}
            icon={<BoldOutlined />}
            onClick={() => editor.chain().focus().toggleBold().run()}
            size="small"
          />
        </Tooltip>
        <Tooltip title="斜体">
          <Button
            type={editor.isActive('italic') ? 'primary' : 'text'}
            icon={<ItalicOutlined />}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            size="small"
          />
        </Tooltip>
        <Tooltip title="插入链接">
          <Button
            type={editor.isActive('link') ? 'primary' : 'text'}
            icon={<LinkOutlined />}
            onClick={handleLinkInsert}
            size="small"
          />
        </Tooltip>
        <Upload {...uploadProps}>
          <Tooltip title="插入图片">
            <Button type="text" icon={<PictureOutlined />} loading={uploading} size="small" />
          </Tooltip>
        </Upload>
        <Tooltip title="插入公式">
          <Button
            type="text"
            icon={<FunctionOutlined />}
            onClick={() => setFormulaDialogVisible(true)}
            size="small"
          />
        </Tooltip>
        <Tooltip title="清除格式">
          <Button
            type="text"
            icon={<ClearOutlined />}
            onClick={handleClearFormat}
            size="small"
          />
        </Tooltip>
      </Space>
    ) : (
      <Space size="small" wrap>
        <Tooltip title="加粗">
          <Button
            type={editor.isActive('bold') ? 'primary' : 'text'}
            icon={<BoldOutlined />}
            onClick={() => editor.chain().focus().toggleBold().run()}
          />
        </Tooltip>
        <Tooltip title="斜体">
          <Button
            type={editor.isActive('italic') ? 'primary' : 'text'}
            icon={<ItalicOutlined />}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />
        </Tooltip>
        <Tooltip title="删除线">
          <Button
            type={editor.isActive('strike') ? 'primary' : 'text'}
            icon={<UnderlineOutlined />}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          />
        </Tooltip>
        <div style={{ borderLeft: '1px solid #d9d9d9', height: 20, margin: '0 4px' }} />
        <Tooltip title="有序列表">
          <Button
            type={editor.isActive('orderedList') ? 'primary' : 'text'}
            icon={<OrderedListOutlined />}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          />
        </Tooltip>
        <Tooltip title="无序列表">
          <Button
            type={editor.isActive('bulletList') ? 'primary' : 'text'}
            icon={<UnorderedListOutlined />}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          />
        </Tooltip>
        <div style={{ borderLeft: '1px solid #d9d9d9', height: 20, margin: '0 4px' }} />
        <Tooltip title="插入链接">
          <Button
            type={editor.isActive('link') ? 'primary' : 'text'}
            icon={<LinkOutlined />}
            onClick={handleLinkInsert}
          />
        </Tooltip>
        <Upload {...uploadProps}>
          <Tooltip title="插入图片">
            <Button type="text" icon={<PictureOutlined />} loading={uploading} />
          </Tooltip>
        </Upload>
        <Tooltip title="插入公式">
          <Button
            type="text"
            icon={<FunctionOutlined />}
            onClick={() => setFormulaDialogVisible(true)}
          />
        </Tooltip>
        <div style={{ borderLeft: '1px solid #d9d9d9', height: 20, margin: '0 4px' }} />
        <Tooltip title="清除格式">
          <Button
            type="text"
            icon={<ClearOutlined />}
            onClick={handleClearFormat}
          />
        </Tooltip>
        <Tooltip title="撤销">
          <Button
            type="text"
            icon={<UndoOutlined />}
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          />
        </Tooltip>
        <Tooltip title="重做">
          <Button
            type="text"
            icon={<RedoOutlined />}
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          />
        </Tooltip>
      </Space>
    );

    return (
      <div className="rich-text-editor">
        {!readonly && (
          <div className="rich-text-editor-toolbar">
            {toolbarButtons}
          </div>
        )}
        <div 
          className="rich-text-editor-content" 
          style={{ height: typeof height === 'number' ? `${height}px` : height }}
        >
          <EditorContent editor={editor} placeholder={placeholder} />
        </div>
        <FormulaDialog
          visible={formulaDialogVisible}
          onConfirm={handleFormulaInsert}
          onCancel={() => setFormulaDialogVisible(false)}
        />
        <ImageEditDialog
          visible={imageEditVisible}
          imageFile={pendingImageFile}
          onConfirm={handleImageEditConfirm}
          onCancel={handleImageEditCancel}
        />
        <Modal
          title="插入链接"
          open={linkDialogVisible}
          onOk={handleLinkConfirm}
          onCancel={() => {
            setLinkDialogVisible(false);
            setLinkUrl('');
            setLinkText('');
          }}
          okText="确定"
          cancelText="取消"
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <div style={{ marginBottom: 8 }}>链接文本：</div>
              <Input
                placeholder="请输入链接文本（可选）"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
              />
            </div>
            <div>
              <div style={{ marginBottom: 8 }}>链接地址：</div>
              <Input
                placeholder="请输入链接地址，如：https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>
          </Space>
        </Modal>
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;
