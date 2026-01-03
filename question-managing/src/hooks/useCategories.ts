/**
 * 分类管理 Hook
 * 
 * 封装分类的查询和 CRUD 操作
 * 
 * 学习要点：
 * 1. 多个查询的组合使用
 * 2. 树形数据的处理
 * 3. 缓存失效的批量处理
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryClient'
import {
  getAllCategories,
  getCategoryTree,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/services/categoryService'
import type { CategoryFormValues, AppError } from '@/types'

/**
 * useCategories Hook
 * 
 * @returns 分类数据和操作方法
 * 
 * 示例：
 * ```tsx
 * function CategoryTree() {
 *   const { treeData, isLoading, create, remove } = useCategories();
 * 
 *   if (isLoading) return <Spin />;
 * 
 *   return (
 *     <Tree
 *       treeData={treeData}
 *       onSelect={(keys) => console.log(keys)}
 *     />
 *   );
 * }
 * ```
 */
export function useCategories() {
  const queryClient = useQueryClient()

  // 查询分类列表（扁平结构）
  const listQuery = useQuery({
    queryKey: queryKeys.categories.lists(),
    queryFn: getAllCategories,
    staleTime: 60 * 1000, // 1分钟
  })

  // 查询分类树（树形结构）
  const treeQuery = useQuery({
    queryKey: queryKeys.categories.tree(),
    queryFn: getCategoryTree,
    staleTime: 60 * 1000,
  })

  // 使所有分类相关缓存失效
  const invalidateCategories = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.categories.all })
  }

  // 创建分类
  const createMutation = useMutation({
    mutationFn: (data: CategoryFormValues) => createCategory(data),
    onSuccess: invalidateCategories,
  })

  // 更新分类
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryFormValues }) =>
      updateCategory(id, data),
    onSuccess: invalidateCategories,
  })

  // 删除分类
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id).then(() => id),
    onSuccess: invalidateCategories,
  })

  return {
    // 数据
    categories: listQuery.data ?? [],
    treeData: treeQuery.data ?? [],
    
    // 状态
    isLoading: listQuery.isLoading || treeQuery.isLoading,
    isError: listQuery.isError || treeQuery.isError,
    error: (listQuery.error || treeQuery.error) as AppError | null,
    
    // 方法
    refetch: () => {
      listQuery.refetch()
      treeQuery.refetch()
    },

    // 创建操作
    create: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error as AppError | null,

    // 更新操作
    update: (id: string, data: CategoryFormValues) =>
      updateMutation.mutateAsync({ id, data }),
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error as AppError | null,

    // 删除操作
    remove: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error as AppError | null,
  }
}
