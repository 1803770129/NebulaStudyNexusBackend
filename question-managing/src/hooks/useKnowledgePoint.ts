/**
 * 知识点管理 Hook
 * 
 * 封装知识点的查询和 CRUD 操作
 * 
 * 学习要点：
 * 1. 树形数据的查询和缓存策略
 * 2. 多个查询的组合使用
 * 3. 缓存失效的批量处理
 * 4. 关联数据的同步更新
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryClient'
import {
  knowledgePointService,
  type KnowledgePoint,
  type CreateKnowledgePointDto,
  type QueryKnowledgePointDto,
  type PaginationQueryDto,
} from '@/services/knowledgePointService'
import type { AppError } from '@/types'

/**
 * useKnowledgePointList Hook
 * 
 * 查询知识点列表（支持分页、搜索、筛选）
 * 
 * @param query - 查询参数
 * @returns 知识点列表数据和状态
 * 
 * 示例：
 * ```tsx
 * function KnowledgePointList() {
 *   const { data, isLoading, refetch } = useKnowledgePointList({
 *     page: 1,
 *     limit: 20,
 *     search: '二叉树',
 *     categoryId: 'xxx'
 *   });
 * 
 *   if (isLoading) return <Spin />;
 * 
 *   return (
 *     <List
 *       dataSource={data?.data}
 *       renderItem={item => <List.Item>{item.name}</List.Item>}
 *     />
 *   );
 * }
 * ```
 */
export function useKnowledgePointList(query: QueryKnowledgePointDto = {}) {
  return useQuery({
    queryKey: queryKeys.knowledgePoints.list(query as unknown as Record<string, unknown>),
    queryFn: () => knowledgePointService.getList(query),
    staleTime: 2 * 60 * 1000, // 2分钟
    gcTime: 5 * 60 * 1000, // 5分钟
  })
}

/**
 * useKnowledgePointTree Hook
 * 
 * 查询知识点树形结构（支持按分类筛选）
 * 配置了较长的缓存时间，因为树形结构变化较少
 * 
 * @param categoryId - 可选的分类ID，用于筛选特定分类的知识点树
 * @returns 知识点树数据和状态
 * 
 * 示例：
 * ```tsx
 * function KnowledgePointTree() {
 *   const { data: treeData, isLoading } = useKnowledgePointTree();
 * 
 *   if (isLoading) return <Spin />;
 * 
 *   return (
 *     <Tree
 *       treeData={convertToAntdTree(treeData)}
 *       onSelect={(keys) => console.log(keys)}
 *     />
 *   );
 * }
 * 
 * // 按分类筛选
 * function CategoryKnowledgePointTree({ categoryId }: { categoryId: string }) {
 *   const { data: treeData } = useKnowledgePointTree(categoryId);
 *   // ...
 * }
 * ```
 */
export function useKnowledgePointTree(categoryId?: string) {
  return useQuery({
    queryKey: queryKeys.knowledgePoints.tree(categoryId),
    queryFn: () => knowledgePointService.getTree(categoryId),
    staleTime: 5 * 60 * 1000, // 5分钟 - 树形结构变化较少
    gcTime: 10 * 60 * 1000, // 10分钟
  })
}

/**
 * useKnowledgePoint Hook
 * 
 * 查询单个知识点详情
 * 
 * @param id - 知识点 ID，如果不传则不查询
 * @returns 知识点数据和状态
 * 
 * 示例：
 * ```tsx
 * function KnowledgePointDetail({ id }: { id: string }) {
 *   const { data: knowledgePoint, isLoading, error } = useKnowledgePoint(id);
 * 
 *   if (isLoading) return <Spin />;
 *   if (error) return <Alert message="加载失败" type="error" />;
 *   if (!knowledgePoint) return null;
 * 
 *   return (
 *     <Card title={knowledgePoint.name}>
 *       <div dangerouslySetInnerHTML={{ __html: knowledgePoint.content.rendered }} />
 *     </Card>
 *   );
 * }
 * ```
 */
export function useKnowledgePoint(id?: string) {
  return useQuery({
    queryKey: queryKeys.knowledgePoints.detail(id ?? ''),
    queryFn: () => knowledgePointService.getById(id!),
    enabled: !!id, // 只有传入 id 时才查询
    staleTime: 60 * 1000, // 1分钟
    retry: 2,
  })
}

/**
 * useKnowledgePointQuestions Hook
 * 
 * 查询知识点关联的题目列表
 * 
 * @param id - 知识点 ID
 * @param query - 分页查询参数
 * @returns 题目列表数据和状态
 * 
 * 示例：
 * ```tsx
 * function KnowledgePointQuestions({ id }: { id: string }) {
 *   const { data, isLoading } = useKnowledgePointQuestions(id, {
 *     page: 1,
 *     limit: 20
 *   });
 * 
 *   if (isLoading) return <Spin />;
 * 
 *   return (
 *     <List
 *       dataSource={data?.data}
 *       renderItem={item => <List.Item>{item.title}</List.Item>}
 *     />
 *   );
 * }
 * ```
 */
export function useKnowledgePointQuestions(
  id: string,
  query: PaginationQueryDto = {}
) {
  return useQuery({
    queryKey: [...queryKeys.knowledgePoints.questions(id), query],
    queryFn: () => knowledgePointService.getQuestions(id, query),
    enabled: !!id,
    staleTime: 60 * 1000, // 1分钟
  })
}

/**
 * useCreateKnowledgePoint Hook
 * 
 * 创建知识点的 mutation hook
 * 创建成功后会自动失效相关缓存，触发重新查询
 * 
 * @returns mutation 对象和操作方法
 * 
 * 示例：
 * ```tsx
 * function CreateKnowledgePointForm() {
 *   const { mutateAsync: create, isPending, error } = useCreateKnowledgePoint();
 * 
 *   const handleSubmit = async (values: CreateKnowledgePointDto) => {
 *     try {
 *       const newKp = await create(values);
 *       message.success('创建成功');
 *       navigate(`/knowledge-points/${newKp.id}`);
 *     } catch (error) {
 *       message.error('创建失败');
 *     }
 *   };
 * 
 *   return (
 *     <Form onFinish={handleSubmit}>
 *       {/* 表单字段 *\/}
 *       <Button type="primary" htmlType="submit" loading={isPending}>
 *         创建
 *       </Button>
 *     </Form>
 *   );
 * }
 * ```
 */
export function useCreateKnowledgePoint() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateKnowledgePointDto) =>
      knowledgePointService.create(data),
    onSuccess: () => {
      // 创建成功后，使列表和树缓存失效
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledgePoints.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledgePoints.all })
    },
  })
}

/**
 * useUpdateKnowledgePoint Hook
 * 
 * 更新知识点的 mutation hook
 * 更新成功后会自动更新缓存中的数据并失效相关查询
 * 
 * @returns mutation 对象和操作方法
 * 
 * 示例：
 * ```tsx
 * function EditKnowledgePointForm({ id }: { id: string }) {
 *   const { data: knowledgePoint } = useKnowledgePoint(id);
 *   const { mutateAsync: update, isPending, error } = useUpdateKnowledgePoint();
 * 
 *   const handleSubmit = async (values: Partial<CreateKnowledgePointDto>) => {
 *     try {
 *       await update({ id, data: values });
 *       message.success('更新成功');
 *     } catch (error) {
 *       message.error('更新失败');
 *     }
 *   };
 * 
 *   return (
 *     <Form initialValues={knowledgePoint} onFinish={handleSubmit}>
 *       {/* 表单字段 *\/}
 *       <Button type="primary" htmlType="submit" loading={isPending}>
 *         保存
 *       </Button>
 *     </Form>
 *   );
 * }
 * ```
 */
export function useUpdateKnowledgePoint() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: Partial<CreateKnowledgePointDto>
    }) => knowledgePointService.update(id, data),
    onSuccess: (updatedKnowledgePoint: KnowledgePoint) => {
      // 更新成功后，直接更新缓存中的数据（乐观更新）
      queryClient.setQueryData(
        queryKeys.knowledgePoints.detail(updatedKnowledgePoint.id),
        updatedKnowledgePoint
      )
      // 同时使列表和树缓存失效
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledgePoints.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledgePoints.all })
      // 如果知识点关联了题目，也需要失效题目缓存
      queryClient.invalidateQueries({ queryKey: queryKeys.questions.all })
    },
  })
}

/**
 * useDeleteKnowledgePoint Hook
 * 
 * 删除知识点的 mutation hook
 * 删除成功后会自动移除缓存并失效相关查询
 * 
 * @returns mutation 对象和操作方法
 * 
 * 示例：
 * ```tsx
 * function KnowledgePointActions({ id }: { id: string }) {
 *   const { mutateAsync: remove, isPending } = useDeleteKnowledgePoint();
 * 
 *   const handleDelete = async () => {
 *     Modal.confirm({
 *       title: '确认删除',
 *       content: '删除后无法恢复，确定要删除吗？',
 *       onOk: async () => {
 *         try {
 *           await remove(id);
 *           message.success('删除成功');
 *           navigate('/knowledge-points');
 *         } catch (error) {
 *           if (error.message.includes('子知识点')) {
 *             message.error('请先删除子知识点');
 *           } else if (error.message.includes('题目')) {
 *             message.error('该知识点下有题目，请先处理相关题目');
 *           } else {
 *             message.error('删除失败');
 *           }
 *         }
 *       },
 *     });
 *   };
 * 
 *   return (
 *     <Button danger onClick={handleDelete} loading={isPending}>
 *       删除
 *     </Button>
 *   );
 * }
 * ```
 */
export function useDeleteKnowledgePoint() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => knowledgePointService.delete(id).then(() => id),
    onSuccess: (deletedId) => {
      // 删除成功后，移除缓存中的数据
      queryClient.removeQueries({
        queryKey: queryKeys.knowledgePoints.detail(deletedId),
      })
      // 使列表和树缓存失效
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledgePoints.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledgePoints.all })
      // 如果知识点关联了题目，也需要失效题目缓存
      queryClient.invalidateQueries({ queryKey: queryKeys.questions.all })
    },
  })
}

/**
 * useKnowledgePoints Hook (综合 Hook)
 * 
 * 提供知识点的完整操作接口，包括列表、树、CRUD 操作
 * 适用于需要多种操作的复杂页面
 * 
 * @returns 知识点数据和所有操作方法
 * 
 * 示例：
 * ```tsx
 * function KnowledgePointManage() {
 *   const {
 *     // 数据
 *     treeData,
 *     isLoading,
 *     
 *     // 操作
 *     create,
 *     update,
 *     remove,
 *     
 *     // 状态
 *     isCreating,
 *     isUpdating,
 *     isDeleting,
 *   } = useKnowledgePoints();
 * 
 *   // 使用数据和操作方法
 * }
 * ```
 */
export function useKnowledgePoints(categoryId?: string) {
  const queryClient = useQueryClient()

  // 查询知识点树
  const treeQuery = useKnowledgePointTree(categoryId)

  // 使所有知识点相关缓存失效
  const invalidateKnowledgePoints = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.knowledgePoints.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.questions.all })
  }

  // 创建知识点
  const createMutation = useMutation({
    mutationFn: (data: CreateKnowledgePointDto) =>
      knowledgePointService.create(data),
    onSuccess: invalidateKnowledgePoints,
  })

  // 更新知识点
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: Partial<CreateKnowledgePointDto>
    }) => knowledgePointService.update(id, data),
    onSuccess: invalidateKnowledgePoints,
  })

  // 删除知识点
  const deleteMutation = useMutation({
    mutationFn: (id: string) => knowledgePointService.delete(id).then(() => id),
    onSuccess: invalidateKnowledgePoints,
  })

  return {
    // 数据
    treeData: treeQuery.data ?? [],

    // 状态
    isLoading: treeQuery.isLoading,
    isError: treeQuery.isError,
    error: treeQuery.error as AppError | null,

    // 方法
    refetch: treeQuery.refetch,

    // 创建操作
    create: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error as AppError | null,

    // 更新操作
    update: (id: string, data: Partial<CreateKnowledgePointDto>) =>
      updateMutation.mutateAsync({ id, data }),
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error as AppError | null,

    // 删除操作
    remove: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error as AppError | null,
  }
}
