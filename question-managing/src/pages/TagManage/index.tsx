/**
 * 标签管理页面
 */

import { useState } from 'react'
import { Card, Button, Modal, Form, Input, Table, Tag, Space, Popconfirm, message, ColorPicker } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useTags } from '@/hooks/useTags'
import type { Tag as TagType, TagFormValues } from '@/types'
import { TAG_COLORS } from '@/constants'
import { ServiceError } from '@/services/questionService'

export function TagManagePage() {
  const { tags, isLoading, create, update, remove, isCreating, isUpdating, isDeleting } = useTags()
  const [modalVisible, setModalVisible] = useState(false)
  const [editingTag, setEditingTag] = useState<TagType | null>(null)
  const [form] = Form.useForm()

  // 打开新建/编辑弹窗
  const openModal = (tag?: TagType) => {
    setEditingTag(tag ?? null)
    form.setFieldsValue({
      name: tag?.name ?? '',
      color: tag?.color ?? TAG_COLORS[0],
    })
    setModalVisible(true)
  }

  // 关闭弹窗
  const closeModal = () => {
    setModalVisible(false)
    setEditingTag(null)
    form.resetFields()
  }

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      // 处理颜色值
      const color = typeof values.color === 'string' 
        ? values.color 
        : values.color?.toHexString?.() ?? TAG_COLORS[0]
      
      const formData: TagFormValues = {
        name: values.name,
        color,
      }

      if (editingTag) {
        await update(editingTag.id, formData)
        message.success('更新成功')
      } else {
        await create(formData)
        message.success('创建成功')
      }
      closeModal()
    } catch (error) {
      if (error instanceof ServiceError) {
        message.error(error.message)
      }
    }
  }

  // 删除标签
  const handleDelete = async (id: string) => {
    try {
      await remove(id)
      message.success('删除成功')
    } catch (error) {
      if (error instanceof ServiceError) {
        message.error(error.message)
      }
    }
  }

  // 表格列定义
  const columns: ColumnsType<TagType> = [
    {
      title: '标签名称',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Tag color={record.color}>{name}</Tag>
      ),
    },
    {
      title: '颜色',
      dataIndex: 'color',
      key: 'color',
      width: 100,
      render: (color) => (
        <div
          style={{
            width: 24,
            height: 24,
            backgroundColor: color,
            borderRadius: 4,
            border: '1px solid #d9d9d9',
          }}
        />
      ),
    },
    {
      title: '关联题目数',
      dataIndex: 'questionCount',
      key: 'questionCount',
      width: 120,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个标签吗？"
            description="删除后，所有题目中该标签的关联将被移除"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>标签管理</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openModal()}
        >
          新建标签
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={tags}
          rowKey="id"
          loading={isLoading || isDeleting}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 个标签`,
          }}
        />
      </Card>

      {/* 新建/编辑弹窗 */}
      <Modal
        title={editingTag ? '编辑标签' : '新建标签'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={closeModal}
        confirmLoading={isCreating || isUpdating}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="标签名称"
            rules={[{ required: true, message: '请输入标签名称' }]}
          >
            <Input placeholder="请输入标签名称" />
          </Form.Item>
          
          <Form.Item
            name="color"
            label="标签颜色"
          >
            <ColorPicker
              presets={[
                {
                  label: '推荐颜色',
                  colors: TAG_COLORS as unknown as string[],
                },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default TagManagePage
