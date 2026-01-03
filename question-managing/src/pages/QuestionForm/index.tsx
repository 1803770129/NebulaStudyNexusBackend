/**
 * 题目表单页面
 * 
 * 用于创建和编辑题目
 */

import { useNavigate, useParams } from 'react-router-dom'
import { Card, message, Spin } from 'antd'
import { QuestionForm } from '@/components/question/QuestionForm'
import { useQuestion } from '@/hooks/useQuestion'
import { useCategories } from '@/hooks/useCategories'
import { useTags } from '@/hooks/useTags'
import type { QuestionFormValues } from '@/types'

export function QuestionFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id

  const { question, isLoading: isLoadingQuestion, create, update, isCreating, isUpdating } = useQuestion(id)
  const { categories, isLoading: isLoadingCategories } = useCategories()
  const { tags, isLoading: isLoadingTags } = useTags()

  const isLoading = isLoadingQuestion || isLoadingCategories || isLoadingTags
  const isSaving = isCreating || isUpdating

  // 处理表单提交
  const handleSubmit = async (values: QuestionFormValues) => {
    try {
      if (isEdit) {
        await update(values)
        message.success('更新成功')
      } else {
        await create(values)
        message.success('创建成功')
      }
      navigate('/questions')
    } catch (error) {
      message.error(isEdit ? '更新失败' : '创建失败')
    }
  }

  // 处理取消
  const handleCancel = () => {
    navigate('/questions')
  }

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>{isEdit ? '编辑题目' : '新建题目'}</h2>
      
      <Card>
        <QuestionForm
          initialValues={question ?? undefined}
          categories={categories}
          tags={tags}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={isSaving}
        />
      </Card>
    </div>
  )
}

export default QuestionFormPage
