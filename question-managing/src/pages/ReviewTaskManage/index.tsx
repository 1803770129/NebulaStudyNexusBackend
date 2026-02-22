import { useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Descriptions,
  Progress,
  Space,
  Statistic,
  message,
} from 'antd'
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  SyncOutlined,
} from '@ant-design/icons'
import dayjs, { Dayjs } from 'dayjs'
import { useGenerateReviewTasks, useReviewTaskSummary } from '@/hooks'
import type { ReviewTaskGenerationResult } from '@/types'

const DATE_FORMAT = 'YYYY-MM-DD'

export function ReviewTaskManagePage() {
  const [runDate, setRunDate] = useState(dayjs().format(DATE_FORMAT))
  const [lastGeneration, setLastGeneration] = useState<ReviewTaskGenerationResult | null>(null)

  const { data: summary, isLoading, refetch } = useReviewTaskSummary(runDate)
  const generateMutation = useGenerateReviewTasks()

  const pendingRate = useMemo(() => {
    if (!summary || summary.total === 0) {
      return 0
    }
    return Number(((summary.pending / summary.total) * 100).toFixed(1))
  }, [summary])

  const completedRate = useMemo(() => {
    if (!summary || summary.total === 0) {
      return 0
    }
    return Number(((summary.done / summary.total) * 100).toFixed(1))
  }, [summary])

  const handleRunDateChange = (value: Dayjs | null) => {
    if (!value) {
      return
    }
    setRunDate(value.format(DATE_FORMAT))
  }

  const handleGenerate = async () => {
    try {
      const result = await generateMutation.mutateAsync(runDate)
      setLastGeneration(result)
      message.success(`已重算 ${result.runDate} 的复习任务，共生成 ${result.generatedCount} 条`)
      refetch()
    } catch {
      message.error('复习任务重算失败')
    }
  }

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
        <h2 style={{ margin: 0 }}>复习任务调度</h2>
        <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
          刷新
        </Button>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <DatePicker
            value={dayjs(runDate, DATE_FORMAT)}
            allowClear={false}
            onChange={handleRunDateChange}
          />
          <Button
            type="primary"
            icon={<SyncOutlined />}
            loading={generateMutation.isPending}
            onClick={() => void handleGenerate()}
          >
            一键重算当日任务
          </Button>
        </Space>
      </Card>

      <Card loading={isLoading} style={{ marginBottom: 16 }}>
        <Space size={24} wrap>
          <Statistic
            title="任务总量"
            value={summary?.total ?? 0}
            prefix={<CalendarOutlined />}
          />
          <Statistic
            title="待完成"
            value={summary?.pending ?? 0}
            valueStyle={{ color: '#fa8c16' }}
            prefix={<ClockCircleOutlined />}
          />
          <Statistic
            title="已完成"
            value={summary?.done ?? 0}
            valueStyle={{ color: '#52c41a' }}
            prefix={<CheckCircleOutlined />}
          />
          <div>
            <div style={{ color: '#666', fontSize: 12, marginBottom: 6 }}>待完成占比</div>
            <Progress type="circle" width={64} percent={pendingRate} />
          </div>
          <div>
            <div style={{ color: '#666', fontSize: 12, marginBottom: 6 }}>完成率</div>
            <Progress type="circle" width={64} percent={completedRate} strokeColor="#52c41a" />
          </div>
        </Space>
      </Card>

      {lastGeneration ? (
        <Card title="最近一次重算结果">
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="运行日期">{lastGeneration.runDate}</Descriptions.Item>
            <Descriptions.Item label="触发方式">{lastGeneration.trigger}</Descriptions.Item>
            <Descriptions.Item label="生成数量">{lastGeneration.generatedCount}</Descriptions.Item>
            <Descriptions.Item label="重试次数">{lastGeneration.attempts}</Descriptions.Item>
          </Descriptions>
        </Card>
      ) : (
        <Alert
          type="info"
          showIcon
          message="尚未手动重算"
          description="系统会在启动和定时检查时自动生成当日复习任务，也可在这里手动重算。"
        />
      )}
    </div>
  )
}

export default ReviewTaskManagePage

