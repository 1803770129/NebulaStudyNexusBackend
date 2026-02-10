/**
 * 题目表单组件
 */

import { useEffect, useState } from 'react'
import { Form, Input, Select, Button, Space, Divider, Card, Tag } from 'antd'
import { PlusOutlined, MinusCircleOutlined, MobileOutlined, CloseOutlined } from '@ant-design/icons'
import type { Question, Category, Tag as TagType, QuestionFormValues, FormOption } from '@/types'
import { QuestionType, DifficultyLevel, getRawContent } from '@/types'
import { QUESTION_TYPE_OPTIONS, DIFFICULTY_OPTIONS } from '@/constants'
import { generateShortId } from '@/utils/id'
import { RichTextEditor } from '@/components/editor/RichTextEditor'
import { MobilePreview } from './MobilePreview'
import { KnowledgePointSelector } from '@/components/knowledge-point/KnowledgePointSelector'
import { knowledgePointService } from '@/services/knowledgePointService'

const { TextArea } = Input

interface QuestionFormProps {
  initialValues?: Question
  categories: Category[]
  tags: TagType[]
  onSubmit: (values: QuestionFormValues) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function QuestionForm({
  initialValues,
  categories,
  tags,
  onSubmit,
  onCancel,
  loading,
}: QuestionFormProps) {
  const [form] = Form.useForm()
  const questionType = Form.useWatch('type', form)
  const categoryId = Form.useWatch('categoryId', form)
  const knowledgePointIds = Form.useWatch('knowledgePointIds', form)
  const [previewVisible, setPreviewVisible] = useState(false)
  const [knowledgePointNames, setKnowledgePointNames] = useState<Record<string, string>>({})

  // 初始化表单值
  useEffect(() => {
    if (initialValues) {
      // 从 Question 转换为表单值，提取 raw 内容用于编辑
      form.setFieldsValue({
        title: initialValues.title,
        content: getRawContent(initialValues.content),
        type: initialValues.type,
        difficulty: initialValues.difficulty,
        categoryId: initialValues.categoryId,
        tagIds: initialValues.tagIds || [],
        knowledgePointIds: initialValues.knowledgePointIds || [],
        options: initialValues.options?.map(opt => ({
          id: opt.id,
          content: getRawContent(opt.content),
          isCorrect: opt.isCorrect,
        })),
        answer: initialValues.answer,
        explanation: getRawContent(initialValues.explanation),
      })
    } else {
      form.setFieldsValue({
        type: QuestionType.SINGLE_CHOICE,
        difficulty: DifficultyLevel.EASY,
        tagIds: [],
        knowledgePointIds: [],
        options: [
          { id: generateShortId(), content: '', isCorrect: false },
          { id: generateShortId(), content: '', isCorrect: false },
        ],
      })
    }
  }, [initialValues, form])

  // 加载知识点名称（用于显示已选知识点）
  useEffect(() => {
    if (knowledgePointIds && knowledgePointIds.length > 0) {
      const loadKnowledgePointNames = async () => {
        try {
          const kps = await knowledgePointService.findByIds(knowledgePointIds)
          const names: Record<string, string> = {}
          kps.forEach(kp => {
            names[kp.id] = kp.name
          })
          setKnowledgePointNames(names)
        } catch (error) {
          console.error('加载知识点名称失败', error)
        }
      }
      loadKnowledgePointNames()
    } else {
      setKnowledgePointNames({})
    }
  }, [knowledgePointIds])

  // 是否是选择题
  const isChoiceQuestion = [
    QuestionType.SINGLE_CHOICE,
    QuestionType.MULTIPLE_CHOICE,
    QuestionType.TRUE_FALSE,
  ].includes(questionType)

  // 移除知识点
  const handleRemoveKnowledgePoint = (kpId: string) => {
    const currentIds = form.getFieldValue('knowledgePointIds') || []
    const newIds = currentIds.filter((id: string) => id !== kpId)
    form.setFieldsValue({ knowledgePointIds: newIds })
  }

  // 处理提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      
      // 处理选择题的答案
      if (isChoiceQuestion && values.options) {
        const correctOptions = values.options.filter((opt: FormOption) => opt.isCorrect)
        if (questionType === QuestionType.SINGLE_CHOICE) {
          values.answer = correctOptions[0]?.id || ''
        } else if (questionType === QuestionType.MULTIPLE_CHOICE) {
          values.answer = correctOptions.map((opt: FormOption) => opt.id)
        } else if (questionType === QuestionType.TRUE_FALSE) {
          values.answer = correctOptions[0]?.content === '正确' ? 'true' : 'false'
        }
      }

      await onSubmit(values)
    } catch (error) {
      console.error('Form validation failed:', error)
    }
  }

  // 处理题目类型变化
  const handleTypeChange = (type: QuestionType) => {
    if (type === QuestionType.TRUE_FALSE) {
      form.setFieldsValue({
        options: [
          { id: generateShortId(), content: '正确', isCorrect: false },
          { id: generateShortId(), content: '错误', isCorrect: false },
        ],
      })
    } else if (type === QuestionType.SINGLE_CHOICE || type === QuestionType.MULTIPLE_CHOICE) {
      const currentOptions = form.getFieldValue('options')
      if (!currentOptions || currentOptions.length < 2) {
        form.setFieldsValue({
          options: [
            { id: generateShortId(), content: '', isCorrect: false },
            { id: generateShortId(), content: '', isCorrect: false },
          ],
        })
      }
    }
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
    >
      <Form.Item
        name="title"
        label="题目标题"
        rules={[{ required: true, message: '请输入题目标题' }]}
      >
        <Input placeholder="请输入题目标题" maxLength={200} showCount />
      </Form.Item>

      <Form.Item
        name="content"
        label="题目内容"
        rules={[{ required: true, message: '请输入题目内容' }]}
      >
        <RichTextEditor
          placeholder="请输入题目内容/题干"
          height={300}
        />
      </Form.Item>

      <Space size="large" style={{ display: 'flex', flexWrap: 'wrap' }}>
        <Form.Item
          name="type"
          label="题目类型"
          rules={[{ required: true, message: '请选择题目类型' }]}
        >
          <Select
            style={{ width: 150 }}
            options={QUESTION_TYPE_OPTIONS.map(opt => ({
              value: opt.value,
              label: opt.label,
            }))}
            onChange={handleTypeChange}
          />
        </Form.Item>

        <Form.Item
          name="difficulty"
          label="难度等级"
          rules={[{ required: true, message: '请选择难度等级' }]}
        >
          <Select
            style={{ width: 120 }}
            options={DIFFICULTY_OPTIONS.map(opt => ({
              value: opt.value,
              label: opt.label,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="categoryId"
          label="所属分类"
          rules={[{ required: true, message: '请选择分类' }]}
        >
          <Select
            style={{ width: 200 }}
            placeholder="选择分类"
            options={categories.map(c => ({
              value: c.id,
              label: c.name,
            }))}
          />
        </Form.Item>

        <Form.Item name="tagIds" label="标签">
          <Select
            mode="multiple"
            style={{ width: 300 }}
            placeholder="选择标签"
            options={tags.map(t => ({
              value: t.id,
              label: t.name,
            }))}
          />
        </Form.Item>
      </Space>

      {/* 知识点选择器 */}
      <Form.Item
        name="knowledgePointIds"
        label="知识点"
        tooltip="选择该题目考察的知识点，可多选"
        extra="可以选择多个知识点来标记题目考察的知识点"
        dependencies={['categoryId']}
      >
        <KnowledgePointSelector categoryId={categoryId} />
      </Form.Item>

      {/* 显示已选知识点列表 */}
      {knowledgePointIds && knowledgePointIds.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            {knowledgePointIds.map((kpId: string) => (
              <Tag
                key={kpId}
                closable
                onClose={() => handleRemoveKnowledgePoint(kpId)}
                icon={<CloseOutlined />}
              >
                {knowledgePointNames[kpId] || kpId}
              </Tag>
            ))}
          </Space>
        </div>
      )}

      {/* 选择题选项 */}
      {isChoiceQuestion && (
        <Card title="选项设置" size="small" style={{ marginBottom: 16 }}>
          <Form.List name="options">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }, index) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'isCorrect']}
                      valuePropName="checked"
                      style={{ marginBottom: 0 }}
                    >
                      <Select
                        style={{ width: 100 }}
                        options={[
                          { value: true, label: '✓ 正确' },
                          { value: false, label: '✗ 错误' },
                        ]}
                        onChange={(value) => {
                          // 单选题只能有一个正确答案
                          if (value && questionType === QuestionType.SINGLE_CHOICE) {
                            const options = form.getFieldValue('options')
                            const newOptions = options.map((opt: FormOption, i: number) => ({
                              ...opt,
                              isCorrect: i === index,
                            }))
                            form.setFieldsValue({ options: newOptions })
                          }
                        }}
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'content']}
                      rules={[{ required: true, message: '请输入选项内容' }]}
                      style={{ marginBottom: 0, flex: 1, minWidth: 300 }}
                    >
                      {questionType === QuestionType.TRUE_FALSE ? (
                        <Input
                          placeholder={`选项 ${String.fromCharCode(65 + index)}`}
                          disabled
                        />
                      ) : (
                        <RichTextEditor
                          placeholder={`选项 ${String.fromCharCode(65 + index)}`}
                          height={80}
                          simple
                        />
                      )}
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'id']} hidden>
                      <Input />
                    </Form.Item>
                    {questionType !== QuestionType.TRUE_FALSE && fields.length > 2 && (
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    )}
                  </Space>
                ))}
                {questionType !== QuestionType.TRUE_FALSE && fields.length < 10 && (
                  <Button
                    type="dashed"
                    onClick={() => add({ id: generateShortId(), content: '', isCorrect: false })}
                    block
                    icon={<PlusOutlined />}
                  >
                    添加选项
                  </Button>
                )}
              </>
            )}
          </Form.List>
        </Card>
      )}

      {/* 非选择题答案 */}
      {!isChoiceQuestion && (
        <Form.Item
          name="answer"
          label="参考答案"
          rules={[{ required: true, message: '请输入参考答案' }]}
        >
          <TextArea
            placeholder="请输入参考答案"
            rows={3}
          />
        </Form.Item>
      )}

      <Form.Item name="explanation" label="答案解析">
        <RichTextEditor
          placeholder="请输入答案解析（可选）"
          height={250}
        />
      </Form.Item>

      <Divider />

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {initialValues ? '保存修改' : '创建题目'}
          </Button>
          <Button onClick={onCancel}>取消</Button>
          <Button 
            icon={<MobileOutlined />} 
            onClick={() => setPreviewVisible(true)}
          >
            移动端预览
          </Button>
        </Space>
      </Form.Item>

      {/* 移动端预览弹窗 */}
      <MobilePreview
        visible={previewVisible}
        onClose={() => setPreviewVisible(false)}
        formValues={form.getFieldsValue()}
      />
    </Form>
  )
}
