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
  [ExamAttemptStatus.ACTIVE]: 'In Progress',
  [ExamAttemptStatus.COMPLETED]: 'Completed',
  [ExamAttemptStatus.TIMEOUT]: 'Timeout',
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
    return `${hours}h ${minutes}m ${seconds}s`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }
  return `${seconds}s`
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
          title: 'Question ID',
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
          title: 'Score',
          key: 'score',
          width: 120,
          render: (_, item) => `${item.score ?? '-'} / ${item.fullScore}`,
        },
        {
          title: 'Result',
          dataIndex: 'isCorrect',
          key: 'isCorrect',
          width: 120,
          render: (isCorrect: boolean | null, item: ExamAttemptReportItem) => {
            if (item.needsManualGrading) {
              if (item.score === null) {
                return <Tag color="warning">Pending Manual</Tag>
              }
              return <Tag color={isCorrect ? 'success' : 'processing'}>Manually Graded</Tag>
            }
            if (isCorrect === true) {
              return <Tag color="success">Correct</Tag>
            }
            if (isCorrect === false) {
              return <Tag color="error">Wrong</Tag>
            }
            return <Tag>Unknown</Tag>
          },
        },
        {
          title: 'Submitted At',
          dataIndex: 'submittedAt',
          key: 'submittedAt',
          width: 190,
          render: (value: string | null) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-'),
        },
        {
          title: 'Answer',
          dataIndex: 'submittedAnswer',
          key: 'submittedAnswer',
          render: (value: unknown) => (
            <Tooltip title={<pre style={{ margin: 0 }}>{formatUnknown(value)}</pre>}>
              <span>{formatUnknown(value)}</span>
            </Tooltip>
          ),
        },
        {
          title: 'Action',
          key: 'action',
          width: 110,
          render: (_, item) =>
            item.needsManualGrading && item.submittedAt ? (
              <Button type="link" size="small" onClick={() => onGrade(item)}>
                {item.score === null ? 'Grade' : 'Regrade'}
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
        `Scan done: checked ${result.scannedCount}, timeout ${result.timeoutCount}, auto-finished ${result.autoFinishedCount}`
      )
      handleRefresh()
    } catch {
      message.error('Timeout scan failed')
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
      message.error('Please input a valid score')
      return
    }
    if (gradingScore < 0 || gradingScore > gradingItem.fullScore) {
      message.error(`Score must be between 0 and ${gradingItem.fullScore}`)
      return
    }

    try {
      await gradeMutation.mutateAsync({
        itemId: gradingItem.id,
        payload: { score: gradingScore },
      })
      message.success('Item graded successfully')
      setGradingOpen(false)
      setGradingItem(null)
    } catch {
      message.error('Failed to grade item')
    }
  }

  const columns: ColumnsType<AdminExamAttempt> = [
    {
      title: 'Attempt ID',
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
      title: 'Paper',
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
      title: 'Student',
      key: 'student',
      width: 180,
      render: (_, record) =>
        record.student ? (
          <div>
            <div>{record.student.nickname || 'Unnamed'}</div>
            <div style={{ color: '#999', fontSize: 12 }}>{record.student.phone || '-'}</div>
          </div>
        ) : (
          <span style={{ color: '#999' }}>-</span>
        ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (value: string) => (
        <Tag color={statusColorMap[value] || 'default'}>{statusLabelMap[value] || value}</Tag>
      ),
    },
    {
      title: 'Progress',
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
      title: 'Score',
      key: 'score',
      width: 130,
      render: (_, record) => scoreDisplay(record),
    },
    {
      title: 'Manual',
      key: 'manual',
      width: 120,
      render: (_, record) =>
        record.pendingManualCount > 0 ? (
          <Tag color="warning">{record.pendingManualCount} pending</Tag>
        ) : (
          <Tag color="success">none</Tag>
        ),
    },
    {
      title: 'Started At',
      dataIndex: 'startedAt',
      key: 'startedAt',
      width: 180,
      render: (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'Finished At',
      dataIndex: 'finishedAt',
      key: 'finishedAt',
      width: 180,
      render: (value: string | null) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => openDetail(record.id)}>
          Detail
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
        <h2 style={{ margin: 0 }}>Exam Attempts</h2>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<SyncOutlined />}
            loading={scanMutation.isPending}
            onClick={() => void handleManualScan()}
          >
            Manual Timeout Scan
          </Button>
        </Space>
      </div>

      <Card style={{ marginBottom: 16 }} loading={timeoutLoading}>
        <Space size={24} wrap>
          <Statistic title="Active Attempts" value={timeoutSummary?.activeCount ?? 0} />
          <Statistic title="Timeout Candidates" value={timeoutSummary?.timeoutCount ?? 0} />
          <Statistic
            title="Checked At"
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
          message="Last Manual Scan"
          description={`trigger=${lastScan.trigger}, scanned=${lastScan.scannedCount}, timeout=${lastScan.timeoutCount}, autoFinished=${lastScan.autoFinishedCount}, at=${dayjs(lastScan.scannedAt).format('YYYY-MM-DD HH:mm:ss')}`}
        />
      ) : null}

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            allowClear
            style={{ width: 220 }}
            value={keyword}
            prefix={<SearchOutlined />}
            placeholder="Keyword (paper/student)"
            onChange={(event) => setKeyword(event.target.value)}
            onPressEnter={handleSearch}
          />
          <Select<ExamAttemptStatus | undefined>
            allowClear
            style={{ width: 160 }}
            placeholder="Status"
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
            placeholder="Paper ID (UUID)"
            onChange={(event) => setPaperId(event.target.value)}
          />
          <Input
            allowClear
            style={{ width: 260 }}
            value={studentId}
            placeholder="Student ID (UUID)"
            onChange={(event) => setStudentId(event.target.value)}
          />
          <Button type="primary" onClick={handleSearch}>
            Search
          </Button>
          <Button onClick={handleReset}>Reset</Button>
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
            showTotal: (count) => `Total ${count} attempts`,
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
        title="Exam Attempt Detail"
      >
        <Card loading={detailLoading}>
          {!detail ? null : (
            <>
              <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
                <Descriptions.Item label="Attempt ID" span={2}>
                  {detail.attempt.id}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={statusColorMap[detail.attempt.status] || 'default'}>
                    {statusLabelMap[detail.attempt.status] || detail.attempt.status}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Paper">{detail.paper?.title ?? '-'}</Descriptions.Item>
                <Descriptions.Item label="Student">{detail.student?.nickname || '-'}</Descriptions.Item>
                <Descriptions.Item label="Phone">{detail.student?.phone || '-'}</Descriptions.Item>
                <Descriptions.Item label="Started At">
                  {dayjs(detail.attempt.startedAt).format('YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
                <Descriptions.Item label="Finished At">
                  {detail.attempt.finishedAt
                    ? dayjs(detail.attempt.finishedAt).format('YYYY-MM-DD HH:mm:ss')
                    : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Duration">
                  {formatDuration(detail.attempt.durationSeconds)}
                </Descriptions.Item>
                <Descriptions.Item label="Score">
                  {detail.attempt.totalScore ?? '-'} / {detail.paper?.totalScore ?? '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Objective Score">
                  {detail.attempt.objectiveScore ?? '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Subjective Score">
                  {detail.attempt.subjectiveScore ?? '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Answered">
                  {detail.stats.answeredCount}/{detail.stats.totalCount}
                </Descriptions.Item>
                <Descriptions.Item label="Correct">{detail.stats.correctCount}</Descriptions.Item>
                <Descriptions.Item label="Pending Manual">
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
        title="Grade Subjective Item"
        onCancel={() => setGradingOpen(false)}
        onOk={() => void submitGrade()}
        confirmLoading={gradeMutation.isPending}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <strong>Item ID:</strong> {gradingItem?.id || '-'}
          </div>
          <div>
            <strong>Full Score:</strong> {gradingItem?.fullScore ?? '-'}
          </div>
          <div>
            <strong>Submitted Answer:</strong>
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
            <strong>Score</strong>
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
