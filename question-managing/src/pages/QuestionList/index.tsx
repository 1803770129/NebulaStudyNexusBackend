/**
 * 题目列表页面
 * 
 * 展示题目列表，支持搜索、筛选和分页
 */

import { useNavigate } from 'react-router-dom'
import { Button, message, Modal } from 'antd'
import { PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { QuestionTable } from '@/components/question/QuestionTable'
import { QuestionFilter } from '@/components/question/QuestionFilter'
import { useQuestions } from '@/hooks/useQuestions'
import { useQuestion } from '@/hooks/useQuestion'
import { useCategories } from '@/hooks/useCategories'
import { useFilterStore } from '@/stores'

export function QuestionListPage() {
  const navigate = useNavigate()
  const { questions, total, isLoading } = useQuestions()
  const { remove, isDeleting } = useQuestion()
  const { categories } = useCategories()
  const { questionFilters, setQuestionFilters, resetQuestionFilters } = useFilterStore()

  // 处理编辑
  const handleEdit = (id: string) => {
    navigate(`/questions/edit/${id}`)
  }

  // 处理删除
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除这道题目吗？此操作不可恢复。',
      okText: '确认',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          await remove(id)
          message.success('删除成功')
        } catch (error) {
          message.error('删除失败')
        }
      },
    })
  }

  // 处理分页变化
  const handlePageChange = (page: number, pageSize: number) => {
    setQuestionFilters({ page, pageSize })
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>题目管理</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/questions/create')}
        >
          新建题目
        </Button>
      </div>

      {/* 筛选区域 */}
      <QuestionFilter
        filters={questionFilters}
        categories={categories}
        onFilterChange={setQuestionFilters}
        onSearch={(keyword) => setQuestionFilters({ keyword })}
        onReset={resetQuestionFilters}
      />

      {/* 题目列表 */}
      <QuestionTable
        questions={questions}
        loading={isLoading || isDeleting}
        pagination={{
          current: questionFilters.page,
          pageSize: questionFilters.pageSize,
          total,
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPageChange={handlePageChange}
      />
    </div>
  )
}

export default QuestionListPage
