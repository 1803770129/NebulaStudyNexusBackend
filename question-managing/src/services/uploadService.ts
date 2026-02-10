/**
 * 图片上传服务
 * 
 * 提供图片上传功能，与后端 API 交互
 * 后端使用 GitHub + jsDelivr CDN 存储图片
 * 
 * 学习要点：
 * 1. 文件上传的处理方式（FormData）
 * 2. 上传进度的监控
 * 3. 文件验证（类型、大小）
 * 4. 错误处理
 * 5. CDN URL 的处理
 */

import { getApiClient, ApiError } from '@/lib/apiClient';

// ==================== 类型定义 ====================

/**
 * 上传结果接口
 */
export interface UploadResult {
  /** 文件访问 URL */
  url: string;
  /** 文件名 */
  filename: string;
  /** 文件大小（字节） */
  size: number;
}

/**
 * 上传进度回调类型
 */
export type UploadProgressCallback = (progress: number) => void;

/**
 * 文件验证结果
 */
export interface ValidationResult {
  /** 是否有效 */
  valid: boolean;
  /** 错误信息（验证失败时） */
  error?: string;
}

// ==================== 常量定义 ====================

/**
 * 支持的图片类型
 */
const VALID_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

/**
 * 最大文件大小（5MB）
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// ==================== 错误类 ====================

/**
 * 上传错误类
 */
export class UploadError extends Error {
  code: string;
  
  constructor(message: string, code: string = 'UPLOAD_ERROR') {
    super(message);
    this.name = 'UploadError';
    this.code = code;
  }
}

// ==================== 验证函数 ====================

/**
 * 验证图片文件
 * 
 * 检查文件类型和大小是否符合要求
 * 
 * @param file - 要验证的文件
 * @returns 验证结果
 * 
 * 示例：
 * ```typescript
 * const result = validateImageFile(file);
 * if (!result.valid) {
 *   alert(result.error);
 *   return;
 * }
 * // 继续上传...
 * ```
 */
export function validateImageFile(file: File): ValidationResult {
  // 检查文件类型
  if (!VALID_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: '只支持 JPG、PNG、GIF、WEBP 格式的图片',
    };
  }

  // 检查文件大小
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: '图片大小不能超过 5MB',
    };
  }

  return { valid: true };
}

/**
 * 格式化文件大小
 * 
 * @param bytes - 字节数
 * @returns 格式化后的字符串
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ==================== 上传函数 ====================

/**
 * 上传图片到服务器
 * 
 * @param file - 要上传的图片文件
 * @param onProgress - 上传进度回调（0-100）
 * @returns 上传结果
 * @throws UploadError 当上传失败时
 * 
 * 示例：
 * ```typescript
 * try {
 *   const result = await uploadImage(file, (progress) => {
 *     console.log(`上传进度: ${progress}%`);
 *   });
 *   console.log('上传成功:', result.url);
 * } catch (error) {
 *   if (error instanceof UploadError) {
 *     console.error('上传失败:', error.message);
 *   }
 * }
 * ```
 */
export async function uploadImage(
  file: File,
  onProgress?: UploadProgressCallback
): Promise<UploadResult> {
  // 1. 验证文件
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new UploadError(validation.error!, 'VALIDATION_ERROR');
  }

  // 2. 创建 FormData
  const formData = new FormData();
  formData.append('file', file);

  // 3. 调用上传接口
  const api = getApiClient();
  
  try {
    // 后端返回 { statusCode, message, data: UploadResult }
    const response = await api.upload<{ data: UploadResult }>(
      '/upload/image',
      formData,
      onProgress
    );
    
    return response.data;
  } catch (error) {
    // 转换错误
    if (error instanceof ApiError) {
      const code = error.statusCode === 413 ? 'FILE_TOO_LARGE' : 'UPLOAD_ERROR';
      throw new UploadError(error.message || '图片上传失败', code);
    }
    throw new UploadError('网络错误，请稍后重试', 'NETWORK_ERROR');
  }
}

/**
 * 批量上传图片
 * 
 * @param files - 要上传的图片文件列表
 * @param onProgress - 总体进度回调
 * @returns 上传结果列表
 * 
 * 示例：
 * ```typescript
 * const results = await uploadImages(files, (progress) => {
 *   console.log(`总进度: ${progress}%`);
 * });
 * ```
 */
export async function uploadImages(
  files: File[],
  onProgress?: UploadProgressCallback
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];
  const totalFiles = files.length;
  let completedFiles = 0;

  for (const file of files) {
    const result = await uploadImage(file, (fileProgress) => {
      if (onProgress) {
        // 计算总体进度
        const overallProgress = Math.round(
          ((completedFiles + fileProgress / 100) / totalFiles) * 100
        );
        onProgress(overallProgress);
      }
    });
    results.push(result);
    completedFiles++;
  }

  return results;
}

/**
 * 获取图片 URL
 * 
 * 支持两种格式：
 * 1. CDN 完整 URL（GitHub 图床）：直接返回
 * 2. 相对路径（旧数据兼容）：拼接 baseUrl
 * 
 * @param filename - 文件名、相对路径或完整 URL
 * @returns 完整的图片 URL
 * 
 * @example
 * // CDN URL
 * getImageUrl('https://cdn.jsdelivr.net/gh/user/repo@main/images/abc.jpg')
 * // => 'https://cdn.jsdelivr.net/gh/user/repo@main/images/abc.jpg'
 * 
 * // 相对路径（兼容旧数据）
 * getImageUrl('/api/upload/images/abc.jpg')
 * // => 'http://localhost:3000/api/upload/images/abc.jpg'
 */
export function getImageUrl(filename: string): string {
  // 如果已经是完整 URL，直接返回
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  
  // 构建完整 URL
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
  return `${baseUrl}/upload/images/${filename}`;
}

/**
 * 判断是否为 CDN URL
 * 
 * @param url - 图片 URL
 * @returns 是否为 CDN URL
 */
export function isCdnUrl(url: string): boolean {
  return url.startsWith('https://cdn.jsdelivr.net/') || 
         url.startsWith('http://cdn.jsdelivr.net/');
}

/**
 * 判断是否为完整 URL
 * 
 * @param url - 图片 URL
 * @returns 是否为完整 URL
 */
export function isFullUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}
