/**
 * 知识点表单组件
 * 
 * 用于创建和编辑知识点
 * 支持富文本内容编辑、分类选择、父知识点选择、标签选择
 */

import { useEffect, useState } from 'react'
import { Modal, Form, Input, Select, TreeSelect, message } from 'antd'
import { RichTextEditor } from '@/components/editor/RichTextEditor'
import { useCategories } from '@/hooks/useCategories'
import { useTags } from '@/hooks/useTags'
import { useKnowledgePointTree, useCreateKnowledgePoint, useUpdateKnowledgePoint } from '@/hooks/useKnowledgePoint'
import type { KnowledgePoint, KnowledgePointTreeNode, CreateKnowledgePointDto } from '@/services/knowledgePointService'
import type { RichContent } from '@/types'

interface KnowledgePointFormProps {
  /** 编辑时传入的知识点数据，null 表示创建新知识点 */
  knowledgePoint: KnowledgePoint | null
  /** 关闭表单回调 */
  onClose: () => void
  /** 成功回调（创建或更新成功后） */
  onSuccess: () => void
}

/**
 * 将知识点树转换为 Ant Design TreeSelect 所需的格式
 */
function convertToTreeSelectData(nodes: KnowledgePointTreeNode[], excludeId?: string): any[] {
  return nodes
    .filter(node => node.id !== excludeId) // 排除当前编辑的知识点（避免选择自己作为父节点）
    .map(node => ({
      value: node.id,
      title: `${node.name} (${node.questionCount} 道题目)`,
      children: node.children?.length > 0 ? convertToTreeSelectData(node.children, excludeId) : undefined,
      disabled: node.level >= 3, // 第3级知识点不能作为父节点（因为最多3级）
    }))
}

/**
 * 知识点表单组件
 * 
 * 使用 Modal + Form 实现知识点的创建和编辑
 * 自动加载分类、标签、知识点树数据
 * 
 * @example
 * ```tsx
 * <KnowledgePointForm
 *   knowledgePoint={editingKp}
 *   onClose={() => setFormVisible(false)}
 *   onSuccess={() => {
 *     setFormVisible(false)
 *     loadTree()
 *   }}
 * />
 * ```
 */
export function KnowledgePointForm({ knowledgePoint, onClose, onSuccess }: KnowledgePointFormProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  // 加载分类列表
  const { categories, isLoading: categoriesLoading } = useCategories()
  
  // 加载标签列表
  const { tags, isLoading: tagsLoading } = useTags()
  
  // 加载知识点树（用于选择父知识点）
  const { data: kpTree, isLoading: treeLoading } = useKnowledgePointTree()

  // 创建和更新 mutations
  const { mutateAsync: createKnowledgePoint } = useCreateKnowledgePoint()
  const { mutateAsync: updateKnowledgePoint } = useUpdateKnowledgePoint()

  // 初始化表单值（编辑模式）
  useEffect(() => {
    if (knowledgePoint) {
      form.setFieldsValue({
        name: knowledgePoint.name,
        categoryId: knowledgePoint.categoryId,
        parentId: knowledgePoint.parentId,
        content: knowledgePoint.content.raw, // 使用 raw 内容用于编辑
        extension: knowledgePoint.extension?.raw || undefined,
        tagIds: knowledgePoint.tags.map(t => t.id),
      })
    } else {
      // 创建模式，重置表单
      form.resetFields()
    }
  }, [knowledgePoint, form])

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      // 构建 RichContent 格式
      const contentData: RichContent = {
        raw: values.content,
        rendered: values.content, // 后端会处理渲染
      }

      const extensionData: RichContent | undefined = values.extension
        ? {
            raw: values.extension,
            rendered: values.extension,
          }
        : undefined

      // 构建提交数据
      const submitData: CreateKnowledgePointDto = {
        name: values.name,
        content: contentData,
        extension: extensionData,
        categoryId: values.categoryId,
        parentId: values.parentId,
        tagIds: values.tagIds,
      }

      if (knowledgePoint) {
        // 更新知识点
        await updateKnowledgePoint({
          id: knowledgePoint.id,
          data: submitData,
        })
        message.success('知识点更新成功')
      } else {
        // 创建知识点
        await createKnowledgePoint(submitData)
        message.success('知识点创建成功')
      }

      onSuccess()
    } catch (error: any) {
      // 处理表单验证错误
      if (error.errorFields) {
        message.error('请检查表单填写是否正确')
        return
      }

      // 处理网络错误
      if (error.message && error.message.includes('Network Error')) {
        message.error('网络连接失败，请检查网络后重试')
        return
      }

      // 处理后端返回的错误信息
      let errorMessage = knowledgePoint ? '更新失败' : '创建失败'
      
      if (error.response?.data?.message) {
        const backendMessage = error.response.data.message
        
        // 如果是字符串，直接显示
        if (typeof backendMessage === 'string') {
          errorMessage = backendMessage
        }
        // 如果是数组，显示第一个错误
        else if (Array.isArray(backendMessage) && backendMessage.length > 0) {
          errorMessage = backendMessage[0]
        }
        // 如果是对象，显示 message 字段
        else if (typeof backendMessage === 'object' && backendMessage.message) {
          errorMessage = backendMessage.message
        }
      } else if (error.message) {
        // 使用 error.message 作为后备
        errorMessage = error.message
      }

      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // 数据加载中
  const dataLoading = categoriesLoading || tagsLoading || treeLoading

  return (
    <Modal
      title={knowledgePoint ? '编辑知识点' : '新建知识点'}
      open
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={loading}
      width={800}
      okText={knowledgePoint ? '保存' : '创建'}
      cancelText="取消"
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        disabled={dataLoading}
      >
        {/* 知识点名称 */}
        <Form.Item
          name="name"
          label="知识点名称"
          rules={[
            { required: true, message: '请输入知识点名称' },
            { max: 100, message: '知识点名称不能超过100个字符' },
            { pattern: /^[a-zA-Z0-9\u4e00-\u9fa5\s]+$/, message: '知识点名称只能包含字母、数字、汉字和空格' },
          ]}
        >
          <Input
            placeholder="如：二叉树遍历"
            maxLength={100}
            showCount
          />
        </Form.Item>

        {/* 所属分类 */}
        <Form.Item
          name="categoryId"
          label="所属分类"
        >
          <Select
            placeholder="选择分类（可选）"
            allowClear
            loading={categoriesLoading}
            options={categories.map(cat => ({
              value: cat.id,
              label: cat.name,
            }))}
          />
        </Form.Item>

        {/* 父知识点 */}
        <Form.Item
          name="parentId"
          label="父知识点"
          tooltip="选择父知识点可以构建知识点层级结构，最多支持3级"
        >
          <TreeSelect
            placeholder="选择父知识点（可选）"
            allowClear
            loading={treeLoading}
            treeData={convertToTreeSelectData(kpTree || [], knowledgePoint?.id)}
            showSearch
            treeNodeFilterProp="title"
          />
        </Form.Item>

        {/* 知识点内容 */}
        <Form.Item
          name="content"
          label="知识点内容"
          rules={[{ required: true, message: '请输入知识点内容' }]}
        >
          <RichTextEditor
            placeholder="输入知识点的详细说明..."
            height={300}
          />
        </Form.Item>

        {/* 拓展内容 */}
        <Form.Item
          name="extension"
          label="拓展内容"
          tooltip="可以添加额外的学习资料、参考链接等"
        >
          <RichTextEditor
            placeholder="输入拓展学习资料（可选）..."
            height={200}
          />
        </Form.Item>

        {/* 标签 */}
        <Form.Item
          name="tagIds"
          label="标签"
        >
          <Select
            mode="multiple"
            placeholder="选择标签（可选）"
            loading={tagsLoading}
            options={tags.map(tag => ({
              value: tag.id,
              label: tag.name,
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default KnowledgePointForm
