/**
 * 知识点管理页面
 * 
 * 功能：
 * - 左侧：知识点树形列表（支持搜索、分类筛选）
 * - 右侧：知识点详情展示
 * - 支持创建、编辑、删除知识点
 */

import { useState, useEffect, useMemo } from 'react'
import { Layout, Tree, Button, Input, Select, Space, message, Empty, Tag, Spin } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import type { DataNode } from 'antd/es/tree'
import { useKnowledgePointTree, useDeleteKnowledgePoint } from '@/hooks/useKnowledgePoint'
import { useCategories } from '@/hooks/useCategories'
import { KnowledgePointDetail, KnowledgePointForm } from '@/components/knowledge-point'
import type { KnowledgePointTreeNode, KnowledgePoint } from '@/services/knowledgePointService'

const { Sider, Content } = Layout

/**
 * 将知识点树节点转换为 Ant Design Tree 组件所需的格式
 * @param nodes 知识点树节点数组
 * @param searchText 搜索文本，用于高亮匹配的节点名称
 */
function convertToAntdTree(nodes: KnowledgePointTreeNode[], searchText?: string): DataNode[] {
  return nodes.map(node => {
    // 高亮匹配的节点名称
    let titleContent: React.ReactNode = node.name
    if (searchText && searchText.trim()) {
      const lowerSearch = searchText.toLowerCase()
      const lowerName = node.name.toLowerCase()
      const index = lowerName.indexOf(lowerSearch)
      
      if (index !== -1) {
        const beforeStr = node.name.substring(0, index)
        const matchStr = node.name.substring(index, index + searchText.length)
        const afterStr = node.name.substring(index + searchText.length)
        
        titleContent = (
          <span>
            {beforeStr}
            <span style={{ color: '#1890ff', fontWeight: 'bold', backgroundColor: '#e6f7ff' }}>
              {matchStr}
            </span>
            {afterStr}
          </span>
        )
      }
    }

    return {
      key: node.id,
      title: (
        <Space size="small">
          {titleContent}
          {node.questionCount > 0 && (
            <Tag color="blue" style={{ fontSize: '12px' }}>
              {node.questionCount} 题
            </Tag>
          )}
        </Space>
      ),
      children: node.children && node.children.length > 0 
        ? convertToAntdTree(node.children, searchText) 
        : undefined,
    }
  })
}

/**
 * 过滤树节点（根据搜索文本）
 */
function filterTreeNodes(
  nodes: KnowledgePointTreeNode[],
  searchText: string
): KnowledgePointTreeNode[] {
  if (!searchText) return nodes

  const lowerSearch = searchText.toLowerCase()
  
  return nodes.reduce<KnowledgePointTreeNode[]>((acc, node) => {
    const matchesSearch = node.name.toLowerCase().includes(lowerSearch)
    const filteredChildren = node.children 
      ? filterTreeNodes(node.children, searchText) 
      : []
    
    if (matchesSearch || filteredChildren.length > 0) {
      acc.push({
        ...node,
        children: filteredChildren,
      })
    }
    
    return acc
  }, [])
}

export function KnowledgePointManagePage() {
  // 状态管理
  const [selectedKpId, setSelectedKpId] = useState<string | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined)
  const [searchText, setSearchText] = useState('')
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [editingKp, setEditingKp] = useState<KnowledgePoint | null>(null)

  // 数据加载
  const { data: rawTreeData, isLoading: isLoadingTree, refetch: refetchTree } = useKnowledgePointTree(selectedCategoryId)
  const { categories, isLoading: isLoadingCategories } = useCategories()
  const { mutateAsync: deleteKnowledgePoint } = useDeleteKnowledgePoint()

  // 过滤后的树数据
  const filteredTreeData = useMemo(() => {
    if (!rawTreeData) return []
    return filterTreeNodes(rawTreeData, searchText)
  }, [rawTreeData, searchText])

  // 转换为 Ant Design Tree 格式（带搜索高亮）
  const treeData = useMemo(() => {
    return convertToAntdTree(filteredTreeData, searchText)
  }, [filteredTreeData, searchText])

  // 当分类变化时，清空选中的知识点
  useEffect(() => {
    setSelectedKpId(null)
  }, [selectedCategoryId])

  // 事件处理函数
  const handleTreeSelect = (selectedKeys: React.Key[]) => {
    setSelectedKpId(selectedKeys[0] as string ?? null)
  }

  const handleCreate = () => {
    setEditingKp(null)
    setIsFormVisible(true)
  }

  const handleEdit = (kp: KnowledgePoint) => {
    setEditingKp(kp)
    setIsFormVisible(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteKnowledgePoint(id)
      message.success('删除成功')
      setSelectedKpId(null)
      refetchTree()
    } catch (error: any) {
      message.error(error.message || '删除失败')
    }
  }

  const handleFormSuccess = () => {
    setIsFormVisible(false)
    setEditingKp(null)
    refetchTree()
  }

  const handleFormClose = () => {
    setIsFormVisible(false)
    setEditingKp(null)
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>知识点管理</h2>
      </div>

      <Layout style={{ background: '#fff', minHeight: 'calc(100vh - 120px)' }}>
        {/* 左侧：知识点树 */}
        <Sider width={300} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
          <div style={{ padding: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {/* 新建按钮 */}
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
                block
              >
                新建知识点
              </Button>

              {/* 搜索框 */}
              <Input
                placeholder="搜索知识点"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                allowClear
              />

              {/* 分类筛选器 */}
              <Select
                placeholder="选择分类"
                allowClear
                value={selectedCategoryId}
                onChange={setSelectedCategoryId}
                style={{ width: '100%' }}
                loading={isLoadingCategories}
              >
                {categories.map(cat => (
                  <Select.Option key={cat.id} value={cat.id}>
                    {cat.name}
                  </Select.Option>
                ))}
              </Select>
            </Space>
          </div>

          {/* 知识点树 */}
          <div style={{ padding: '0 16px 16px' }}>
            {isLoadingTree ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <Spin tip="加载中..." />
              </div>
            ) : treeData.length > 0 ? (
              <Tree
                treeData={treeData}
                onSelect={handleTreeSelect}
                selectedKeys={selectedKpId ? [selectedKpId] : []}
                showLine={true}
                defaultExpandAll={false}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={searchText ? '未找到匹配的知识点' : '暂无知识点'}
                style={{ marginTop: 20 }}
              />
            )}
          </div>
        </Sider>

        {/* 右侧：知识点详情 */}
        <Content style={{ padding: 24 }}>
          {selectedKpId ? (
            <KnowledgePointDetail
              id={selectedKpId}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="请在左侧选择一个知识点查看详情"
              style={{ marginTop: 100 }}
            />
          )}
        </Content>
      </Layout>

      {/* 知识点表单弹窗 */}
      {isFormVisible && (
        <KnowledgePointForm
          knowledgePoint={editingKp}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}

export default KnowledgePointManagePage
