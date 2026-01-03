/**
 * 标签管理 Hook
 * 
 * 封装标签的查询和 CRUD 操作
 * 
 * 学习要点：
 * 1. 简单 CRUD Hook 的实现模式
 * 2. 关联数据的缓存失效
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryClient'
import {
  getAllTags,
  createTag,
  updateTag,
  deleteTag,
} from '@/services/tagService'
import type { TagFormValues, AppError } from '@/types'

/**
 * useTags Hook
 * 
 * @returns 标签数据和操作方法
 * 
 * 示例：
 * ```tsx
 * function TagList() {
 *   const { tags, isLoading, create, remove } = useTags();
 * 
 *   if (isLoading) return <Spin />;
 * 
 *   return (
 *     <Space>
 *       {tags.map(tag => (
 *         <Tag key={tag.id} color={tag.color}>
 *           {tag.name}
 *         </Tag>
 *       ))}
 *     </Space>
 *   );
 * }
 * ```
 */
export function useTags() {
  const queryClient = useQueryClient()

  // 查询标签列表
  const query = useQuery({
    queryKey: queryKeys.tags.lists(),
    queryFn: getAllTags,
    staleTime: 60 * 1000, // 1分钟
  })

  // 使标签和题目相关缓存失效
  // 因为删除标签会影响题目的标签列表
  const invalidateTags = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.tags.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.questions.all })
  }

  // 创建标签
  const createMutation = useMutation({
    mutationFn: (data: TagFormValues) => createTag(data),
    onSuccess: invalidateTags,
  })

  // 更新标签
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TagFormValues }) =>
      updateTag(id, data),
    onSuccess: invalidateTags,
  })

  // 删除标签
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTag(id).then(() => id),
    onSuccess: invalidateTags,
  })

  return {
    // 数据
    tags: query.data ?? [],
    
    // 状态
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as AppError | null,
    
    // 方法
    refetch: query.refetch,

    // 创建操作
    create: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error as AppError | null,

    // 更新操作
    update: (id: string, data: TagFormValues) =>
      updateMutation.mutateAsync({ id, data }),
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error as AppError | null,

    // 删除操作
    remove: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error as AppError | null,
  }
}
