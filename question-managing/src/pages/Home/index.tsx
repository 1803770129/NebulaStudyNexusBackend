/**
 * 首页
 */

import { Card, Row, Col, Statistic } from 'antd'
import {
  FileTextOutlined,
  FolderOutlined,
  TagsOutlined,
} from '@ant-design/icons'
import { useQuestions } from '@/hooks/useQuestions'
import { useCategories } from '@/hooks/useCategories'
import { useTags } from '@/hooks/useTags'

export function HomePage() {
  const { total: questionCount } = useQuestions({ page: 1, pageSize: 1 })
  const { categories } = useCategories()
  const { tags } = useTags()

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>欢迎使用题目管理系统</h2>
      
      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="题目总数"
              value={questionCount}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="分类数量"
              value={categories.length}
              prefix={<FolderOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="标签数量"
              value={tags.length}
              prefix={<TagsOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default HomePage
