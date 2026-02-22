/**
 * Dashboard home
 */

import { Card, Col, Row, Statistic } from 'antd'
import { CalendarOutlined, FileTextOutlined, FolderOutlined, TagsOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useReviewTaskSummary } from '@/hooks'
import { useCategories } from '@/hooks/useCategories'
import { useQuestions } from '@/hooks/useQuestions'
import { useTags } from '@/hooks/useTags'

export function HomePage() {
  const { total: questionCount } = useQuestions({ page: 1, pageSize: 1 })
  const { categories } = useCategories()
  const { tags } = useTags()
  const { data: reviewSummary } = useReviewTaskSummary(dayjs().format('YYYY-MM-DD'))

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Welcome to Question Manager</h2>

      <Row gutter={16}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Total Questions" value={questionCount} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Categories" value={categories.length} prefix={<FolderOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Tags" value={tags.length} prefix={<TagsOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Today Pending Review"
              value={reviewSummary?.pending ?? 0}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default HomePage
