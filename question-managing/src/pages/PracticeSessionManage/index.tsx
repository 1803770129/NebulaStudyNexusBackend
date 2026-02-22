import { useMemo, useState } from 'react'
import {
  Button,
  Card,
  Descriptions,
  Drawer,
  Input,
  Progress,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import {
  useAdminPracticeSession,
  useAdminPracticeSessionStats,
  useAdminPracticeSessions,
} from '@/hooks'
import { PracticeSessionMode, PracticeSessionStatus } from '@/types'
import type { AdminPracticeSession, PracticeSessionWeakKnowledgePoint } from '@/types'

const modeLabelMap: Record<string, string> = {
  [PracticeSessionMode.RANDOM]: '随机练习',
  [PracticeSessionMode.CATEGORY]: '分类练习',
  [PracticeSessionMode.KNOWLEDGE]: '知识点练习',
  [PracticeSessionMode.REVIEW]: '错题复习',
}

const modeColorMap: Record<string, string> = {
  [PracticeSessionMode.RANDOM]: 'default',
  [PracticeSessionMode.CATEGORY]: 'blue',
  [PracticeSessionMode.KNOWLEDGE]: 'purple',
  [PracticeSessionMode.REVIEW]: 'orange',
}

const statusLabelMap: Record<string, string> = {
  [PracticeSessionStatus.ACTIVE]: '进行中',
  [PracticeSessionStatus.COMPLETED]: '已完成',
  [PracticeSessionStatus.ABANDONED]: '已放弃',
}

const statusColorMap: Record<string, string> = {
  [PracticeSessionStatus.ACTIVE]: 'processing',
  [PracticeSessionStatus.COMPLETED]: 'success',
  [PracticeSessionStatus.ABANDONED]: 'error',
}

const itemStatusLabelMap: Record<string, string> = {
  pending: '待作答',
  answered: '已作答',
  skipped: '已跳过',
}

const itemStatusColorMap: Record<string, string> = {
  pending: 'default',
  answered: 'success',
  skipped: 'warning',
}

function formatDuration(totalSeconds?: number): string {
  const normalized = Math.max(0, Math.round(totalSeconds ?? 0))
  if (normalized === 0) {
    return '0s'
  }

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

export function PracticeSessionManagePage() {
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<PracticeSessionStatus | undefined>(undefined)
  const [mode, setMode] = useState<PracticeSessionMode | undefined>(undefined)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const {
    sessions,
    total,
    isLoading,
    refetch: refetchSessions,
  } = useAdminPracticeSessions({
    keyword,
    status,
    mode,
    page,
    pageSize,
  })

  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useAdminPracticeSessionStats()

  const { data: detail, isLoading: detailLoading } = useAdminPracticeSession(
    selectedSessionId ?? undefined
  )

  const completedPercent = useMemo(() => {
    if (!stats || stats.totalSessions === 0) {
      return 0
    }

    return Number(((stats.completedSessions / stats.totalSessions) * 100).toFixed(1))
  }, [stats])

  const handleSearch = () => {
    setPage(1)
  }

  const handleReset = () => {
    setKeyword('')
    setStatus(undefined)
    setMode(undefined)
    setPage(1)
  }

  const handleRefresh = () => {
    refetchSessions()
    refetchStats()
  }

  const openDetail = (sessionId: string) => {
    setSelectedSessionId(sessionId)
    setDetailOpen(true)
  }

  const columns: ColumnsType<AdminPracticeSession> = [
    {
      title: '会话 ID',
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
      title: '模式',
      dataIndex: 'mode',
      key: 'mode',
      width: 120,
      render: (value: string) => <Tag color={modeColorMap[value]}>{modeLabelMap[value] || value}</Tag>,
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
      title: '进度',
      key: 'progress',
      width: 220,
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
      title: '正确率',
      dataIndex: 'correctRate',
      key: 'correctRate',
      width: 100,
      render: (value: number) => `${(value * 100).toFixed(1)}%`,
    },
    {
      title: '耗时',
      dataIndex: 'totalDuration',
      key: 'totalDuration',
      width: 120,
      render: (value: number | undefined) => formatDuration(value),
    },
    {
      title: '开始时间',
      dataIndex: 'startedAt',
      key: 'startedAt',
      width: 170,
      render: (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '结束时间',
      dataIndex: 'endedAt',
      key: 'endedAt',
      width: 170,
      render: (value: string | null) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-'),
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
        <h2 style={{ margin: 0 }}>会话练习管理</h2>
        <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
          刷新
        </Button>
      </div>

      <Card style={{ marginBottom: 16 }} loading={statsLoading}>
        <Space size={24} wrap>
          <Statistic title="会话总数" value={stats?.totalSessions ?? 0} />
          <Statistic
            title="进行中"
            value={stats?.activeSessions ?? 0}
            valueStyle={{ color: '#1677ff' }}
            prefix={<ClockCircleOutlined />}
          />
          <Statistic
            title="已完成"
            value={stats?.completedSessions ?? 0}
            valueStyle={{ color: '#52c41a' }}
            prefix={<CheckCircleOutlined />}
          />
          <Statistic
            title="已放弃"
            value={stats?.abandonedSessions ?? 0}
            valueStyle={{ color: '#ff4d4f' }}
            prefix={<StopOutlined />}
          />
          <Statistic title="今日新增" value={stats?.todayCreatedSessions ?? 0} />
          <Statistic title="平均正确率" value={`${((stats?.avgCorrectRate ?? 0) * 100).toFixed(1)}%`} />
          <div>
            <div style={{ color: '#666', fontSize: 12, marginBottom: 4 }}>完成率</div>
            <Progress type="circle" width={64} percent={completedPercent} />
          </div>
        </Space>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            allowClear
            value={keyword}
            style={{ width: 240 }}
            prefix={<SearchOutlined />}
            placeholder="搜索学生昵称或手机号"
            onChange={(event) => setKeyword(event.target.value)}
            onPressEnter={handleSearch}
          />
          <Select<PracticeSessionStatus | undefined>
            allowClear
            style={{ width: 160 }}
            placeholder="会话状态"
            value={status}
            onChange={(value) => {
              setStatus(value)
              setPage(1)
            }}
            options={[
              {
                label: statusLabelMap[PracticeSessionStatus.ACTIVE],
                value: PracticeSessionStatus.ACTIVE,
              },
              {
                label: statusLabelMap[PracticeSessionStatus.COMPLETED],
                value: PracticeSessionStatus.COMPLETED,
              },
              {
                label: statusLabelMap[PracticeSessionStatus.ABANDONED],
                value: PracticeSessionStatus.ABANDONED,
              },
            ]}
          />
          <Select<PracticeSessionMode | undefined>
            allowClear
            style={{ width: 180 }}
            placeholder="会话模式"
            value={mode}
            onChange={(value) => {
              setMode(value)
              setPage(1)
            }}
            options={[
              { label: modeLabelMap[PracticeSessionMode.RANDOM], value: PracticeSessionMode.RANDOM },
              { label: modeLabelMap[PracticeSessionMode.CATEGORY], value: PracticeSessionMode.CATEGORY },
              {
                label: modeLabelMap[PracticeSessionMode.KNOWLEDGE],
                value: PracticeSessionMode.KNOWLEDGE,
              },
              { label: modeLabelMap[PracticeSessionMode.REVIEW], value: PracticeSessionMode.REVIEW },
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
          dataSource={sessions}
          loading={isLoading}
          scroll={{ x: 1500 }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (count) => `共 ${count} 条会话`,
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
        width={860}
        title="会话详情"
        destroyOnClose
      >
        <Card loading={detailLoading}>
          {!detail ? null : (
            <>
              <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
                <Descriptions.Item label="会话 ID" span={2}>
                  {detail.id}
                </Descriptions.Item>
                <Descriptions.Item label="学生">{detail.student?.nickname || '-'}</Descriptions.Item>
                <Descriptions.Item label="手机号">{detail.student?.phone || '-'}</Descriptions.Item>
                <Descriptions.Item label="模式">
                  <Tag color={modeColorMap[detail.mode]}>{modeLabelMap[detail.mode] || detail.mode}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag color={statusColorMap[detail.status]}>
                    {statusLabelMap[detail.status] || detail.status}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="答题进度">
                  {detail.answeredCount}/{detail.totalCount}
                </Descriptions.Item>
                <Descriptions.Item label="正确率">
                  {(detail.correctRate * 100).toFixed(1)}%
                </Descriptions.Item>
                <Descriptions.Item label="总耗时">
                  {formatDuration(detail.totalDuration)}
                </Descriptions.Item>
                <Descriptions.Item label="开始时间">
                  {dayjs(detail.startedAt).format('YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
                <Descriptions.Item label="结束时间">
                  {detail.endedAt ? dayjs(detail.endedAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
                </Descriptions.Item>
              </Descriptions>

              <h3 style={{ marginBottom: 12 }}>薄弱知识点</h3>
              {detail.weakKnowledgePoints && detail.weakKnowledgePoints.length > 0 ? (
                <Table<PracticeSessionWeakKnowledgePoint>
                  rowKey="id"
                  size="small"
                  pagination={false}
                  style={{ marginBottom: 16 }}
                  dataSource={detail.weakKnowledgePoints}
                  columns={[
                    {
                      title: '知识点',
                      dataIndex: 'name',
                      key: 'name',
                    },
                    {
                      title: '正确率',
                      dataIndex: 'correctRate',
                      key: 'correctRate',
                      width: 120,
                      render: (value: number) => `${(value * 100).toFixed(1)}%`,
                    },
                    {
                      title: '答对/总数',
                      key: 'correct',
                      width: 140,
                      render: (_: unknown, record: PracticeSessionWeakKnowledgePoint) =>
                        `${record.correct}/${record.total}`,
                    },
                  ]}
                />
              ) : (
                <div style={{ marginBottom: 16, color: '#999' }}>本次会话暂无薄弱知识点。</div>
              )}

              <h3 style={{ marginBottom: 12 }}>题目项</h3>
              <Table
                rowKey="id"
                pagination={false}
                size="small"
                dataSource={detail.items}
                columns={[
                  {
                    title: '序号',
                    dataIndex: 'seq',
                    key: 'seq',
                    width: 70,
                  },
                  {
                    title: '题目 ID',
                    dataIndex: 'questionId',
                    key: 'questionId',
                    render: (questionId: string) => (
                      <Tooltip title={questionId}>
                        <span>{questionId.slice(0, 8)}...</span>
                      </Tooltip>
                    ),
                  },
                  {
                    title: '来源',
                    dataIndex: 'sourceType',
                    key: 'sourceType',
                    width: 120,
                    render: (sourceType: string) => sourceType,
                  },
                  {
                    title: '状态',
                    dataIndex: 'status',
                    key: 'status',
                    width: 120,
                    render: (itemStatus: string) => (
                      <Tag color={itemStatusColorMap[itemStatus] || 'default'}>
                        {itemStatusLabelMap[itemStatus] || itemStatus}
                      </Tag>
                    ),
                  },
                  {
                    title: '作答时间',
                    dataIndex: 'answeredAt',
                    key: 'answeredAt',
                    width: 180,
                    render: (answeredAt: string | null) =>
                      answeredAt ? dayjs(answeredAt).format('YYYY-MM-DD HH:mm:ss') : '-',
                  },
                ]}
              />
            </>
          )}
        </Card>
      </Drawer>
    </div>
  )
}

export default PracticeSessionManagePage
