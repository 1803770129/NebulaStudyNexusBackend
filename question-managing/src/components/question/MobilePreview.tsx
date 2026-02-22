/**
 * 移动端预览组件
 * 
 * 提供手机端和平板端的题目预览功能
 */

import { useState } from 'react';
import { Modal, Radio, Card, Space, Typography, Tag } from 'antd';
import { MobileOutlined, TabletOutlined } from '@ant-design/icons';
import type { QuestionFormValues } from '@/types';
import { QuestionType, DifficultyLevel } from '@/types';
import { convertImageUrls } from '@/utils/imageUrlHelper';
import './MobilePreview.css';

const { Title, Text, Paragraph } = Typography;

interface MobilePreviewProps {
  visible: boolean;
  onClose: () => void;
  formValues: QuestionFormValues;
}

type DeviceType = 'mobile' | 'tablet';

export function MobilePreview({ visible, onClose, formValues }: MobilePreviewProps) {
  const [deviceType, setDeviceType] = useState<DeviceType>('mobile');

  // 设备尺寸配置
  const deviceConfig = {
    mobile: {
      width: 375,
      height: 667,
      label: '手机端',
      icon: <MobileOutlined />,
    },
    tablet: {
      width: 768,
      height: 1024,
      label: '平板端',
      icon: <TabletOutlined />,
    },
  };

  const currentDevice = deviceConfig[deviceType];

  // 获取题目类型标签
  const getTypeLabel = (type: QuestionType) => {
    const typeMap = {
      [QuestionType.SINGLE_CHOICE]: '单选题',
      [QuestionType.MULTIPLE_CHOICE]: '多选题',
      [QuestionType.TRUE_FALSE]: '判断题',
      [QuestionType.SHORT_ANSWER]: '简答题',
      [QuestionType.FILL_BLANK]: '填空题',
    };
    return typeMap[type] || type;
  };

  // 获取难度标签颜色
  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    const colorMap = {
      [DifficultyLevel.EASY]: 'success',
      [DifficultyLevel.MEDIUM]: 'warning',
      [DifficultyLevel.HARD]: 'error',
    };
    return colorMap[difficulty] || 'default';
  };

  // 获取难度标签文本
  const getDifficultyLabel = (difficulty: DifficultyLevel) => {
    const labelMap = {
      [DifficultyLevel.EASY]: '简单',
      [DifficultyLevel.MEDIUM]: '中等',
      [DifficultyLevel.HARD]: '困难',
    };
    return labelMap[difficulty] || difficulty;
  };

  // 是否是选择题
  const choiceQuestionTypes: QuestionType[] = [
    QuestionType.SINGLE_CHOICE,
    QuestionType.MULTIPLE_CHOICE,
    QuestionType.TRUE_FALSE,
  ];
  const isChoiceQuestion = choiceQuestionTypes.includes(formValues.type);

  return (
    <Modal
      title="移动端预览"
      open={visible}
      onCancel={onClose}
      width={currentDevice.width + 100}
      footer={null}
      centered
      className="mobile-preview-modal"
    >
      <div className="mobile-preview-controls">
        <Radio.Group
          value={deviceType}
          onChange={(e) => setDeviceType(e.target.value)}
          buttonStyle="solid"
        >
          <Radio.Button value="mobile">
            <MobileOutlined /> 手机端 (375x667)
          </Radio.Button>
          <Radio.Button value="tablet">
            <TabletOutlined /> 平板端 (768x1024)
          </Radio.Button>
        </Radio.Group>
      </div>

      <div className="mobile-preview-container">
        <div
          className="mobile-preview-device"
          style={{
            width: currentDevice.width,
            height: currentDevice.height,
          }}
        >
          <div className="mobile-preview-content">
            {/* 题目头部 */}
            <div className="question-header">
              <Space>
                <Tag color="blue">{getTypeLabel(formValues.type)}</Tag>
                <Tag color={getDifficultyColor(formValues.difficulty) as any}>
                  {getDifficultyLabel(formValues.difficulty)}
                </Tag>
              </Space>
            </div>

            {/* 题目标题 */}
            {formValues.title && (
              <Title level={5} className="question-title">
                {formValues.title}
              </Title>
            )}

            {/* 题目内容 */}
            <Card className="question-content-card" size="small">
              <div
                className="question-content tiptap"
                dangerouslySetInnerHTML={{ __html: convertImageUrls(formValues.content || '<p>暂无内容</p>') }}
              />
            </Card>

            {/* 选择题选项 */}
            {isChoiceQuestion && formValues.options && formValues.options.length > 0 && (
              <div className="question-options">
                <Text strong>请选择答案：</Text>
                <div className="options-list">
                  {formValues.options.map((option, index) => (
                    <div
                      key={option.id || index}
                      className={`option-item ${option.isCorrect ? 'correct-option' : ''}`}
                    >
                      <div className="option-label">
                        {String.fromCharCode(65 + index)}.
                      </div>
                      <div
                        className="option-content tiptap"
                        dangerouslySetInnerHTML={{
                          __html: convertImageUrls(option.content || `<p>选项 ${String.fromCharCode(65 + index)}</p>`),
                        }}
                      />
                      {option.isCorrect && (
                        <Tag color="success" className="correct-tag">
                          正确答案
                        </Tag>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 非选择题答案 */}
            {!isChoiceQuestion && formValues.answer && (
              <Card className="answer-card" size="small" title="参考答案">
                <Paragraph className="answer-text">{formValues.answer}</Paragraph>
              </Card>
            )}

            {/* 答案解析 */}
            {formValues.explanation && (
              <Card className="explanation-card" size="small" title="答案解析">
                <div
                  className="explanation-content tiptap"
                  dangerouslySetInnerHTML={{ __html: convertImageUrls(formValues.explanation) }}
                />
              </Card>
            )}

            {/* 空状态提示 */}
            {!formValues.content && !formValues.title && (
              <div className="empty-state">
                <Text type="secondary">请先填写题目内容</Text>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
