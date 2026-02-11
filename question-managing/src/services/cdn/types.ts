/**
 * 前端 CDN 服务类型定义
 * 
 * 这些类型与后端共享，用于图片 CDN 混合降级方案
 */

/**
 * CDN 类型
 */
export type CDNType = 'statically' | 'github' | 'proxy';

/**
 * 缓存条目
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
 * URL 缓存配置
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
  /** 额外的上下文信息 */
  metadata?: Record<string, any>;
}

/**
 * 图片加载器状态
 */
export type ImageLoaderStatus = 'loading' | 'loaded' | 'error';

/**
 * 图片加载器属性
 */
export interface ImageLoaderProps {
  /** 图片文件名 */
  filename: string;
  /** 图片 alt 文本 */
  alt?: string;
  /** CSS 类名 */
  className?: string;
  /** 可选的自定义降级 URL */
  fallbackUrls?: string[];
  /** 超时阈值（毫秒），默认 5000 */
  timeout?: number;
  /** 加载成功回调 */
  onLoad?: () => void;
  /** 加载失败回调 */
  onError?: (error: Error) => void;
  /** 是否启用懒加载，默认 true */
  lazy?: boolean;
}

/**
 * 图片加载器状态
 */
export interface ImageLoaderState {
  /** 加载状态 */
  status: ImageLoaderStatus;
  /** 当前尝试的 URL 索引 */
  currentUrlIndex: number;
  /** 降级 URL 链 */
  urls: string[];
  /** 重试次数 */
  retryCount: number;
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
 * 健康检查响应
 */
export interface HealthCheckResponse {
  statically: HealthStatus;
  github: HealthStatus;
  proxy: HealthStatus;
  overall: 'healthy' | 'degraded' | 'unhealthy';
}

/**
 * 性能指标响应
 */
export interface MetricsResponse {
  averageLoadTime: number;
  fallbackRate: number;
  cacheHitRate: number;
  successRate: number;
  cdnPerformance: {
    statically: { avgTime: number; successRate: number };
    github: { avgTime: number; successRate: number };
    proxy: { avgTime: number; successRate: number };
  };
  /** 统计周期（如 '24h'） */
  period: string;
}
