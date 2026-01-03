/**
 * 认证 Hook
 * 
 * 封装用户认证相关的状态和操作
 * 
 * 学习要点：
 * 1. 认证状态的全局管理
 * 2. 登录/登出流程
 * 3. 用户信息的获取和缓存
 * 4. 认证状态的持久化
 */

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  login as loginApi,
  register as registerApi,
  logout as logoutApi,
  getProfile,
  isAuthenticated as checkAuth,
  type LoginRequest,
  type RegisterRequest,
  type AuthResponse,
  type UserProfile,
} from '@/services/authService';
import type { AppError } from '@/types';

// 查询键
const AUTH_QUERY_KEY = ['auth', 'profile'];

/**
 * useAuth Hook
 * 
 * @returns 认证状态和操作方法
 * 
 * 示例：
 * ```tsx
 * function LoginPage() {
 *   const { login, isLoggingIn, loginError } = useAuth();
 * 
 *   const handleSubmit = async (values) => {
 *     try {
 *       await login(values);
 *       navigate('/dashboard');
 *     } catch (error) {
 *       message.error(error.message);
 *     }
 *   };
 * 
 *   return <LoginForm onSubmit={handleSubmit} loading={isLoggingIn} />;
 * }
 * 
 * function Header() {
 *   const { user, isAuthenticated, logout } = useAuth();
 * 
 *   if (!isAuthenticated) {
 *     return <Link to="/login">登录</Link>;
 *   }
 * 
 *   return (
 *     <Dropdown menu={{ items: [{ label: '退出', onClick: logout }] }}>
 *       <span>{user?.username}</span>
 *     </Dropdown>
 *   );
 * }
 * ```
 */
export function useAuth() {
  const queryClient = useQueryClient();
  
  // 本地认证状态（用于快速判断，避免等待 API 响应）
  const [isAuthenticated, setIsAuthenticated] = useState(() => checkAuth());

  // 查询用户信息
  const profileQuery = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: getProfile,
    enabled: isAuthenticated, // 只有已认证时才查询
    staleTime: 5 * 60 * 1000, // 5分钟
    retry: false, // 不重试，避免 Token 过期时无限重试
  });

  // 登录
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => loginApi(data),
    onSuccess: (response: AuthResponse) => {
      setIsAuthenticated(true);
      // 直接设置用户信息到缓存
      queryClient.setQueryData(AUTH_QUERY_KEY, {
        sub: response.user.id,
        username: response.user.username,
        role: response.user.role,
      });
    },
  });

  // 注册
  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => registerApi(data),
    onSuccess: (response: AuthResponse) => {
      setIsAuthenticated(true);
      queryClient.setQueryData(AUTH_QUERY_KEY, {
        sub: response.user.id,
        username: response.user.username,
        role: response.user.role,
      });
    },
  });

  // 登出
  const logout = useCallback(() => {
    logoutApi();
    setIsAuthenticated(false);
    // 清除所有缓存
    queryClient.clear();
  }, [queryClient]);

  // 监听认证状态变化（如 Token 过期）
  useEffect(() => {
    if (profileQuery.isError) {
      // 获取用户信息失败，可能是 Token 过期
      logout();
    }
  }, [profileQuery.isError, logout]);

  // 刷新用户信息
  const refreshProfile = useCallback(() => {
    return profileQuery.refetch();
  }, [profileQuery]);

  return {
    // 状态
    isAuthenticated,
    user: profileQuery.data as UserProfile | null,
    isLoadingUser: profileQuery.isLoading,
    
    // 登录
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error as AppError | null,
    
    // 注册
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error as AppError | null,
    
    // 登出
    logout,
    
    // 刷新
    refreshProfile,
  };
}

/**
 * 认证守卫 Hook
 * 
 * 用于保护需要登录的页面
 * 
 * @returns 认证状态
 * 
 * 示例：
 * ```tsx
 * function ProtectedPage() {
 *   const { isAuthenticated, isLoading } = useAuthGuard();
 * 
 *   if (isLoading) return <Spin />;
 *   if (!isAuthenticated) {
 *     return <Navigate to="/login" />;
 *   }
 * 
 *   return <Dashboard />;
 * }
 * ```
 */
export function useAuthGuard() {
  const { isAuthenticated, isLoadingUser } = useAuth();
  
  return {
    isAuthenticated,
    isLoading: isLoadingUser,
  };
}
