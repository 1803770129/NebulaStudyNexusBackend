import { Card, Spin, Alert, Button, Space, Tag, Descriptions, Statistic, Row, Col, Modal, Typography, theme } from 'antd'
import { EditOutlined, DeleteOutlined, BookOutlined, FileTextOutlined } from '@ant-design/icons'
import { useKnowledgePoint } from '@/hooks/useKnowledgePoint'
import type { KnowledgePoint } from '@/services/knowledgePointService'
import { convertImageUrls } from '@/utils/imageUrlHelper'
import './KnowledgePointContent.css'

const { Title } = Typography

interface KnowledgePointDetailProps {
  id: string
  onEdit: (kp: KnowledgePoint) => void
  onDelete: (id: string) => Promise<void> | void
}

export function KnowledgePointDetail({ id, onEdit, onDelete }: KnowledgePointDetailProps) {
  const { data: knowledgePoint, isLoading, error } = useKnowledgePoint(id)
  const {
    token: { colorText, colorTextTertiary, colorFillAlter },
  } = theme.useToken()

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  if (error) {
    return (
      <Alert
        message="加载失败"
        description={error.message || '无法加载知识点详情，请稍后重试'}
        type="error"
        showIcon
      />
    )
  }

  if (!knowledgePoint) {
    return (
      <Alert
        message="知识点不存在"
        description="未找到该知识点，可能已被删除"
        type="warning"
        showIcon
      />
    )
  }

  return (
    <div style={{ maxWidth: 1200 }}>
      <Card
        title={
          <Space>
            <BookOutlined />
            <Title level={3} style={{ margin: 0 }}>
              {knowledgePoint.name}
            </Title>
          </Space>
        }
        extra={
          <Space>
            <Button type="primary" icon={<EditOutlined />} onClick={() => onEdit(knowledgePoint)}>
              编辑
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e?.stopPropagation()
                Modal.confirm({
                  title: '确认删除',
                  content: (
                    <div>
                      <p>
                        确定要删除知识点 <strong>{knowledgePoint.name}</strong> 吗？
                      </p>
                      {knowledgePoint.questionCount > 0 && (
                        <Alert
                          message="警告"
                          description={`该知识点下有 ${knowledgePoint.questionCount} 道题目，删除前请先处理相关题目。`}
                          type="warning"
                          showIcon
                          style={{ marginTop: 12 }}
                        />
                      )}
                    </div>
                  ),
                  okText: '确认删除',
                  okType: 'danger',
                  cancelText: '取消',
                  onOk: async () => {
                    await onDelete(id)
                  },
                })
              }}
            >
              删除
            </Button>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Descriptions column={2} bordered>
          <Descriptions.Item label="所属分类">
            {knowledgePoint.category ? (
              <Tag color="blue">{knowledgePoint.category.name}</Tag>
            ) : (
              <span style={{ color: colorTextTertiary }}>未分类</span>
            )}
          </Descriptions.Item>

          <Descriptions.Item label="层级">第 {knowledgePoint.level} 级</Descriptions.Item>

          <Descriptions.Item label="标签" span={2}>
            {knowledgePoint.tags.length > 0 ? (
              <Space wrap>
                {knowledgePoint.tags.map((tag) => (
                  <Tag key={tag.id} color={tag.color}>
                    {tag.name}
                  </Tag>
                ))}
              </Space>
            ) : (
              <span style={{ color: colorTextTertiary }}>无标签</span>
            )}
          </Descriptions.Item>

          <Descriptions.Item label="路径">
            {knowledgePoint.path || <span style={{ color: colorTextTertiary }}>根节点</span>}
          </Descriptions.Item>

          <Descriptions.Item label="关联题目">
            <Tag color={knowledgePoint.questionCount > 0 ? 'green' : 'default'}>
              {knowledgePoint.questionCount} 道题目
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="创建时间">
            {new Date(knowledgePoint.createdAt).toLocaleString('zh-CN')}
          </Descriptions.Item>

          <Descriptions.Item label="更新时间">
            {new Date(knowledgePoint.updatedAt).toLocaleString('zh-CN')}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="统计信息" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="关联题目数量"
              value={knowledgePoint.questionCount}
              suffix="道"
              valueStyle={{ color: '#3f8600' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="层级深度"
              value={knowledgePoint.level}
              suffix="级"
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="标签数量"
              value={knowledgePoint.tags.length}
              suffix="个"
              valueStyle={{ color: '#cf1322' }}
            />
          </Col>
        </Row>
      </Card>

      <Card
        title={
          <Space>
            <FileTextOutlined />
            <span>知识点内容</span>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <div
          className="knowledge-point-content tiptap"
          dangerouslySetInnerHTML={{ __html: convertImageUrls(knowledgePoint.content.rendered) }}
          style={{
            lineHeight: 1.8,
            fontSize: 14,
            color: colorText,
          }}
        />
      </Card>

      {knowledgePoint.extension && (
        <Card
          title={
            <Space>
              <FileTextOutlined />
              <span>拓展内容</span>
            </Space>
          }
        >
          <div
            className="knowledge-point-extension tiptap"
            dangerouslySetInnerHTML={{ __html: convertImageUrls(knowledgePoint.extension.rendered) }}
            style={{
              lineHeight: 1.8,
              fontSize: 14,
              color: colorText,
              backgroundColor: colorFillAlter,
              padding: 16,
              borderRadius: 4,
            }}
          />
        </Card>
      )}
    </div>
  )
}

export default KnowledgePointDetail
