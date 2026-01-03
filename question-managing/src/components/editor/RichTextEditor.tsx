import React, { useCallback, useState, forwardRef, useImperativeHandle } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Button, Space, Tooltip, Upload, message } from 'antd';
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
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { FormulaDialog } from './FormulaDialog';
import { uploadImage } from '../../services/uploadService';
import './RichTextEditor.css';

export interface RichTextEditorProps {
  /** 初始内容 (raw HTML) */
  value?: string;
  /** 内容变化回调 */
  onChange?: (content: string) => void;
  /** 占位符文本 */
  placeholder?: string;
  /** 是否只读 */
  readonly?: boolean;
  /** 编辑器高度 */
  height?: number | string;
  /** 是否为简化模式（用于选项编辑） */
  simple?: boolean;
}

export interface RichTextEditorRef {
  /** 获取 HTML 内容 */
  getHTML: () => string;
  /** 设置 HTML 内容 */
  setHTML: (html: string) => void;
  /** 清空内容 */
  clear: () => void;
  /** 聚焦编辑器 */
  focus: () => void;
}


export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  ({ value = '', onChange, placeholder = '请输入内容...', readonly = false, height = 200, simple = false }, ref) => {
    const [formulaDialogVisible, setFormulaDialogVisible] = useState(false);
    const [uploading, setUploading] = useState(false);

    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: simple ? false : undefined,
          blockquote: simple ? false : undefined,
          codeBlock: simple ? false : undefined,
          horizontalRule: simple ? false : undefined,
        }),
        Image.configure({
          inline: true,
          allowBase64: true,
        }),
      ],
      content: value,
      editable: !readonly,
      onUpdate: ({ editor }) => {
        onChange?.(editor.getHTML());
      },
    });

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
          editor.chain().focus().setImage({ src: result.url }).run();
          message.success('图片上传成功');
        }
      } catch (error) {
        message.error(error instanceof Error ? error.message : '图片上传失败');
      } finally {
        setUploading(false);
      }
    }, [editor]);

    const uploadProps: UploadProps = {
      accept: 'image/jpeg,image/png,image/gif,image/webp',
      showUploadList: false,
      beforeUpload: (file) => {
        const isValidType = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type);
        if (!isValidType) {
          message.error('只支持 JPG、PNG、GIF、WEBP 格式的图片');
          return false;
        }
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
          message.error('图片大小不能超过 5MB');
          return false;
        }
        handleImageUpload(file);
        return false;
      },
    };


    const handleFormulaInsert = useCallback((latex: string) => {
      if (editor) {
        // Insert formula as a special span with data attribute for LaTeX
        // Using inline formula format: $...$
        const formulaHtml = `<span class="latex-formula" data-latex="${encodeURIComponent(latex)}">$${latex}$</span>`;
        editor.chain().focus().insertContent(formulaHtml).run();
      }
      setFormulaDialogVisible(false);
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
        <Tooltip title="下划线">
          <Button
            type={editor.isActive('underline') ? 'primary' : 'text'}
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
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;
