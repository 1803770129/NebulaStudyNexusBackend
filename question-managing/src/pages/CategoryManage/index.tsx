/**
 * 分类管理页面
 */

import { useState } from 'react'
import { Row, Col, Card, Button, Modal, Form, Input, TreeSelect, message, Popconfirm, Space, Tree } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useCategories } from '@/hooks/useCategories'
import type { Category, CategoryTreeNode } from '@/types'
import { MAX_CATEGORY_LEVEL } from '@/constants'
import { ServiceError } from '@/services/questionService'

export function CategoryManagePage() {
  const { categories, treeData, isLoading, create, update, remove, isCreating, isUpdating } = useCategories()
  const [modalVisible, setModalVisible] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [form] = Form.useForm()

  // 打开新建/编辑弹窗
  const openModal = (category?: Category, parentId?: string) => {
    setEditingCategory(category ?? null)
    form.setFieldsValue({
      name: category?.name ?? '',
      parentId: category?.parentId ?? parentId ?? null,
    })
    setModalVisible(true)
  }

  // 关闭弹窗
  const closeModal = () => {
    setModalVisible(false)
    setEditingCategory(null)
    form.resetFields()
  }

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      
      if (editingCategory) {
        await update(editingCategory.id, values)
        message.success('更新成功')
      } else {
        await create(values)
        message.success('创建成功')
      }
      closeModal()
    } catch (error) {
      if (error instanceof ServiceError) {
        message.error(error.message)
      }
    }
  }

  // 删除分类
  const handleDelete = async (id: string) => {
    try {
      await remove(id)
      message.success('删除成功')
      if (selectedKey === id) {
        setSelectedKey(null)
      }
    } catch (error) {
      if (error instanceof ServiceError) {
        message.error(error.message)
      }
    }
  }

  // 获取选中的分类
  const selectedCategory = selectedKey
    ? categories.find(c => c.id === selectedKey)
    : null

  // 转换为 TreeSelect 数据格式
  const treeSelectData = treeData.map(function convertNode(node: CategoryTreeNode): any {
    return {
      value: node.key,
      title: node.title,
      disabled: node.data.level >= MAX_CATEGORY_LEVEL - 1, // 不能选择已经是第二级的分类作为父级
      children: node.children?.map(convertNode),
    }
  })

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>分类管理</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openModal()}
        >
          新建分类
        </Button>
      </div>

      <Row gutter={16}>
        {/* 分类树 */}
        <Col xs={24} md={12}>
          <Card title="分类结构" loading={isLoading}>
            {treeData.length > 0 ? (
              <Tree
                treeData={treeData}
                selectedKeys={selectedKey ? [selectedKey] : []}
                onSelect={(keys) => setSelectedKey(keys[0] as string ?? null)}
                showLine
                defaultExpandAll
              />
            ) : (
              <div style={{ textAlign: 'center', color: '#999', padding: 20 }}>
                暂无分类，点击上方按钮创建
              </div>
            )}
          </Card>
        </Col>

        {/* 分类详情 */}
        <Col xs={24} md={12}>
          <Card title="分类详情">
            {selectedCategory ? (
              <div>
                <p><strong>名称：</strong>{selectedCategory.name}</p>
                <p><strong>层级：</strong>第 {selectedCategory.level} 级</p>
                <p><strong>题目数量：</strong>{selectedCategory.questionCount}</p>
                <p><strong>创建时间：</strong>{new Date(selectedCategory.createdAt).toLocaleString()}</p>
                
                <Space style={{ marginTop: 16 }}>
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => openModal(selectedCategory)}
                  >
                    编辑
                  </Button>
                  {selectedCategory.level < MAX_CATEGORY_LEVEL && (
                    <Button
                      icon={<PlusOutlined />}
                      onClick={() => openModal(undefined, selectedCategory.id)}
                    >
                      添加子分类
                    </Button>
                  )}
                  <Popconfirm
                    title="确定要删除这个分类吗？"
                    onConfirm={() => handleDelete(selectedCategory.id)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button danger icon={<DeleteOutlined />}>
                      删除
                    </Button>
                  </Popconfirm>
                </Space>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#999', padding: 20 }}>
                请在左侧选择一个分类查看详情
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* 新建/编辑弹窗 */}
      <Modal
        title={editingCategory ? '编辑分类' : '新建分类'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={closeModal}
        confirmLoading={isCreating || isUpdating}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="分类名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>
          
          <Form.Item
            name="parentId"
            label="父分类"
          >
            <TreeSelect
              treeData={treeSelectData}
              placeholder="选择父分类（不选则为顶级分类）"
              allowClear
              treeDefaultExpandAll
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default CategoryManagePage
