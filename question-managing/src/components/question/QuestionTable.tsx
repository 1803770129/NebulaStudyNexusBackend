/**
 * 题目列表表格组件
 */

import { Table, Tag, Space, Button, Tooltip, Popconfirm } from 'antd'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Question, PaginationConfig, QuestionStatus } from '@/types'
import {
  QUESTION_TYPE_LABELS,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
  QUESTION_STATUS_LABELS,
  QUESTION_STATUS_COLORS,
} from '@/constants'
import dayjs from 'dayjs'

interface QuestionStatusAction {
  targetStatus: QuestionStatus
  label: string
  confirmText: string
  danger?: boolean
}

const QUESTION_STATUS_ACTIONS: Record<QuestionStatus, QuestionStatusAction[]> = {
  draft: [
    {
      targetStatus: 'reviewed',
      label: '审核',
      confirmText: '确定将该题目标记为已审核吗？',
    },
    {
      targetStatus: 'archived',
      label: '归档',
      confirmText: '确定归档该题目吗？',
      danger: true,
    },
  ],
  reviewed: [
    {
      targetStatus: 'published',
      label: '发布',
      confirmText: '确定发布该题目吗？',
    },
    {
      targetStatus: 'draft',
      label: '回草稿',
      confirmText: '确定将该题目退回草稿吗？',
    },
    {
      targetStatus: 'archived',
      label: '归档',
      confirmText: '确定归档该题目吗？',
      danger: true,
    },
  ],
  published: [
    {
      targetStatus: 'archived',
      label: '归档',
      confirmText: '确定归档该已发布题目吗？',
      danger: true,
    },
  ],
  archived: [
    {
      targetStatus: 'draft',
      label: '恢复草稿',
      confirmText: '确定将该题目恢复为草稿吗？',
    },
  ],
}

interface QuestionTableProps {
  questions: Question[]
  loading: boolean
  pagination: PaginationConfig
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onChangeStatus: (id: string, targetStatus: QuestionStatus) => void
  changingStatusId?: string | null
  onPageChange: (page: number, pageSize: number) => void
}

export function QuestionTable({
  questions,
  loading,
  pagination,
  onEdit,
  onDelete,
  onChangeStatus,
  changingStatusId,
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
      width: 110,
      render: (type) => <Tag>{QUESTION_TYPE_LABELS[type as keyof typeof QUESTION_TYPE_LABELS]}</Tag>,
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      width: 90,
      render: (difficulty) => (
        <Tag color={DIFFICULTY_COLORS[difficulty as keyof typeof DIFFICULTY_COLORS]}>
          {DIFFICULTY_LABELS[difficulty as keyof typeof DIFFICULTY_LABELS]}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: QuestionStatus | undefined) => {
        const normalizedStatus = (status ?? 'draft') as QuestionStatus
        return (
          <Tag color={QUESTION_STATUS_COLORS[normalizedStatus] || 'default'}>
            {QUESTION_STATUS_LABELS[normalizedStatus] || normalizedStatus}
          </Tag>
        )
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 360,
      render: (_, record) => {
        const currentStatus = (record.status ?? 'draft') as QuestionStatus
        const statusActions = QUESTION_STATUS_ACTIONS[currentStatus] || []
        const canEdit = currentStatus === 'draft' || currentStatus === 'reviewed'
        const canDelete = currentStatus !== 'published'

        return (
          <Space size={0} wrap>
            {statusActions.map((action) => (
              <Popconfirm
                key={`${record.id}-${action.targetStatus}`}
                title={action.confirmText}
                okText="确定"
                cancelText="取消"
                onConfirm={() => onChangeStatus(record.id, action.targetStatus)}
              >
                <Button
                  type="link"
                  size="small"
                  danger={action.danger}
                  loading={changingStatusId === record.id}
                >
                  {action.label}
                </Button>
              </Popconfirm>
            ))}

            <Tooltip title={canEdit ? '编辑' : '当前状态不可编辑'}>
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                disabled={!canEdit || changingStatusId === record.id}
                onClick={() => onEdit(record.id)}
              >
                编辑
              </Button>
            </Tooltip>

            <Tooltip title={canDelete ? '删除' : '已发布题目需先归档'}>
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
                disabled={!canDelete || changingStatusId === record.id}
                onClick={() => onDelete(record.id)}
              >
                删除
              </Button>
            </Tooltip>
          </Space>
        )
      },
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
