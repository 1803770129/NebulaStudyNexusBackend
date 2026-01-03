/**
 * 题目列表表格组件
 */

import { Table, Tag, Space, Button, Tooltip } from 'antd'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Question, PaginationConfig } from '@/types'
import { QUESTION_TYPE_LABELS, DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '@/constants'
import dayjs from 'dayjs'

interface QuestionTableProps {
  questions: Question[]
  loading: boolean
  pagination: PaginationConfig
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onPageChange: (page: number, pageSize: number) => void
}

export function QuestionTable({
  questions,
  loading,
  pagination,
  onEdit,
  onDelete,
  onPageChange,
}: QuestionTableProps) {
  const columns: ColumnsType<Question> = [
    {
      title: '题目标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (title) => (
        <Tooltip title={title}>
          <span>{title}</span>
        </Tooltip>
      ),
    },
    {
      title: '题目类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => (
        <Tag>{QUESTION_TYPE_LABELS[type as keyof typeof QUESTION_TYPE_LABELS]}</Tag>
      ),
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      width: 80,
      render: (difficulty) => (
        <Tag color={DIFFICULTY_COLORS[difficulty as keyof typeof DIFFICULTY_COLORS]}>
          {DIFFICULTY_LABELS[difficulty as keyof typeof DIFFICULTY_LABELS]}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm'),
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
            onClick={() => onEdit(record.id)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      dataSource={questions}
      rowKey="id"
      loading={loading}
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `共 ${total} 道题目`,
        onChange: onPageChange,
      }}
      locale={{
        emptyText: '暂无题目数据',
      }}
    />
  )
}
