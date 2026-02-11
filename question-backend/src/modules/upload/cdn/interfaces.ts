/**
 * 共享类型定义 - 图片 CDN 混合降级方案
 * 
 * 本文件定义了前后端共享的接口和类型
 */

/**
 * CDN 类型
 */
export type CDNType = 'statically' | 'github' | 'proxy';

/**
 * CDN 配置
 */
export interface CDNConfig {
  /** GitHub 仓库（owner/repo） */
  githubRepo: string;
  /** 分支名 */
  githubBranch: string;
  /** 图片路径前缀 */
  imagePath: string;
  /** 超时阈值（毫秒） */
  timeout: number;
  /** CDN 优先级 */
  priority: CDNType[];
  /** 启用的 CDN */
  enabledCDNs: {
    statically: boolean;
    github: boolean;
    proxy: boolean;
  };
  /** URL 缓存过期时间（毫秒） */
  cacheTTL: number;
}

/**
 * 降级 URL 集合
 */
export interface FallbackURLs {
  /** 文件名 */
  filename: string;
  /** 降级 URL 数组 */
  urls: string[];
  /** 主 URL（向后兼容） */
  primary: string;
}

/**
 * 健康状态
 */
export interface HealthStatus {
  /** 是否健康 */
  healthy: boolean;
  /** CDN 类型 */
  cdnType: CDNType;
  /** 最后检查时间戳 */
  lastCheck: number;
  /** 响应时间（毫秒） */
  responseTime?: number;
  /** 错误信息 */
  error?: string;
}

/**
 * 健康检查配置
 */
export interface HealthCheckConfig {
  /** 测试图片文件名 */
  testImageFilename: string;
  /** 超时阈值 */
  timeout: number;
  /** 缓存间隔（毫秒） */
  cacheInterval: number;
}

/**
 * 代理配置
 */
export interface ProxyConfig {
  /** 缓存时间（秒） */
  cacheTTL: number;
  /** 是否启用压缩 */
  enableCompression: boolean;
  /** 最大缓存大小（字节） */
  maxCacheSize: number;
}

/**
 * 代理请求
 */
export interface ProxyRequest {
  /** 文件名 */
  filename: string;
  /** 可选的宽度（用于压缩） */
  width?: number;
  /** 可选的高度 */
  height?: number;
  /** 图片质量（1-100） */
  quality?: number;
}

/**
 * 代理响应
 */
export interface ProxyResponse {
  /** 图片数据 */
  data: Buffer;
  /** 内容类型 */
  contentType: string;
  /** 缓存控制头 */
  cacheControl: string;
  /** ETag */
  etag: string;
}

/**
 * 上传响应（增强版）
 */
export interface UploadResponse {
  /** 是否成功 */
  success: boolean;
  /** 文件名 */
  filename: string;
  /** 主 URL（Statically，向后兼容） */
  url: string;
  /** 所有降级 URL */
  urls: {
    statically: string;
    github: string;
    proxy: string;
  };
  /** 文件大小（字节） */
  size: number;
  /** 上传时间（ISO 8601） */
  uploadedAt: string;
}

/**
 * 缓存条目（前端）
 */
export interface CacheEntry {
  /** 成功的 URL */
  url: string;
  /** 缓存时间戳（毫秒） */
  timestamp: number;
  /** CDN 类型 */
  cdnType: CDNType;
  /** 缓存命中次数 */
  hits: number;
}

/**
 * URL 缓存配置（前端）
 */
export interface URLCacheConfig {
  /** 存储类型 */
  storage: 'localStorage' | 'indexedDB';
  /** 缓存过期时间（毫秒） */
  ttl: number;
  /** 最大缓存条目数（仅 IndexedDB） */
  maxEntries?: number;
}

/**
 * 加载指标
 */
export interface LoadMetrics {
  /** 文件名 */
  filename: string;
  /** 开始时间 */
  startTime: number;
  /** 结束时间 */
  endTime: number;
  /** 持续时间 */
  duration: number;
  /** CDN 类型 */
  cdnType: CDNType;
  /** 是否成功 */
  success: boolean;
  /** 失败的 URL 列表 */
  failedUrls: string[];
  /** 重试次数 */
  retryCount: number;
}

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  /** 平均加载时间 */
  averageLoadTime: number;
  /** 降级率（使用备用 CDN 的比例） */
  fallbackRate: number;
  /** 缓存命中率 */
  cacheHitRate: number;
  /** 成功率 */
  successRate: number;
  /** 各 CDN 的性能 */
  cdnPerformance: {
    statically: { avgTime: number; successRate: number };
    github: { avgTime: number; successRate: number };
    proxy: { avgTime: number; successRate: number };
  };
}

/**
 * 错误日志
 */
export interface ErrorLog {
  /** 时间戳（ISO 8601） */
  timestamp: string;
  /** 日志级别 */
  level: 'error' | 'warn' | 'info';
  /** 组件名 */
  component: string;
  /** 操作名 */
  operation: string;
  /** 相关的图片文件名 */
  filename?: string;
  /** 相关的 URL */
  url?: string;
  /** 错误类型 */
  errorType: string;
  /** 错误信息 */
  errorMessage: string;
  /** 错误堆栈（仅服务端） */
  errorStack?: string;
  /** 额外的上下文信息 */
  metadata?: Record<string, any>;
}

/**
 * 迁移配置
 */
export interface MigrationConfig {
  /** 数据库连接字符串 */
  databaseUrl: string;
  /** 表名 */
  tableName: string;
  /** URL 列名 */
  urlColumn: string;
  /** 批处理大小 */
  batchSize: number;
  /** 是否为试运行（不实际更新） */
  dryRun: boolean;
}

/**
 * 迁移结果
 */
export interface MigrationResult {
  /** 总记录数 */
  totalRecords: number;
  /** 更新的记录数 */
  updatedRecords: number;
  /** 失败的记录数 */
  failedRecords: number;
  /** 跳过的记录数（已经是 Statically） */
  skippedRecords: number;
  /** 错误列表 */
  errors: Array<{
    recordId: string;
    error: string;
  }>;
}
