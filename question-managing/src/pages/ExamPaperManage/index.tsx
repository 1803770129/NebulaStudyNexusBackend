import { useState } from 'react'
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  message,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useCreateExamPaper, useExamPapers, usePublishExamPaper } from '@/hooks'
import { ExamPaperStatus } from '@/types'
import type { CreateExamPaperPayload, ExamPaper } from '@/types'

interface CreateExamPaperFormValues {
  title: string
  description?: string
  durationMinutes: number
  items: Array<{
    questionId: string
    score: number
  }>
}

const statusLabelMap: Record<string, string> = {
  [ExamPaperStatus.DRAFT]: '草稿',
  [ExamPaperStatus.PUBLISHED]: '已发布',
}

const statusColorMap: Record<string, string> = {
  [ExamPaperStatus.DRAFT]: 'default',
  [ExamPaperStatus.PUBLISHED]: 'success',
}

export function ExamPaperManagePage() {
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<ExamPaperStatus | undefined>(undefined)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [createOpen, setCreateOpen] = useState(false)
  const [createForm] = Form.useForm<CreateExamPaperFormValues>()

  const { papers, total, isLoading, refetch } = useExamPapers({
    page,
    pageSize,
    keyword,
    status,
  })
  const createMutation = useCreateExamPaper()
  const publishMutation = usePublishExamPaper()

  const handleSearch = () => {
    setPage(1)
  }

  const handleReset = () => {
    setKeyword('')
    setStatus(undefined)
    setPage(1)
  }

  const handleCreate = async () => {
    try {
      const values = await createForm.validateFields()
      const payload: CreateExamPaperPayload = {
        title: values.title.trim(),
        description: values.description?.trim() || undefined,
        durationMinutes: values.durationMinutes,
        items: values.items.map((item) => ({
          questionId: item.questionId.trim(),
          score: item.score,
        })),
      }
      await createMutation.mutateAsync(payload)
      message.success('试卷创建成功')
      setCreateOpen(false)
      createForm.resetFields()
      refetch()
    } catch {
      message.error('试卷创建失败')
    }
  }

  const handlePublish = async (paperId: string) => {
    try {
      await publishMutation.mutateAsync(paperId)
      message.success('试卷发布成功')
      refetch()
    } catch {
      message.error('试卷发布失败')
    }
  }

  const columns: ColumnsType<ExamPaper> = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (value: string) => (
        <Tag color={statusColorMap[value] || 'default'}>{statusLabelMap[value] || value}</Tag>
      ),
    },
    {
      title: '题目数',
      dataIndex: 'itemCount',
      key: 'itemCount',
      width: 100,
    },
    {
      title: '时长(分钟)',
      dataIndex: 'durationMinutes',
      key: 'durationMinutes',
      width: 120,
    },
    {
      title: '总分',
      dataIndex: 'totalScore',
      key: 'totalScore',
      width: 90,
    },
    {
      title: '发布时间',
      dataIndex: 'publishedAt',
      key: 'publishedAt',
      width: 170,
      render: (value: string | null) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 130,
      render: (_, record) =>
        record.status === ExamPaperStatus.DRAFT ? (
          <Popconfirm
            title="确定发布这份试卷吗？"
            okText="发布"
            cancelText="取消"
            onConfirm={() => void handlePublish(record.id)}
          >
            <Button type="link" size="small" loading={publishMutation.isPending}>
              发布
            </Button>
          </Popconfirm>
        ) : (
          <span style={{ color: '#999' }}>-</span>
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
        <h2 style={{ margin: 0 }}>试卷管理</h2>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            刷新
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
            新建试卷
          </Button>
        </Space>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            allowClear
            style={{ width: 240 }}
            placeholder="搜索试卷标题"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            onPressEnter={handleSearch}
          />
          <Select<ExamPaperStatus | undefined>
            allowClear
            style={{ width: 160 }}
            placeholder="状态"
            value={status}
            onChange={(value) => {
              setStatus(value)
              setPage(1)
            }}
            options={[
              { label: statusLabelMap[ExamPaperStatus.DRAFT], value: ExamPaperStatus.DRAFT },
              {
                label: statusLabelMap[ExamPaperStatus.PUBLISHED],
                value: ExamPaperStatus.PUBLISHED,
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
          dataSource={papers}
          loading={isLoading}
          scroll={{ x: 1100 }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (count) => `共 ${count} 份试卷`,
            onChange: (nextPage, nextPageSize) => {
              setPage(nextPage)
              setPageSize(nextPageSize)
            },
          }}
        />
      </Card>

      <Modal
        open={createOpen}
        title="新建试卷"
        destroyOnClose
        width={760}
        confirmLoading={createMutation.isPending}
        onCancel={() => setCreateOpen(false)}
        onOk={() => void handleCreate()}
      >
        <Form
          form={createForm}
          layout="vertical"
          initialValues={{
            durationMinutes: 60,
            items: [{ questionId: '', score: 5 }],
          }}
        >
          <Form.Item label="标题" name="title" rules={[{ required: true, message: '请输入试卷标题' }]}>
            <Input maxLength={200} />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={3} maxLength={2000} />
          </Form.Item>
          <Form.Item
            label="考试时长(分钟)"
            name="durationMinutes"
            rules={[{ required: true, message: '请输入考试时长' }]}
          >
            <InputNumber min={1} max={300} style={{ width: 240 }} />
          </Form.Item>

          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="start">
                    <Form.Item
                      label={index === 0 ? '题目ID(UUID)' : ''}
                      name={[field.name, 'questionId']}
                      rules={[{ required: true, message: '请输入题目ID' }]}
                    >
                      <Input placeholder="question uuid" style={{ width: 420 }} />
                    </Form.Item>
                    <Form.Item
                      label={index === 0 ? '分值' : ''}
                      name={[field.name, 'score']}
                      rules={[{ required: true, message: '请输入分值' }]}
                    >
                      <InputNumber min={1} max={100} style={{ width: 120 }} />
                    </Form.Item>
                    <Button danger onClick={() => remove(field.name)} disabled={fields.length === 1}>
                      删除
                    </Button>
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add({ questionId: '', score: 5 })}>
                  添加题目
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  )
}

export default ExamPaperManagePage

