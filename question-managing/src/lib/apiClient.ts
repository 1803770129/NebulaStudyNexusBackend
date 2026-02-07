/**
 * API Client 模块
 * 
 * 统一的 HTTP 请求客户端，提供以下功能：
 * 1. 单例模式 - 确保全局只有一个实例
 * 2. 统一的 HTTP 方法 - GET、POST、PATCH、DELETE
 * 3. 自动认证 - 请求头自动添加 JWT Token
 * 4. Token 刷新 - 401 错误时自动刷新 Token 并重试
 * 5. 错误处理 - 统一转换为 AppError 格式
 * 6. 环境配置 - 支持通过环境变量配置 API 基础 URL
 * 
 * 架构思想：
 * - 使用 Axios 作为底层 HTTP 库
 * - 通过拦截器实现认证和错误处理
 * - 单例模式确保 Token 状态一致性
 */

import axios from 'axios';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { ErrorType, type AppError } from '@/types';

// ==================== 类型定义 ====================

/**
 * API 客户端配置接口
 */
export interface ApiClientConfig {
  /** API 基础 URL */
  baseURL: string;
  /** 请求超时时间（毫秒） */
  timeout?: number;
}

/**
 * API 成功响应接口
 */
export interface ApiResponse<T> {
  /** 响应数据 */
  data: T;
  /** 响应消息 */
  message?: string;
}

/**
 * API 分页响应接口
 */
export interface PaginatedApiResponse<T> {
  /** 数据列表 */
  data: T[];
  /** 分页元信息 */
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

/**
 * API 错误响应接口
 */
export interface ApiErrorResponse {
  /** HTTP 状态码 */
  statusCode: number;
  /** 错误消息 */
  message: string | string[];
  /** 错误类型 */
  error?: string;
}

// ==================== 常量定义 ====================

/**
 * Token 存储键名
 */
export const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

/**
 * 默认 API 基础 URL
 */
const DEFAULT_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * 默认请求超时时间（10秒）
 */
const DEFAULT_TIMEOUT = 10000;

// ==================== 错误处理 ====================

/**
 * API 错误类
 * 继承自 Error，实现 AppError 接口
 */
export class ApiError extends Error implements AppError {
  type: ErrorType;
  field?: string;
  details?: Record<string, unknown>;
  statusCode: number;

  constructor(
    type: ErrorType,
    message: string,
    statusCode: number,
    field?: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.statusCode = statusCode;
    this.field = field;
    this.details = details;
  }
}

/**
 * HTTP 状态码到错误类型的映射
 * 
 * 设计思想：
 * - 将后端的 HTTP 状态码映射为前端统一的错误类型
 * - 便于前端统一处理不同类型的错误
 */
export function mapStatusCodeToErrorType(statusCode: number): ErrorType {
  switch (statusCode) {
    case 400:
      return ErrorType.VALIDATION_ERROR;
    case 401:
      return ErrorType.NETWORK_ERROR; // 未授权，需要特殊处理
    case 403:
      return ErrorType.CONSTRAINT_ERROR; // 权限不足
    case 404:
      return ErrorType.NOT_FOUND;
    case 409:
      return ErrorType.DUPLICATE_ERROR;
    default:
      return ErrorType.NETWORK_ERROR;
  }
}

/**
 * 将 Axios 错误转换为 ApiError
 */
export function convertToApiError(error: AxiosError<ApiErrorResponse>): ApiError {
  if (error.response) {
    const { status, data } = error.response;
    const message = Array.isArray(data?.message) 
      ? data.message.join(', ') 
      : data?.message || '请求失败';
    
    return new ApiError(
      mapStatusCodeToErrorType(status),
      message,
      status,
      undefined,
      { originalError: data }
    );
  }
  
  if (error.request) {
    // 请求已发送但没有收到响应
    return new ApiError(
      ErrorType.NETWORK_ERROR,
      '网络错误，请检查网络连接或服务器是否启动',
      0
    );
  }
  
  // 请求配置错误
  return new ApiError(
    ErrorType.NETWORK_ERROR,
    error.message || '请求配置错误',
    0
  );
}

/**
 * 全局错误提示回调
 * 用于在 API 错误时显示提示
 */
let globalErrorHandler: ((error: ApiError) => void) | null = null;

/**
 * 设置全局错误处理器
 * @param handler 错误处理回调函数
 */
export function setGlobalErrorHandler(handler: (error: ApiError) => void): void {
  globalErrorHandler = handler;
}

/**
 * 触发全局错误提示
 */
function triggerGlobalError(error: ApiError): void {
  if (globalErrorHandler) {
    globalErrorHandler(error);
  }
}


// ==================== API Client 类 ====================

/**
 * API 客户端类
 * 
 * 设计模式：单例模式
 * - 确保全局只有一个 API 客户端实例
 * - 所有请求共享同一个 Token 状态
 * - 避免多个实例导致的状态不一致
 * 
 * 核心功能：
 * 1. 请求拦截器：自动添加 Authorization 头
 * 2. 响应拦截器：处理错误和 Token 刷新
 * 3. Token 管理：存储、获取、清除 Token
 */
class ApiClient {
  /** 单例实例 */
  private static instance: ApiClient;
  
  /** Axios 实例 */
  private axiosInstance: AxiosInstance;
  
  /** 是否正在刷新 Token */
  private isRefreshing = false;
  
  /** 等待 Token 刷新的请求队列 */
  private refreshSubscribers: Array<(token: string) => void> = [];

  /**
   * 私有构造函数
   * 单例模式的关键：防止外部直接 new
   */
  private constructor(config?: Partial<ApiClientConfig>) {
    // 创建 Axios 实例
    this.axiosInstance = axios.create({
      baseURL: config?.baseURL || DEFAULT_BASE_URL,
      timeout: config?.timeout || DEFAULT_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 设置拦截器
    this.setupInterceptors();
  }

  /**
   * 获取单例实例
   * 
   * 使用方式：
   * const api = ApiClient.getInstance();
   * const data = await api.get('/users');
   */
  public static getInstance(config?: Partial<ApiClientConfig>): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient(config);
    }
    return ApiClient.instance;
  }

  /**
   * 重置实例（主要用于测试）
   */
  public static resetInstance(): void {
    ApiClient.instance = undefined as unknown as ApiClient;
  }

  /**
   * 设置请求和响应拦截器
   * 
   * 拦截器是 Axios 的核心功能，允许在请求发送前和响应返回后进行处理
   */
  private setupInterceptors(): void {
    // 请求拦截器：在每个请求发送前执行
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // 自动添加 Authorization 头
        const token = this.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 响应拦截器：在每个响应返回后执行
    this.axiosInstance.interceptors.response.use(
      // 成功响应直接返回
      (response: AxiosResponse) => response,
      // 错误响应处理
      async (error: AxiosError<ApiErrorResponse>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        
        // 401 错误且不是刷新 Token 的请求，尝试刷新 Token
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url?.includes('/auth/refresh')
        ) {
          if (this.isRefreshing) {
            // 如果正在刷新，将请求加入队列等待
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(this.axiosInstance(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // 尝试刷新 Token
            const newToken = await this.refreshAccessToken();
            if (newToken) {
              // 刷新成功，重试原请求
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              // 通知队列中的请求
              this.onRefreshed(newToken);
              return this.axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            // 刷新失败，清除 Token
            this.clearTokens();
            const apiError = convertToApiError(error);
            triggerGlobalError(apiError);
            return Promise.reject(apiError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // 其他错误，转换为 ApiError 并触发全局提示
        const apiError = convertToApiError(error);
        triggerGlobalError(apiError);
        return Promise.reject(apiError);
      }
    );
  }

  /**
   * Token 刷新成功后，通知等待队列中的请求
   */
  private onRefreshed(token: string): void {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  /**
   * 刷新 Access Token
   */
  private async refreshAccessToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await this.axiosInstance.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
        '/auth/refresh',
        { refreshToken }
      );
      
      const { accessToken, refreshToken: newRefreshToken } = response.data.data;
      this.setTokens(accessToken, newRefreshToken);
      return accessToken;
    } catch {
      return null;
    }
  }

  // ==================== Token 管理方法 ====================

  /**
   * 设置 Token
   * 将 Access Token 和 Refresh Token 存储到 localStorage
   */
  public setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
  }

  /**
   * 清除 Token
   * 登出时调用，清除所有存储的 Token
   */
  public clearTokens(): void {
    localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
  }

  /**
   * 获取 Access Token
   */
  public getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  }

  /**
   * 获取 Refresh Token
   */
  public getRefreshToken(): string | null {
    return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
  }

  // ==================== HTTP 请求方法 ====================

  /**
   * GET 请求
   * 
   * @param url - 请求 URL（相对于 baseURL）
   * @param params - 查询参数
   * @returns 响应数据
   * 
   * 示例：
   * const users = await api.get<User[]>('/users', { page: 1, pageSize: 10 });
   */
  public async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, { params });
    return response.data;
  }

  /**
   * POST 请求
   * 
   * @param url - 请求 URL
   * @param data - 请求体数据
   * @returns 响应数据
   * 
   * 示例：
   * const user = await api.post<User>('/users', { name: 'John', email: 'john@example.com' });
   */
  public async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data);
    return response.data;
  }

  /**
   * PATCH 请求
   * 
   * @param url - 请求 URL
   * @param data - 请求体数据
   * @returns 响应数据
   * 
   * 示例：
   * const user = await api.patch<User>('/users/1', { name: 'Jane' });
   */
  public async patch<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.axiosInstance.patch<T>(url, data);
    return response.data;
  }

  /**
   * DELETE 请求
   * 
   * @param url - 请求 URL
   * @returns 响应数据
   * 
   * 示例：
   * await api.delete('/users/1');
   */
  public async delete<T>(url: string): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url);
    return response.data;
  }

  /**
   * 文件上传
   * 
   * @param url - 上传 URL
   * @param formData - FormData 对象
   * @param onProgress - 上传进度回调
   * @returns 响应数据
   * 
   * 示例：
   * const formData = new FormData();
   * formData.append('file', file);
   * const result = await api.upload<UploadResult>('/upload/image', formData, (progress) => {
   *   console.log(`上传进度: ${progress}%`);
   * });
   */
  public async upload<T>(
    url: string,
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    return response.data;
  }
}

// ==================== 导出 ====================

/**
 * 获取 API 客户端实例
 * 
 * 这是推荐的使用方式，而不是直接使用 ApiClient.getInstance()
 * 便于后续可能的依赖注入或测试替换
 */
export function getApiClient(): ApiClient {
  return ApiClient.getInstance();
}

/**
 * 默认导出 API 客户端类
 */
export default ApiClient;
