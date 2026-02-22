import { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Card,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Radio,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EyeOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import {
  useClaimManualGradingTask,
  useManualGradingTask,
  useManualGradingTasks,
  useReopenManualGradingTask,
  useSubmitManualGradingTask,
} from '@/hooks'
import { ManualGradingTaskStatus } from '@/types'
import type {
  ManualGradingTaskSummary,
  SubmitManualGradingPayload,
} from '@/types'

const statusLabelMap: Record<string, string> = {
  [ManualGradingTaskStatus.PENDING]: '待领取',
  [ManualGradingTaskStatus.ASSIGNED]: '已领取',
  [ManualGradingTaskStatus.DONE]: '已完成',
  [ManualGradingTaskStatus.REOPEN]: '重开待批改',
}

const statusColorMap: Record<string, string> = {
  [ManualGradingTaskStatus.PENDING]: 'default',
  [ManualGradingTaskStatus.ASSIGNED]: 'processing',
  [ManualGradingTaskStatus.DONE]: 'success',
  [ManualGradingTaskStatus.REOPEN]: 'warning',
}

function formatAnswer(value: unknown): string {
  if (value === null || value === undefined) {
    return '-'
  }

  if (typeof value === 'string') {
    return value
  }

  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

export function ManualGradingManagePage() {
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<ManualGradingTaskStatus | undefined>(undefined)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const [gradingForm] = Form.useForm<SubmitManualGradingPayload>()

  const { tasks, total, isLoading, refetch } = useManualGradingTasks({
    keyword,
    status,
    page,
    pageSize,
  })

  const {
    data: detail,
    isLoading: detailLoading,
    refetch: refetchDetail,
  } = useManualGradingTask(selectedTaskId ?? undefined)

  const claimMutation = useClaimManualGradingTask()
  const submitMutation = useSubmitManualGradingTask()
  const reopenMutation = useReopenManualGradingTask()

  const canSubmit = useMemo(() => {
    if (!detail) {
      return false
    }
    return (
      detail.status === ManualGradingTaskStatus.PENDING ||
      detail.status === ManualGradingTaskStatus.ASSIGNED ||
      detail.status === ManualGradingTaskStatus.REOPEN
    )
  }, [detail])

  useEffect(() => {
    if (!detail) {
      return
    }

    gradingForm.setFieldsValue({
      score: detail.score ?? undefined,
      isPassed: detail.isPassed ?? true,
      feedback: detail.feedback ?? '',
      tags: detail.tags ?? [],
    })
  }, [detail, gradingForm])

  const handleSearch = () => {
    setPage(1)
  }

  const handleReset = () => {
    setKeyword('')
    setStatus(undefined)
    setPage(1)
  }

  const handleRefresh = () => {
    refetch()
    void refetchDetail()
  }

  const openDetail = (taskId: string) => {
    setSelectedTaskId(taskId)
    setDetailOpen(true)
  }

  const handleClaim = async (taskId: string) => {
    try {
      await claimMutation.mutateAsync(taskId)
      message.success('任务领取成功')
      if (selectedTaskId === taskId) {
        void refetchDetail()
      }
    } catch {
      message.error('任务领取失败')
    }
  }

  const handleSubmitGrading = async () => {
    if (!detail) {
      return
    }

    try {
      const values = await gradingForm.validateFields()
      await submitMutation.mutateAsync({
        taskId: detail.id,
        payload: {
          score: values.score,
          isPassed: values.isPassed,
          feedback: values.feedback?.trim() || undefined,
          tags: values.tags?.length ? values.tags : undefined,
        },
      })
      message.success('批改提交成功')
      void refetchDetail()
      refetch()
    } catch {
      message.error('批改提交失败')
    }
  }

  const handleReopen = async () => {
    if (!detail) {
      return
    }

    try {
      await reopenMutation.mutateAsync({ taskId: detail.id })
      message.success('任务已重开')
      void refetchDetail()
      refetch()
    } catch {
      message.error('任务重开失败')
    }
  }

  const columns: ColumnsType<ManualGradingTaskSummary> = [
    {
      title: '任务 ID',
      dataIndex: 'id',
      key: 'id',
      width: 220,
      render: (id: string) => (
        <Tooltip title={id}>
          <span>{id.slice(0, 8)}...</span>
        </Tooltip>
      ),
    },
    {
      title: '学生',
      key: 'student',
      width: 180,
      render: (_, record) =>
        record.student ? (
          <div>
            <div>{record.student.nickname || '未命名学生'}</div>
            <div style={{ color: '#999', fontSize: 12 }}>{record.student.phone || '-'}</div>
          </div>
        ) : (
          <span style={{ color: '#999' }}>-</span>
        ),
    },
    {
      title: '题目',
      key: 'question',
      render: (_, record) =>
        record.question ? (
          <Tooltip title={record.question.title}>
            <span>{record.question.title}</span>
          </Tooltip>
        ) : (
          <span style={{ color: '#999' }}>-</span>
        ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (value: string) => (
        <Tag color={statusColorMap[value]}>{statusLabelMap[value] || value}</Tag>
      ),
    },
    {
      title: '批改员',
      key: 'assignee',
      width: 140,
      render: (_, record) => record.assignee?.username || '-',
    },
    {
      title: '得分',
      dataIndex: 'score',
      key: 'score',
      width: 100,
      render: (value: number | null) => (value === null ? '-' : value),
    },
    {
      title: '提交时间',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      width: 180,
      render: (value: string | null) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => openDetail(record.id)}>
            详情
          </Button>
          {(record.status === ManualGradingTaskStatus.PENDING ||
            record.status === ManualGradingTaskStatus.REOPEN) && (
            <Button type="link" size="small" onClick={() => void handleClaim(record.id)}>
              领取
            </Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2 style={{ margin: 0 }}>人工批改任务</h2>
        <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
          刷新
        </Button>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            allowClear
            value={keyword}
            style={{ width: 260 }}
            prefix={<SearchOutlined />}
            placeholder="搜索学生昵称/手机号/题目标题"
            onChange={(event) => setKeyword(event.target.value)}
            onPressEnter={handleSearch}
          />
          <Select<ManualGradingTaskStatus | undefined>
            allowClear
            style={{ width: 180 }}
            placeholder="任务状态"
            value={status}
            onChange={(value) => {
              setStatus(value)
              setPage(1)
            }}
            options={[
              {
                label: statusLabelMap[ManualGradingTaskStatus.PENDING],
                value: ManualGradingTaskStatus.PENDING,
              },
              {
                label: statusLabelMap[ManualGradingTaskStatus.ASSIGNED],
                value: ManualGradingTaskStatus.ASSIGNED,
              },
              {
                label: statusLabelMap[ManualGradingTaskStatus.DONE],
                value: ManualGradingTaskStatus.DONE,
              },
              {
                label: statusLabelMap[ManualGradingTaskStatus.REOPEN],
                value: ManualGradingTaskStatus.REOPEN,
              },
            ]}
          />
          <Button type="primary" onClick={handleSearch}>
            查询
          </Button>
          <Button onClick={handleReset}>重置</Button>
        </Space>
      </Card>

      <Card>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={tasks}
          loading={isLoading}
          scroll={{ x: 1300 }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (count) => `共 ${count} 条任务`,
            onChange: (nextPage, nextPageSize) => {
              setPage(nextPage)
              setPageSize(nextPageSize)
            },
          }}
        />
      </Card>

      <Drawer
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        width={900}
        title="批改任务详情"
        destroyOnClose
      >
        <Card loading={detailLoading}>
          {!detail ? null : (
            <>
              <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
                <Descriptions.Item label="任务 ID" span={2}>
                  {detail.id}
                </Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag color={statusColorMap[detail.status]}>
                    {statusLabelMap[detail.status] || detail.status}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="批改员">{detail.assignee?.username || '-'}</Descriptions.Item>
                <Descriptions.Item label="学生">{detail.student?.nickname || '-'}</Descriptions.Item>
                <Descriptions.Item label="手机号">{detail.student?.phone || '-'}</Descriptions.Item>
                <Descriptions.Item label="题目标题" span={2}>
                  {detail.question?.title || '-'}
                </Descriptions.Item>
              </Descriptions>

              <h3 style={{ marginBottom: 8 }}>学生答案</h3>
              <pre
                style={{
                  background: '#fafafa',
                  border: '1px solid #f0f0f0',
                  borderRadius: 8,
                  padding: 12,
                  whiteSpace: 'pre-wrap',
                  marginBottom: 16,
                }}
              >
                {formatAnswer(detail.practiceRecord?.submittedAnswer)}
              </pre>

              <h3 style={{ marginBottom: 8 }}>标准答案</h3>
              <pre
                style={{
                  background: '#fafafa',
                  border: '1px solid #f0f0f0',
                  borderRadius: 8,
                  padding: 12,
                  whiteSpace: 'pre-wrap',
                  marginBottom: 16,
                }}
              >
                {formatAnswer(detail.question?.answer)}
              </pre>

              <Form form={gradingForm} layout="vertical">
                <Form.Item
                  label="得分"
                  name="score"
                  rules={[
                    { required: true, message: '请输入得分' },
                    { type: 'number', min: 0, max: 100, message: '得分范围 0-100' },
                  ]}
                >
                  <InputNumber min={0} max={100} precision={0} style={{ width: 240 }} />
                </Form.Item>
                <Form.Item
                  label="是否通过"
                  name="isPassed"
                  rules={[{ required: true, message: '请选择是否通过' }]}
                >
                  <Radio.Group
                    options={[
                      { label: '通过', value: true },
                      { label: '不通过', value: false },
                    ]}
                  />
                </Form.Item>
                <Form.Item label="评语" name="feedback">
                  <Input.TextArea rows={4} maxLength={2000} />
                </Form.Item>
                <Form.Item label="标签" name="tags">
                  <Select mode="tags" placeholder="输入标签后回车" />
                </Form.Item>
              </Form>

              <Space>
                {(detail.status === ManualGradingTaskStatus.PENDING ||
                  detail.status === ManualGradingTaskStatus.REOPEN) && (
                  <Button
                    onClick={() => void handleClaim(detail.id)}
                    loading={claimMutation.isPending}
                  >
                    领取任务
                  </Button>
                )}
                <Button
                  type="primary"
                  onClick={() => void handleSubmitGrading()}
                  loading={submitMutation.isPending}
                  disabled={!canSubmit}
                >
                  提交批改
                </Button>
                {detail.status === ManualGradingTaskStatus.DONE && (
                  <Popconfirm
                    title="确认重开该任务？"
                    onConfirm={() => void handleReopen()}
                    okText="重开"
                    cancelText="取消"
                  >
                    <Button loading={reopenMutation.isPending}>重开任务</Button>
                  </Popconfirm>
                )}
              </Space>
            </>
          )}
        </Card>
      </Drawer>
    </div>
  )
}

export default ManualGradingManagePage
