import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Alert,
  Button,
  Card,
  Cascader,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Radio,
  Select,
  Space,
  Table,
  Tag,
  message,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { DeleteOutlined, PlusCircleOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { queryKeys } from '@/lib/queryClient'
import { DIFFICULTY_LABELS, QUESTION_TYPE_LABELS } from '@/constants'
import { KnowledgePointSelector } from '@/components/knowledge-point/KnowledgePointSelector'
import { useCategories } from '@/hooks/useCategories'
import { useCreateExamPaper, useExamPapers, usePublishExamPaper } from '@/hooks'
import { getQuestions } from '@/services/questionService'
import { DifficultyLevel, ExamPaperStatus, QuestionType } from '@/types'
import type {
  CategoryTreeNode,
  CreateExamPaperPayload,
  DifficultyLevel as DifficultyLevelType,
  ExamPaper,
  Question,
  QuestionType as QuestionTypeType,
} from '@/types'

interface CreateExamPaperFormValues {
  title: string
  description?: string
  durationMinutes: number
}

type QuestionSourceMode = 'category' | 'knowledge'

interface SelectedQuestionItem {
  questionId: string
  title: string
  type: QuestionTypeType
  difficulty: DifficultyLevelType
  score: number
}

interface CategoryCascaderOption {
  value: string
  label: string
  children?: CategoryCascaderOption[]
}

const statusLabelMap: Record<string, string> = {
  [ExamPaperStatus.DRAFT]: '草稿',
  [ExamPaperStatus.PUBLISHED]: '已发布',
}

const statusColorMap: Record<string, string> = {
  [ExamPaperStatus.DRAFT]: 'default',
  [ExamPaperStatus.PUBLISHED]: 'success',
}

const questionTypeOptions = [
  { label: QUESTION_TYPE_LABELS[QuestionType.SINGLE_CHOICE], value: QuestionType.SINGLE_CHOICE },
  { label: QUESTION_TYPE_LABELS[QuestionType.MULTIPLE_CHOICE], value: QuestionType.MULTIPLE_CHOICE },
  { label: QUESTION_TYPE_LABELS[QuestionType.TRUE_FALSE], value: QuestionType.TRUE_FALSE },
  { label: QUESTION_TYPE_LABELS[QuestionType.FILL_BLANK], value: QuestionType.FILL_BLANK },
  { label: QUESTION_TYPE_LABELS[QuestionType.SHORT_ANSWER], value: QuestionType.SHORT_ANSWER },
]

const difficultyOptions = [
  { label: DIFFICULTY_LABELS[DifficultyLevel.EASY], value: DifficultyLevel.EASY },
  { label: DIFFICULTY_LABELS[DifficultyLevel.MEDIUM], value: DifficultyLevel.MEDIUM },
  { label: DIFFICULTY_LABELS[DifficultyLevel.HARD], value: DifficultyLevel.HARD },
]

function buildCategoryCascaderOptions(treeData: CategoryTreeNode[]): CategoryCascaderOption[] {
  return treeData.map((node) => ({
    value: String(node.key),
    label: node.title,
    children: node.children?.length ? buildCategoryCascaderOptions(node.children) : undefined,
  }))
}

function getDifficultyColor(difficulty: DifficultyLevelType): string {
  if (difficulty === DifficultyLevel.EASY) {
    return 'success'
  }
  if (difficulty === DifficultyLevel.MEDIUM) {
    return 'warning'
  }
  return 'error'
}

export function ExamPaperManagePage() {
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<ExamPaperStatus | undefined>(undefined)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [createOpen, setCreateOpen] = useState(false)
  const [createForm] = Form.useForm<CreateExamPaperFormValues>()

  const [questionSourceMode, setQuestionSourceMode] = useState<QuestionSourceMode>('category')
  const [selectedCategoryPath, setSelectedCategoryPath] = useState<string[]>([])
  const [selectedKnowledgePointIds, setSelectedKnowledgePointIds] = useState<string[]>([])
  const [questionKeyword, setQuestionKeyword] = useState('')
  const [questionTypeFilter, setQuestionTypeFilter] = useState<QuestionTypeType | undefined>(undefined)
  const [questionDifficultyFilter, setQuestionDifficultyFilter] =
    useState<DifficultyLevelType | undefined>(undefined)
  const [questionPage, setQuestionPage] = useState(1)
  const [questionPageSize, setQuestionPageSize] = useState(10)
  const [selectedQuestions, setSelectedQuestions] = useState<SelectedQuestionItem[]>([])

  const { papers, total, isLoading, refetch } = useExamPapers({
    page,
    pageSize,
    keyword,
    status,
  })
  const { treeData: categoryTree, isLoading: isCategoryTreeLoading } = useCategories()

  const createMutation = useCreateExamPaper()
  const publishMutation = usePublishExamPaper()

  const categoryOptions = useMemo(() => buildCategoryCascaderOptions(categoryTree), [categoryTree])

  const selectedCategoryId = selectedCategoryPath[selectedCategoryPath.length - 1]
  const canLoadQuestionPool =
    questionSourceMode === 'category'
      ? Boolean(selectedCategoryId)
      : selectedKnowledgePointIds.length > 0

  const questionFilters = useMemo(
    () => ({
      page: questionPage,
      pageSize: questionPageSize,
      keyword: questionKeyword.trim() || undefined,
      categoryId: questionSourceMode === 'category' ? selectedCategoryId : undefined,
      knowledgePointIds:
        questionSourceMode === 'knowledge' && selectedKnowledgePointIds.length > 0
          ? selectedKnowledgePointIds
          : undefined,
      type: questionTypeFilter,
      difficulty: questionDifficultyFilter,
    }),
    [
      questionPage,
      questionPageSize,
      questionKeyword,
      questionSourceMode,
      selectedCategoryId,
      selectedKnowledgePointIds,
      questionTypeFilter,
      questionDifficultyFilter,
    ]
  )

  const { data: questionPoolResult, isLoading: isQuestionPoolLoading } = useQuery({
    queryKey: queryKeys.questions.list(questionFilters as unknown as Record<string, unknown>),
    queryFn: () => getQuestions(questionFilters),
    enabled: createOpen && canLoadQuestionPool,
  })

  const questionPool = canLoadQuestionPool ? questionPoolResult?.data ?? [] : []
  const questionPoolTotal = canLoadQuestionPool ? questionPoolResult?.total ?? 0 : 0

  const selectedQuestionIdSet = useMemo(
    () => new Set(selectedQuestions.map((item) => item.questionId)),
    [selectedQuestions]
  )

  const selectedTotalScore = useMemo(
    () => selectedQuestions.reduce((sum, item) => sum + item.score, 0),
    [selectedQuestions]
  )

  const handleSearch = () => {
    setPage(1)
  }

  const handleReset = () => {
    setKeyword('')
    setStatus(undefined)
    setPage(1)
  }

  const resetQuestionFilters = () => {
    setQuestionKeyword('')
    setQuestionTypeFilter(undefined)
    setQuestionDifficultyFilter(undefined)
    setQuestionPage(1)
  }

  const resetCreateModalState = () => {
    createForm.resetFields()
    createForm.setFieldsValue({ durationMinutes: 60 })
    setQuestionSourceMode('category')
    setSelectedCategoryPath([])
    setSelectedKnowledgePointIds([])
    resetQuestionFilters()
    setQuestionPageSize(10)
    setSelectedQuestions([])
  }

  const openCreateModal = () => {
    setCreateOpen(true)
    resetCreateModalState()
  }

  const closeCreateModal = () => {
    setCreateOpen(false)
    resetCreateModalState()
  }

  const handleCreate = async () => {
    try {
      const values = await createForm.validateFields()

      if (selectedQuestions.length === 0) {
        message.error('请先至少添加一道题目')
        return
      }

      if (selectedQuestions.some((item) => !Number.isFinite(item.score) || item.score <= 0)) {
        message.error('题目分值必须大于 0')
        return
      }

      const payload: CreateExamPaperPayload = {
        title: values.title.trim(),
        description: values.description?.trim() || undefined,
        durationMinutes: values.durationMinutes,
        items: selectedQuestions.map((item) => ({
          questionId: item.questionId,
          score: item.score,
        })),
      }

      await createMutation.mutateAsync(payload)
      message.success('试卷创建成功')
      closeCreateModal()
      refetch()
    } catch {
      message.error('试卷创建失败')
    }
  }

  const handlePublish = async (paperId: string) => {
    try {
      await publishMutation.mutateAsync(paperId)
      message.success('试卷发布成功')
      refetch()
    } catch {
      message.error('试卷发布失败')
    }
  }

  const handleSourceModeChange = (nextMode: QuestionSourceMode) => {
    setQuestionSourceMode(nextMode)
    setQuestionPage(1)
    if (nextMode === 'category') {
      setSelectedKnowledgePointIds([])
    } else {
      setSelectedCategoryPath([])
    }
  }

  const handleAddQuestion = (question: Question) => {
    if (selectedQuestionIdSet.has(question.id)) {
      message.warning('该题目已添加')
      return
    }

    setSelectedQuestions((prev) => [
      ...prev,
      {
        questionId: question.id,
        title: question.title,
        type: question.type,
        difficulty: question.difficulty,
        score: 5,
      },
    ])
  }

  const handleRemoveQuestion = (questionId: string) => {
    setSelectedQuestions((prev) => prev.filter((item) => item.questionId !== questionId))
  }

  const handleScoreChange = (questionId: string, score: number | null) => {
    if (typeof score !== 'number') {
      return
    }

    setSelectedQuestions((prev) =>
      prev.map((item) => (item.questionId === questionId ? { ...item, score } : item))
    )
  }

  const paperColumns: ColumnsType<ExamPaper> = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (value: string) => (
        <Tag color={statusColorMap[value] || 'default'}>{statusLabelMap[value] || value}</Tag>
      ),
    },
    {
      title: '题目数',
      dataIndex: 'itemCount',
      key: 'itemCount',
      width: 100,
    },
    {
      title: '时长(分钟)',
      dataIndex: 'durationMinutes',
      key: 'durationMinutes',
      width: 120,
    },
    {
      title: '总分',
      dataIndex: 'totalScore',
      key: 'totalScore',
      width: 90,
    },
    {
      title: '发布时间',
      dataIndex: 'publishedAt',
      key: 'publishedAt',
      width: 170,
      render: (value: string | null) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 130,
      render: (_, record) =>
        record.status === ExamPaperStatus.DRAFT ? (
          <Popconfirm
            title="确定发布这份试卷吗？"
            okText="发布"
            cancelText="取消"
            onConfirm={() => void handlePublish(record.id)}
          >
            <Button type="link" size="small" loading={publishMutation.isPending}>
              发布
            </Button>
          </Popconfirm>
        ) : (
          <span style={{ color: '#999' }}>-</span>
        ),
    },
  ]

  const questionPoolColumns: ColumnsType<Question> = [
    {
      title: '题目标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '题型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (value: QuestionTypeType) => <Tag>{QUESTION_TYPE_LABELS[value]}</Tag>,
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      width: 100,
      render: (value: DifficultyLevelType) => (
        <Tag color={getDifficultyColor(value)}>{DIFFICULTY_LABELS[value]}</Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 90,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<PlusCircleOutlined />}
          disabled={selectedQuestionIdSet.has(record.id)}
          onClick={() => handleAddQuestion(record)}
        >
          添加
        </Button>
      ),
    },
  ]

  const selectedQuestionColumns: ColumnsType<SelectedQuestionItem> = [
    {
      title: '题目标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '题型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (value: QuestionTypeType) => <Tag>{QUESTION_TYPE_LABELS[value]}</Tag>,
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      width: 100,
      render: (value: DifficultyLevelType) => (
        <Tag color={getDifficultyColor(value)}>{DIFFICULTY_LABELS[value]}</Tag>
      ),
    },
    {
      title: '分值',
      key: 'score',
      width: 140,
      render: (_, record) => (
        <InputNumber
          min={1}
          max={100}
          value={record.score}
          style={{ width: 100 }}
          onChange={(value) => handleScoreChange(record.questionId, value)}
        />
      ),
    },
    {
      title: '操作',
      key: 'operation',
      width: 90,
      render: (_, record) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveQuestion(record.questionId)}
        >
          移除
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
        <h2 style={{ margin: 0 }}>试卷管理</h2>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            刷新
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            新建试卷
          </Button>
        </Space>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            allowClear
            style={{ width: 240 }}
            placeholder="搜索试卷标题"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            onPressEnter={handleSearch}
          />
          <Select<ExamPaperStatus | undefined>
            allowClear
            style={{ width: 160 }}
            placeholder="状态"
            value={status}
            onChange={(value) => {
              setStatus(value)
              setPage(1)
            }}
            options={[
              { label: statusLabelMap[ExamPaperStatus.DRAFT], value: ExamPaperStatus.DRAFT },
              {
                label: statusLabelMap[ExamPaperStatus.PUBLISHED],
                value: ExamPaperStatus.PUBLISHED,
              },
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
          columns={paperColumns}
          dataSource={papers}
          loading={isLoading}
          scroll={{ x: 1100 }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (count) => `共 ${count} 份试卷`,
            onChange: (nextPage, nextPageSize) => {
              setPage(nextPage)
              setPageSize(nextPageSize)
            },
          }}
        />
      </Card>

      <Modal
        open={createOpen}
        title="新建试卷"
        destroyOnClose
        width={1000}
        confirmLoading={createMutation.isPending}
        onCancel={closeCreateModal}
        onOk={() => void handleCreate()}
      >
        <Form
          form={createForm}
          layout="vertical"
          initialValues={{
            durationMinutes: 60,
          }}
        >
          <Form.Item label="标题" name="title" rules={[{ required: true, message: '请输入试卷标题' }]}>
            <Input maxLength={200} />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={3} maxLength={2000} />
          </Form.Item>
          <Form.Item
            label="考试时长(分钟)"
            name="durationMinutes"
            rules={[{ required: true, message: '请输入考试时长' }]}
          >
            <InputNumber min={1} max={300} style={{ width: 240 }} />
          </Form.Item>
        </Form>

        <Divider style={{ margin: '16px 0' }} />

        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <Radio.Group
            value={questionSourceMode}
            onChange={(event) => handleSourceModeChange(event.target.value as QuestionSourceMode)}
            optionType="button"
            buttonStyle="solid"
            options={[
              { label: '按分类筛选题目', value: 'category' },
              { label: '按知识点筛选题目', value: 'knowledge' },
            ]}
          />

          {questionSourceMode === 'category' ? (
            <Cascader
              options={categoryOptions}
              value={selectedCategoryPath}
              disabled={isCategoryTreeLoading}
              placeholder={isCategoryTreeLoading ? '分类加载中...' : '请选择分类路径'}
              changeOnSelect
              showSearch
              style={{ width: '100%' }}
              onChange={(values) => {
                setSelectedCategoryPath((values || []).map((value) => String(value)))
                setQuestionPage(1)
              }}
            />
          ) : (
            <KnowledgePointSelector
              value={selectedKnowledgePointIds}
              onChange={(value) => {
                setSelectedKnowledgePointIds(value)
                setQuestionPage(1)
              }}
            />
          )}

          <Space wrap>
            <Input
              allowClear
              style={{ width: 240 }}
              placeholder="搜索题目标题"
              value={questionKeyword}
              onChange={(event) => {
                setQuestionKeyword(event.target.value)
                setQuestionPage(1)
              }}
            />
            <Select<QuestionTypeType | undefined>
              allowClear
              style={{ width: 160 }}
              placeholder="题型"
              value={questionTypeFilter}
              options={questionTypeOptions}
              onChange={(value) => {
                setQuestionTypeFilter(value)
                setQuestionPage(1)
              }}
            />
            <Select<DifficultyLevelType | undefined>
              allowClear
              style={{ width: 140 }}
              placeholder="难度"
              value={questionDifficultyFilter}
              options={difficultyOptions}
              onChange={(value) => {
                setQuestionDifficultyFilter(value)
                setQuestionPage(1)
              }}
            />
            <Button onClick={resetQuestionFilters}>清空附加筛选</Button>
          </Space>

          {!canLoadQuestionPool ? (
            <Alert
              type="info"
              showIcon
              message={
                questionSourceMode === 'category'
                  ? '请先逐级选择分类，再从候选列表中添加题目'
                  : '请先选择知识点，再从候选列表中添加题目'
              }
            />
          ) : (
            <Table
              rowKey="id"
              size="small"
              columns={questionPoolColumns}
              dataSource={questionPool}
              loading={isQuestionPoolLoading}
              scroll={{ x: 760 }}
              pagination={{
                current: questionPage,
                pageSize: questionPageSize,
                total: questionPoolTotal,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (count) => `共 ${count} 道题`,
                onChange: (nextPage, nextPageSize) => {
                  setQuestionPage(nextPage)
                  setQuestionPageSize(nextPageSize)
                },
              }}
              locale={{ emptyText: '暂无符合筛选条件的题目' }}
            />
          )}

          <Divider style={{ margin: '8px 0' }} />

          <Space>
            <Tag color="blue">已选题目：{selectedQuestions.length} 道</Tag>
            <Tag color="green">合计分值：{selectedTotalScore}</Tag>
          </Space>

          <Table
            rowKey="questionId"
            size="small"
            columns={selectedQuestionColumns}
            dataSource={selectedQuestions}
            pagination={false}
            scroll={{ x: 760 }}
            locale={{ emptyText: '尚未添加题目' }}
          />
        </Space>
      </Modal>
    </div>
  )
}

export default ExamPaperManagePage
