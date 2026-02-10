/**
 * 题目筛选组件
 */

import { useState, useEffect } from 'react'
import { Form, Input, Select, Button, Space, Card, Tag } from 'antd'
import { SearchOutlined, ReloadOutlined, CloseOutlined } from '@ant-design/icons'
import type { QuestionFilters, Category } from '@/types'
import { QUESTION_TYPE_OPTIONS, DIFFICULTY_OPTIONS } from '@/constants'
import { KnowledgePointSelector } from '@/components/knowledge-point/KnowledgePointSelector'
import { knowledgePointService, type KnowledgePoint } from '@/services/knowledgePointService'

interface QuestionFilterProps {
  filters: QuestionFilters
  categories: Category[]
  onFilterChange: (filters: Partial<QuestionFilters>) => void
  onSearch: (keyword: string) => void
  onReset: () => void
}

export function QuestionFilter({
  filters,
  categories,
  onFilterChange,
  onSearch,
  onReset,
}: QuestionFilterProps) {
  const [form] = Form.useForm()
  const [selectedKnowledgePoints, setSelectedKnowledgePoints] = useState<KnowledgePoint[]>([])

  // 加载已选知识点的详细信息（用于显示标签）
  useEffect(() => {
    const loadSelectedKnowledgePoints = async () => {
      if (filters.knowledgePointIds && filters.knowledgePointIds.length > 0) {
        try {
          const kps = await knowledgePointService.findByIds(filters.knowledgePointIds)
          setSelectedKnowledgePoints(kps)
        } catch (error) {
          console.error('加载知识点详情失败', error)
        }
      } else {
        setSelectedKnowledgePoints([])
      }
    }
    loadSelectedKnowledgePoints()
  }, [filters.knowledgePointIds])

  // 处理搜索
  const handleSearch = () => {
    const values = form.getFieldsValue()
    onSearch(values.keyword || '')
  }

  // 处理筛选变化
  const handleFilterChange = (changedValues: any) => {
    onFilterChange(changedValues)
  }

  // 处理重置
  const handleReset = () => {
    form.resetFields()
    onReset()
  }

  // 处理移除知识点标签
  const handleRemoveKnowledgePoint = (kpId: string) => {
    const newKpIds = (filters.knowledgePointIds || []).filter(id => id !== kpId)
    onFilterChange({ knowledgePointIds: newKpIds })
  }

  // 处理清除所有筛选
  const handleClearFilters = () => {
    onFilterChange({
      knowledgePointIds: undefined,
      categoryId: undefined,
      type: undefined,
      difficulty: undefined,
    })
  }

  // 检查是否有活动的筛选条件
  const hasActiveFilters = 
    (filters.knowledgePointIds && filters.knowledgePointIds.length > 0) ||
    filters.categoryId ||
    filters.type ||
    filters.difficulty

  return (
    <Card style={{ marginBottom: 16 }}>
      <Form
        form={form}
        layout="inline"
        initialValues={filters}
        onValuesChange={handleFilterChange}
        style={{ flexWrap: 'wrap', gap: 8 }}
      >
        <Form.Item name="keyword" style={{ marginBottom: 8 }}>
          <Input
            placeholder="搜索题目标题或内容"
            prefix={<SearchOutlined />}
            allowClear
            style={{ width: 200 }}
            onPressEnter={handleSearch}
          />
        </Form.Item>

        <Form.Item name="categoryId" style={{ marginBottom: 8 }}>
          <Select
            placeholder="选择分类"
            allowClear
            style={{ width: 150 }}
            options={categories.map(c => ({
              value: c.id,
              label: c.name,
            }))}
          />
        </Form.Item>

        <Form.Item name="type" style={{ marginBottom: 8 }}>
          <Select
            placeholder="题目类型"
            allowClear
            style={{ width: 120 }}
            options={QUESTION_TYPE_OPTIONS.map(opt => ({
              value: opt.value,
              label: opt.label,
            }))}
          />
        </Form.Item>

        <Form.Item name="difficulty" style={{ marginBottom: 8 }}>
          <Select
            placeholder="难度"
            allowClear
            style={{ width: 100 }}
            options={DIFFICULTY_OPTIONS.map(opt => ({
              value: opt.value,
              label: opt.label,
            }))}
          />
        </Form.Item>

        <Form.Item name="knowledgePointIds" style={{ marginBottom: 8, minWidth: 250 }}>
          <KnowledgePointSelector
            value={filters.knowledgePointIds}
            onChange={(value) => onFilterChange({ knowledgePointIds: value })}
            categoryId={filters.categoryId}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 8 }}>
          <Space>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              搜索
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
            {hasActiveFilters && (
              <Button icon={<CloseOutlined />} onClick={handleClearFilters}>
                清除筛选
              </Button>
            )}
          </Space>
        </Form.Item>
      </Form>

      {/* 显示已选知识点标签 */}
      {selectedKnowledgePoints.length > 0 && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
          <Space wrap>
            <span style={{ color: '#666' }}>已选知识点：</span>
            {selectedKnowledgePoints.map(kp => (
              <Tag
                key={kp.id}
                closable
                onClose={() => handleRemoveKnowledgePoint(kp.id)}
                color="blue"
              >
                {kp.name} ({kp.questionCount} 题)
              </Tag>
            ))}
          </Space>
        </div>
      )}
    </Card>
  )
}
