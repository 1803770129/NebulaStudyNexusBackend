/**
 * 认证服务
 *
 * 提供用户认证相关功能：
 * 1. 用户登录 - POST /api/auth/login
 * 2. 用户注册 - POST /api/auth/register
 * 3. Token 刷新 - POST /api/auth/refresh
 * 4. 获取用户信息 - GET /api/auth/profile
 * 5. 用户登出 - 清除本地 Token
 * 6. 认证状态检查 - 检查是否已登录
 *
 * 学习要点：
 * - 认证服务是前端安全的核心
 * - Token 的存储和管理
 * - 登录状态的维护
 */

import { getApiClient, TOKEN_KEYS, ApiError } from '@/lib/apiClient'
import { ErrorType } from '@/types'

// ==================== 类型定义 ====================

/**
 * 登录请求参数
 */
export interface LoginRequest {
  /** 用户名 */
  username: string
  /** 密码 */
  password: string
}

/**
 * 注册请求参数
 */
export interface RegisterRequest {
  /** 用户名 */
  username: string
  /** 邮箱 */
  email: string
  /** 密码 */
  password: string
}

/**
 * 认证响应
 */
export interface AuthResponse {
  /** 访问令牌 */
  accessToken: string
  /** 刷新令牌 */
  refreshToken: string
  /** 用户信息 */
  user: {
    id: string
    username: string
    email: string
    role: string
  }
}

/**
 * 用户信息（从 JWT 解析）
 */
export interface UserProfile {
  /** 用户 ID */
  sub: string
  /** 用户名 */
  username: string
  /** 角色 */
  role: string
}

/**
 * 刷新 Token 请求
 */
export interface RefreshTokenRequest {
  refreshToken: string
}

/**
 * 更新管理员邮箱请求
 */
export interface UpdateProfileRequest {
  email?: string
}

/**
 * 修改密码请求
 */
export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

/**
 * 刷新 Token 响应
 */
export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
}

// ==================== 认证服务方法 ====================
/**
 * 用户登录
 *
 * 调用后端登录接口，成功后存储 Token
 *
 * @param data - 登录参数（用户名、密码）
 * @returns 认证响应（包含 Token 和用户信息）
 * @throws ApiError 当登录失败时
 *
 * 示例：
 * ```typescript
 * try {
 *   const result = await login({ username: 'admin', password: '123456' });
 *   console.log('登录成功', result.user);
 * } catch (error) {
 *   console.error('登录失败', error.message);
 * }
 * ```
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  const api = getApiClient()

  try {
    // 调用登录接口，后端返回 { statusCode, message, data: AuthResponse }
    const response = await api.post<{ data: AuthResponse }>('/auth/login', data)

    // 从包装的响应中提取实际数据
    const authData = response.data

    // 存储 Token
    api.setTokens(authData.accessToken, authData.refreshToken)

    return authData
  } catch (error) {
    // 转换错误信息，提供更友好的提示
    if (error instanceof ApiError && error.statusCode === 401) {
      throw new ApiError(ErrorType.VALIDATION_ERROR, '用户名或密码错误', 401)
    }
    throw error
  }
}

/**
 * 用户注册
 *
 * 调用后端注册接口，成功后自动登录
 *
 * @param data - 注册参数（用户名、邮箱、密码）
 * @returns 认证响应
 * @throws ApiError 当注册失败时
 *
 * 示例：
 * ```typescript
 * try {
 *   const result = await register({
 *     username: 'newuser',
 *     email: 'user@example.com',
 *     password: '123456'
 *   });
 *   console.log('注册成功', result.user);
 * } catch (error) {
 *   if (error.type === ErrorType.DUPLICATE_ERROR) {
 *     console.error('用户名或邮箱已存在');
 *   }
 * }
 * ```
 */
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const api = getApiClient()

  // 调用注册接口，后端返回 { statusCode, message, data: AuthResponse }
  const response = await api.post<{ data: AuthResponse }>('/auth/register', data)

  // 从包装的响应中提取实际数据
  const authData = response.data

  // 注册成功后自动存储 Token（自动登录）
  api.setTokens(authData.accessToken, authData.refreshToken)

  return authData
}

/**
 * 刷新访问令牌
 *
 * 使用 Refresh Token 获取新的 Access Token
 * 通常由 API Client 自动调用，无需手动调用
 *
 * @param refreshToken - 刷新令牌
 * @returns 新的 Token
 * @throws ApiError 当刷新失败时
 */
export async function refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
  const api = getApiClient()

  // 后端返回 { statusCode, message, data: RefreshTokenResponse }
  const response = await api.post<{ data: RefreshTokenResponse }>('/auth/refresh', {
    refreshToken,
  })

  // 从包装的响应中提取实际数据
  const tokenData = response.data

  // 更新存储的 Token
  api.setTokens(tokenData.accessToken, tokenData.refreshToken)

  return tokenData
}

/**
 * 获取当前用户信息
 *
 * 从后端获取当前登录用户的信息
 *
 * @returns 用户信息
 * @throws ApiError 当未登录或 Token 无效时
 *
 * 示例：
 * ```typescript
 * try {
 *   const profile = await getProfile();
 *   console.log('当前用户:', profile.username);
 * } catch (error) {
 *   // 未登录或 Token 过期
 *   redirectToLogin();
 * }
 * ```
 */
export async function getProfile(): Promise<UserProfile> {
  const api = getApiClient()
  // 后端返回 { statusCode, message, data: UserProfile }
  const response = await api.get<{ data: UserProfile }>('/auth/profile')
  return response.data
}

/**
 * 更新管理员个人信息
 *
 * @param data - 更新参数（目前仅支持 email）
 * @returns 更新结果
 */
export async function updateProfile(data: UpdateProfileRequest): Promise<void> {
  const api = getApiClient()
  await api.patch('/auth/profile', data)
}

/**
 * 修改管理员密码
 *
 * @param data - 旧密码和新密码
 * @returns 操作结果
 */
export async function changePassword(data: ChangePasswordRequest): Promise<void> {
  const api = getApiClient()
  await api.patch('/auth/password', data)
}

/**
 * 用户登出
 *
 * 清除本地存储的 Token，结束登录状态
 *
 * 注意：
 * - 这是一个同步操作，不需要调用后端
 * - 后端的 Token 会自然过期
 * - 如果需要立即使 Token 失效，需要后端支持 Token 黑名单
 *
 * 示例：
 * ```typescript
 * logout();
 * // 跳转到登录页
 * navigate('/login');
 * ```
 */
export function logout(): void {
  const api = getApiClient()
  api.clearTokens()
}

/**
 * 检查是否已认证
 *
 * 通过检查本地是否存在 Access Token 来判断登录状态
 *
 * 注意：
 * - 这只是检查 Token 是否存在，不验证 Token 是否有效
 * - Token 可能已过期，实际请求时会触发刷新或登出
 *
 * @returns 是否已登录
 *
 * 示例：
 * ```typescript
 * if (isAuthenticated()) {
 *   // 已登录，显示用户信息
 * } else {
 *   // 未登录，跳转到登录页
 * }
 * ```
 */
export function isAuthenticated(): boolean {
  const api = getApiClient()
  return api.getAccessToken() !== null
}

/**
 * 获取当前 Access Token
 *
 * 用于需要手动添加 Token 的场景（如 WebSocket 连接）
 *
 * @returns Access Token 或 null
 */
export function getAccessToken(): string | null {
  const api = getApiClient()
  return api.getAccessToken()
}

/**
 * 获取当前 Refresh Token
 *
 * @returns Refresh Token 或 null
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN)
}
