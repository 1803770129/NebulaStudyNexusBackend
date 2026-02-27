/**
 * 题目列表页面
 * 
 * 展示题目列表，支持搜索、筛选和分页
 */

import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Button, message, Modal } from 'antd'
import { PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { QuestionTable } from '@/components/question/QuestionTable'
import { QuestionFilter } from '@/components/question/QuestionFilter'
import { useQuestions } from '@/hooks/useQuestions'
import { useQuestion } from '@/hooks/useQuestion'
import { useCategories } from '@/hooks/useCategories'
import { useFilterStore } from '@/stores'
import type { QuestionStatus } from '@/types'

export function QuestionListPage() {
  const navigate = useNavigate()
  const { questions, total, isLoading } = useQuestions()
  const { remove, changeStatus, isDeleting, isChangingStatus } = useQuestion()
  const { categories } = useCategories()
  const { questionFilters, setQuestionFilters, resetQuestionFilters } = useFilterStore()
  const [changingStatusId, setChangingStatusId] = useState<string | null>(null)

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
        } catch (error: any) {
          message.error(error?.message || '删除失败')
        }
      },
    })
  }

  // 处理状态流变更
  const handleChangeStatus = async (id: string, targetStatus: QuestionStatus) => {
    try {
      setChangingStatusId(id)
      await changeStatus(id, targetStatus)
      message.success('状态更新成功')
    } catch (error: any) {
      message.error(error?.message || '状态更新失败')
    } finally {
      setChangingStatusId(null)
    }
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
        loading={isLoading || isDeleting || isChangingStatus}
        pagination={{
          current: questionFilters.page,
          pageSize: questionFilters.pageSize,
          total,
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onChangeStatus={handleChangeStatus}
        changingStatusId={changingStatusId}
        onPageChange={handlePageChange}
      />
    </div>
  )
}

export default QuestionListPage
