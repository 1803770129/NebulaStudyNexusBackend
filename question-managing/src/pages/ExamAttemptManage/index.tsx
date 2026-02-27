import { useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Drawer,
  InputNumber,
  Input,
  Modal,
  Progress,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  message,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EyeOutlined, ReloadOutlined, SearchOutlined, SyncOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import {
  useAdminExamAttempt,
  useAdminExamAttempts,
  useExamTimeoutSummary,
  useGradeExamAttemptItem,
  useManualScanExamTimeoutAttempts,
} from '@/hooks'
import { ExamAttemptStatus } from '@/types'
import type {
  AdminExamAttempt,
  AdminExamAttemptDetail,
  AdminExamAttemptFilters,
  ExamAttemptReportItem,
  ExamTimeoutScanResult,
} from '@/types'

const statusLabelMap: Record<string, string> = {
  [ExamAttemptStatus.ACTIVE]: '进行中',
  [ExamAttemptStatus.COMPLETED]: '已完成',
  [ExamAttemptStatus.TIMEOUT]: '已超时',
}

const statusColorMap: Record<string, string> = {
  [ExamAttemptStatus.ACTIVE]: 'processing',
  [ExamAttemptStatus.COMPLETED]: 'success',
  [ExamAttemptStatus.TIMEOUT]: 'warning',
}

function formatDuration(totalSeconds: number | null | undefined): string {
  const normalized = Math.max(0, Math.round(totalSeconds ?? 0))
  const hours = Math.floor(normalized / 3600)
  const minutes = Math.floor((normalized % 3600) / 60)
  const seconds = normalized % 60

  if (hours > 0) {
    return `${hours}小时 ${minutes}分 ${seconds}秒`
  }
  if (minutes > 0) {
    return `${minutes}分 ${seconds}秒`
  }
  return `${seconds}秒`
}

function formatUnknown(value: unknown): string {
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

function scoreDisplay(record: AdminExamAttempt): string {
  const score = record.totalScore ?? record.objectiveScore
  const fullScore = record.paper?.totalScore ?? '-'
  if (score === null || score === undefined) {
    return `- / ${fullScore}`
  }
  return `${score} / ${fullScore}`
}

function renderDetailItems(
  detail: AdminExamAttemptDetail | undefined,
  onGrade: (item: ExamAttemptReportItem) => void
) {
  if (!detail) {
    return null
  }

  return (
    <Table<ExamAttemptReportItem>
      rowKey="id"
      dataSource={detail.items}
      pagination={false}
      size="small"
      columns={[
        {
          title: '#',
          dataIndex: 'seq',
          key: 'seq',
          width: 64,
        },
        {
          title: '题目编号',
          dataIndex: 'questionId',
          key: 'questionId',
          width: 200,
          render: (questionId: string) => (
            <Tooltip title={questionId}>
              <span>{questionId.slice(0, 8)}...</span>
            </Tooltip>
          ),
        },
        {
          title: '得分',
          key: 'score',
          width: 120,
          render: (_, item) => `${item.score ?? '-'} / ${item.fullScore}`,
        },
        {
          title: '结果',
          dataIndex: 'isCorrect',
          key: 'isCorrect',
          width: 120,
          render: (isCorrect: boolean | null, item: ExamAttemptReportItem) => {
            if (item.needsManualGrading) {
              if (item.score === null) {
                return <Tag color="warning">待人工批改</Tag>
              }
              return <Tag color={isCorrect ? 'success' : 'processing'}>已人工批改</Tag>
            }
            if (isCorrect === true) {
              return <Tag color="success">正确</Tag>
            }
            if (isCorrect === false) {
              return <Tag color="error">错误</Tag>
            }
            return <Tag>未知</Tag>
          },
        },
        {
          title: '提交时间',
          dataIndex: 'submittedAt',
          key: 'submittedAt',
          width: 190,
          render: (value: string | null) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-'),
        },
        {
          title: '作答内容',
          dataIndex: 'submittedAnswer',
          key: 'submittedAnswer',
          render: (value: unknown) => (
            <Tooltip title={<pre style={{ margin: 0 }}>{formatUnknown(value)}</pre>}>
              <span>{formatUnknown(value)}</span>
            </Tooltip>
          ),
        },
        {
          title: '操作',
          key: 'action',
          width: 110,
          render: (_, item) =>
            item.needsManualGrading && item.submittedAt ? (
              <Button type="link" size="small" onClick={() => onGrade(item)}>
                {item.score === null ? '批改' : '重新批改'}
              </Button>
            ) : (
              <span style={{ color: '#999' }}>-</span>
            ),
        },
      ]}
    />
  )
}

export function ExamAttemptManagePage() {
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<ExamAttemptStatus | undefined>(undefined)
  const [paperId, setPaperId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [lastScan, setLastScan] = useState<ExamTimeoutScanResult | null>(null)
  const [gradingOpen, setGradingOpen] = useState(false)
  const [gradingItem, setGradingItem] = useState<ExamAttemptReportItem | null>(null)
  const [gradingScore, setGradingScore] = useState<number | null>(null)

  const filters: AdminExamAttemptFilters = {
    page,
    pageSize,
    status,
    paperId,
    studentId,
    keyword,
  }

  const { attempts, total, isLoading, refetch } = useAdminExamAttempts(filters)
  const {
    data: timeoutSummary,
    isLoading: timeoutLoading,
    refetch: refetchTimeoutSummary,
  } = useExamTimeoutSummary()
  const { data: detail, isLoading: detailLoading } = useAdminExamAttempt(selectedAttemptId ?? undefined)
  const scanMutation = useManualScanExamTimeoutAttempts()
  const gradeMutation = useGradeExamAttemptItem(selectedAttemptId ?? '')

  const handleSearch = () => {
    setPage(1)
  }

  const handleReset = () => {
    setKeyword('')
    setStatus(undefined)
    setPaperId('')
    setStudentId('')
    setPage(1)
  }

  const handleRefresh = () => {
    refetch()
    void refetchTimeoutSummary()
  }

  const handleManualScan = async () => {
    try {
      const result = await scanMutation.mutateAsync()
      setLastScan(result)
      message.success(
        `扫描完成：检查 ${result.scannedCount} 条，超时 ${result.timeoutCount} 条，自动结束 ${result.autoFinishedCount} 条`
      )
      handleRefresh()
    } catch {
      message.error('超时扫描失败')
    }
  }

  const openDetail = (attemptId: string) => {
    setSelectedAttemptId(attemptId)
    setDetailOpen(true)
  }

  const openGrade = (item: ExamAttemptReportItem) => {
    setGradingItem(item)
    setGradingScore(item.score ?? item.fullScore)
    setGradingOpen(true)
  }

  const submitGrade = async () => {
    if (!selectedAttemptId || !gradingItem) {
      return
    }
    if (gradingScore === null || Number.isNaN(gradingScore)) {
      message.error('请输入有效分数')
      return
    }
    if (gradingScore < 0 || gradingScore > gradingItem.fullScore) {
      message.error(`分数必须在 0 到 ${gradingItem.fullScore} 之间`)
      return
    }

    try {
      await gradeMutation.mutateAsync({
        itemId: gradingItem.id,
        payload: { score: gradingScore },
      })
      message.success('批改成功')
      setGradingOpen(false)
      setGradingItem(null)
    } catch {
      message.error('批改失败')
    }
  }

  const columns: ColumnsType<AdminExamAttempt> = [
    {
      title: '作答编号',
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
      title: '试卷',
      key: 'paper',
      width: 200,
      render: (_, record) =>
        record.paper ? (
          <Tooltip title={record.paper.title}>
            <span>{record.paper.title}</span>
          </Tooltip>
        ) : (
          <span style={{ color: '#999' }}>-</span>
        ),
    },
    {
      title: '学生',
      key: 'student',
      width: 180,
      render: (_, record) =>
        record.student ? (
          <div>
            <div>{record.student.nickname || '未命名'}</div>
            <div style={{ color: '#999', fontSize: 12 }}>{record.student.phone || '-'}</div>
          </div>
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
        <Tag color={statusColorMap[value] || 'default'}>{statusLabelMap[value] || value}</Tag>
      ),
    },
    {
      title: '进度',
      key: 'progress',
      width: 210,
      render: (_, record) => (
        <div>
          <Progress
            percent={
              record.totalCount
                ? Number(((record.answeredCount / record.totalCount) * 100).toFixed(1))
                : 0
            }
            size="small"
          />
          <span style={{ color: '#666', fontSize: 12 }}>
            {record.answeredCount}/{record.totalCount}
          </span>
        </div>
      ),
    },
    {
      title: '得分',
      key: 'score',
      width: 130,
      render: (_, record) => scoreDisplay(record),
    },
    {
      title: '人工批改',
      key: 'manual',
      width: 120,
      render: (_, record) =>
        record.pendingManualCount > 0 ? (
          <Tag color="warning">{record.pendingManualCount} 待批改</Tag>
        ) : (
          <Tag color="success">无</Tag>
        ),
    },
    {
      title: '开始时间',
      dataIndex: 'startedAt',
      key: 'startedAt',
      width: 180,
      render: (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '结束时间',
      dataIndex: 'finishedAt',
      key: 'finishedAt',
      width: 180,
      render: (value: string | null) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => openDetail(record.id)}>
          详情
        </Button>
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
        <h2 style={{ margin: 0 }}>考试作答管理</h2>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            刷新
          </Button>
          <Button
            type="primary"
            icon={<SyncOutlined />}
            loading={scanMutation.isPending}
            onClick={() => void handleManualScan()}
          >
            手动超时扫描
          </Button>
        </Space>
      </div>

      <Card style={{ marginBottom: 16 }} loading={timeoutLoading}>
        <Space size={24} wrap>
          <Statistic title="进行中作答" value={timeoutSummary?.activeCount ?? 0} />
          <Statistic title="超时候选" value={timeoutSummary?.timeoutCount ?? 0} />
          <Statistic
            title="检查时间"
            value={
              timeoutSummary?.checkedAt
                ? dayjs(timeoutSummary.checkedAt).format('YYYY-MM-DD HH:mm:ss')
                : '-'
            }
          />
        </Space>
      </Card>

      {lastScan ? (
        <Alert
          style={{ marginBottom: 16 }}
          type="info"
          showIcon
          message="最近一次手动扫描"
          description={`触发方式=${lastScan.trigger}，扫描=${lastScan.scannedCount}，超时=${lastScan.timeoutCount}，自动结束=${lastScan.autoFinishedCount}，时间=${dayjs(lastScan.scannedAt).format('YYYY-MM-DD HH:mm:ss')}`}
        />
      ) : null}

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            allowClear
            style={{ width: 220 }}
            value={keyword}
            prefix={<SearchOutlined />}
            placeholder="关键词（试卷/学生）"
            onChange={(event) => setKeyword(event.target.value)}
            onPressEnter={handleSearch}
          />
          <Select<ExamAttemptStatus | undefined>
            allowClear
            style={{ width: 160 }}
            placeholder="状态"
            value={status}
            onChange={(value) => {
              setStatus(value)
              setPage(1)
            }}
            options={[
              {
                label: statusLabelMap[ExamAttemptStatus.ACTIVE],
                value: ExamAttemptStatus.ACTIVE,
              },
              {
                label: statusLabelMap[ExamAttemptStatus.COMPLETED],
                value: ExamAttemptStatus.COMPLETED,
              },
              {
                label: statusLabelMap[ExamAttemptStatus.TIMEOUT],
                value: ExamAttemptStatus.TIMEOUT,
              },
            ]}
          />
          <Input
            allowClear
            style={{ width: 260 }}
            value={paperId}
            placeholder="试卷编号（唯一标识）"
            onChange={(event) => setPaperId(event.target.value)}
          />
          <Input
            allowClear
            style={{ width: 260 }}
            value={studentId}
            placeholder="学生编号（唯一标识）"
            onChange={(event) => setStudentId(event.target.value)}
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
          dataSource={attempts}
          loading={isLoading}
          scroll={{ x: 1700 }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (count) => `共 ${count} 条作答记录`,
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
        width={980}
        destroyOnClose
        title="作答详情"
      >
        <Card loading={detailLoading}>
          {!detail ? null : (
            <>
              <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
                <Descriptions.Item label="作答编号" span={2}>
                  {detail.attempt.id}
                </Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag color={statusColorMap[detail.attempt.status] || 'default'}>
                    {statusLabelMap[detail.attempt.status] || detail.attempt.status}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="试卷">{detail.paper?.title ?? '-'}</Descriptions.Item>
                <Descriptions.Item label="学生">{detail.student?.nickname || '-'}</Descriptions.Item>
                <Descriptions.Item label="手机号">{detail.student?.phone || '-'}</Descriptions.Item>
                <Descriptions.Item label="开始时间">
                  {dayjs(detail.attempt.startedAt).format('YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
                <Descriptions.Item label="结束时间">
                  {detail.attempt.finishedAt
                    ? dayjs(detail.attempt.finishedAt).format('YYYY-MM-DD HH:mm:ss')
                    : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="用时">
                  {formatDuration(detail.attempt.durationSeconds)}
                </Descriptions.Item>
                <Descriptions.Item label="得分">
                  {detail.attempt.totalScore ?? '-'} / {detail.paper?.totalScore ?? '-'}
                </Descriptions.Item>
                <Descriptions.Item label="客观题得分">
                  {detail.attempt.objectiveScore ?? '-'}
                </Descriptions.Item>
                <Descriptions.Item label="主观题得分">
                  {detail.attempt.subjectiveScore ?? '-'}
                </Descriptions.Item>
                <Descriptions.Item label="已答题数">
                  {detail.stats.answeredCount}/{detail.stats.totalCount}
                </Descriptions.Item>
                <Descriptions.Item label="正确数">{detail.stats.correctCount}</Descriptions.Item>
                <Descriptions.Item label="待人工批改">
                  {detail.stats.pendingManualCount}
                </Descriptions.Item>
              </Descriptions>

              {renderDetailItems(detail, openGrade)}
            </>
          )}
        </Card>
      </Drawer>

      <Modal
        open={gradingOpen}
        title="主观题批改"
        onCancel={() => setGradingOpen(false)}
        onOk={() => void submitGrade()}
        confirmLoading={gradeMutation.isPending}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <strong>题目项编号：</strong> {gradingItem?.id || '-'}
          </div>
          <div>
            <strong>满分：</strong> {gradingItem?.fullScore ?? '-'}
          </div>
          <div>
            <strong>学生作答：</strong>
            <pre
              style={{
                marginTop: 8,
                background: '#fafafa',
                border: '1px solid #f0f0f0',
                borderRadius: 8,
                padding: 8,
                maxHeight: 180,
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
              }}
            >
              {formatUnknown(gradingItem?.submittedAnswer)}
            </pre>
          </div>
          <div>
            <strong>得分</strong>
            <div style={{ marginTop: 8 }}>
              <InputNumber
                min={0}
                max={gradingItem?.fullScore ?? 100}
                precision={2}
                style={{ width: 220 }}
                value={gradingScore}
                onChange={(value) => setGradingScore(typeof value === 'number' ? value : null)}
              />
            </div>
          </div>
        </Space>
      </Modal>
    </div>
  )
}

export default ExamAttemptManagePage
