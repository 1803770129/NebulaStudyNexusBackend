/**
 * Employee management hook.
 *
 * Encapsulates list query and role/status/password/delete operations.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryClient'
import {
  getUsers,
  updateUserRole,
  updateUserStatus,
  resetUserPassword,
  deleteUser,
} from '@/services/userService'
import type { AdminUserRole, AppError, UserFilters } from '@/types'

export function useUsers(filters: UserFilters) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: queryKeys.users.list(filters as unknown as Record<string, unknown>),
    queryFn: () => getUsers(filters),
  })

  const invalidateUsers = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
  }

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: AdminUserRole }) => updateUserRole(id, role),
    onSuccess: invalidateUsers,
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => updateUserStatus(id, isActive),
    onSuccess: invalidateUsers,
  })

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      resetUserPassword(id, newPassword),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: invalidateUsers,
  })

  return {
    users: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    totalPages: query.data?.totalPages ?? 0,

    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as AppError | null,

    refetch: query.refetch,

    updateRole: (id: string, role: AdminUserRole) => updateRoleMutation.mutateAsync({ id, role }),
    isUpdatingRole: updateRoleMutation.isPending,

    updateStatus: (id: string, isActive: boolean) =>
      updateStatusMutation.mutateAsync({ id, isActive }),
    isUpdatingStatus: updateStatusMutation.isPending,

    resetPassword: (id: string, newPassword: string) =>
      resetPasswordMutation.mutateAsync({ id, newPassword }),
    isResettingPassword: resetPasswordMutation.isPending,

    remove: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  }
}

