/**
 * 知识点详情组件
 * 
 * 显示知识点的完整信息，包括基本信息、内容、拓展内容和统计信息
 * 提供编辑和删除操作
 */

import { Card, Spin, Alert, Button, Space, Tag, Descriptions, Statistic, Row, Col, Modal, Typography } from 'antd'
import { EditOutlined, DeleteOutlined, BookOutlined, FileTextOutlined } from '@ant-design/icons'

const { Title } = Typography
import { useKnowledgePoint } from '@/hooks/useKnowledgePoint'
import type { KnowledgePoint } from '@/services/knowledgePointService'

interface KnowledgePointDetailProps {
  /** 知识点 ID */
  id: string
  /** 编辑回调 */
  onEdit: (kp: KnowledgePoint) => void
  /** 删除回调 */
  onDelete: (id: string) => void
}

/**
 * 知识点详情组件
 * 
 * 使用 useKnowledgePoint hook 加载知识点数据
 * 显示知识点的所有信息，包括基本信息、内容、拓展内容和统计
 * 
 * @example
 * ```tsx
 * <KnowledgePointDetail
 *   id="kp-id"
 *   onEdit={(kp) => setEditingKp(kp)}
 *   onDelete={(id) => handleDelete(id)}
 * />
 * ```
 */
export function KnowledgePointDetail({ id, onEdit, onDelete }: KnowledgePointDetailProps) {
  const { data: knowledgePoint, isLoading, error } = useKnowledgePoint(id)

  // 处理删除操作
  const handleDelete = () => {
    Modal.confirm({
      title: '确认删除',
      content: (
        <div>
          <p>确定要删除知识点 <strong>{knowledgePoint?.name}</strong> 吗？</p>
          {knowledgePoint && knowledgePoint.questionCount > 0 && (
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
      onOk: () => {
        onDelete(id)
      },
    })
  }

  // 加载状态
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  // 错误状态
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

  // 数据不存在
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
      {/* 标题区域 */}
      <Card
        title={
          <Space>
            <BookOutlined />
            <Title level={3} style={{ margin: 0 }}>{knowledgePoint.name}</Title>
          </Space>
        }
        extra={
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => onEdit(knowledgePoint)}
            >
              编辑
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
            >
              删除
            </Button>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        {/* 基本信息 */}
        <Descriptions column={2} bordered>
          <Descriptions.Item label="所属分类">
            {knowledgePoint.category ? (
              <Tag color="blue">{knowledgePoint.category.name}</Tag>
            ) : (
              <span style={{ color: '#999' }}>未分类</span>
            )}
          </Descriptions.Item>
          
          <Descriptions.Item label="层级">
            第 {knowledgePoint.level} 级
          </Descriptions.Item>
          
          <Descriptions.Item label="标签" span={2}>
            {knowledgePoint.tags.length > 0 ? (
              <Space wrap>
                {knowledgePoint.tags.map(tag => (
                  <Tag key={tag.id} color={tag.color}>
                    {tag.name}
                  </Tag>
                ))}
              </Space>
            ) : (
              <span style={{ color: '#999' }}>无标签</span>
            )}
          </Descriptions.Item>
          
          <Descriptions.Item label="路径">
            {knowledgePoint.path || <span style={{ color: '#999' }}>根节点</span>}
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

      {/* 统计信息 */}
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

      {/* 知识点内容 */}
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
          className="knowledge-point-content"
          dangerouslySetInnerHTML={{ __html: knowledgePoint.content.rendered }}
          style={{
            lineHeight: 1.8,
            fontSize: 14,
            color: '#333',
          }}
        />
      </Card>

      {/* 拓展内容（如果存在） */}
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
            className="knowledge-point-extension"
            dangerouslySetInnerHTML={{ __html: knowledgePoint.extension.rendered }}
            style={{
              lineHeight: 1.8,
              fontSize: 14,
              color: '#333',
              backgroundColor: '#f5f5f5',
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
