/**
 * 知识点选择器组件
 * 
 * 用于在题目表单中选择知识点
 * 支持多选、搜索、按分类筛选
 */

import { useState, useEffect } from 'react'
import { Select, Tag, Space } from 'antd'
import type { SelectProps } from 'antd'
import { knowledgePointService, type KnowledgePoint } from '@/services/knowledgePointService'

interface KnowledgePointSelectorProps {
  /** 当前选中的知识点 ID 数组 */
  value?: string[]
  /** 选择变化回调 */
  onChange?: (value: string[]) => void
  /** 按分类筛选 */
  categoryId?: string
}

/**
 * 知识点选择器组件
 * 
 * 使用 Ant Design Select 组件实现多选知识点功能
 * 支持搜索、按分类筛选、显示知识点详细信息
 * 
 * @example
 * ```tsx
 * <KnowledgePointSelector
 *   value={selectedKpIds}
 *   onChange={setSelectedKpIds}
 *   categoryId={categoryId}
 * />
 * ```
 */
export function KnowledgePointSelector({
  value = [],
  onChange,
  categoryId,
}: KnowledgePointSelectorProps) {
  const [options, setOptions] = useState<KnowledgePoint[]>([])
  const [loading, setLoading] = useState(false)

  // 加载知识点选项
  const loadOptions = async () => {
    try {
      setLoading(true)
      const response = await knowledgePointService.getList({
        categoryId,
        limit: 100,
      })
      setOptions(response.data)
    } catch (error) {
      console.error('加载知识点失败', error)
    } finally {
      setLoading(false)
    }
  }

  // 监听 categoryId 变化，重新加载选项
  useEffect(() => {
    loadOptions()
  }, [categoryId])

  // 处理搜索
  const handleSearch = async (searchText: string) => {
    if (!searchText) {
      loadOptions()
      return
    }

    try {
      setLoading(true)
      const response = await knowledgePointService.getList({
        search: searchText,
        categoryId,
        limit: 50,
      })
      setOptions(response.data)
    } catch (error) {
      console.error('搜索知识点失败', error)
    } finally {
      setLoading(false)
    }
  }

  // 构建 Select 选项
  const selectOptions: SelectProps['options'] = options.map(kp => ({
    value: kp.id,
    label: (
      <Space>
        <span>{kp.name}</span>
        {kp.category && (
          <Tag color="blue" style={{ margin: 0 }}>
            {kp.category.name}
          </Tag>
        )}
        <Tag style={{ margin: 0 }}>
          {kp.questionCount} 题
        </Tag>
      </Space>
    ),
  }))

  return (
    <Select
      mode="multiple"
      placeholder="选择知识点（支持搜索）"
      value={value}
      onChange={onChange}
      loading={loading}
      showSearch
      filterOption={false}
      onSearch={handleSearch}
      style={{ width: '100%' }}
      maxTagCount="responsive"
      options={selectOptions}
    />
  )
}

export default KnowledgePointSelector
