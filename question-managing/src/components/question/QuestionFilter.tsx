/**
 * 题目筛选组件
 */

import { Form, Input, Select, Button, Space, Card } from 'antd'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import type { QuestionFilters, Category } from '@/types'
import { QUESTION_TYPE_OPTIONS, DIFFICULTY_OPTIONS } from '@/constants'

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

        <Form.Item style={{ marginBottom: 8 }}>
          <Space>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              搜索
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  )
}
