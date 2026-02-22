import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CDNService } from './cdn.service';
import { HealthStatus, HealthCheckConfig, CDNType } from './interfaces';

/**
 * 健康监控服务
 *
 * 监控 CDN 健康状态，缓存检查结果
 */
@Injectable()
export class HealthMonitor {
  private readonly logger = new Logger(HealthMonitor.name);
  private readonly config: HealthCheckConfig;
  private readonly healthCache: Map<CDNType, { status: HealthStatus; expiresAt: number }> =
    new Map();

  constructor(
    private readonly cdnService: CDNService,
    private readonly configService: ConfigService,
  ) {
    this.config = this.loadConfig();
    this.logger.log('HealthMonitor initialized with config:', this.config);
  }

  /**
   * 从环境变量加载健康检查配置
   */
  private loadConfig(): HealthCheckConfig {
    return {
      testImageFilename: this.configService.get<string>('cdn.healthCheck.testImage', 'test.jpg'),
      timeout: this.configService.get<number>('cdn.timeout', 5000),
      cacheInterval: this.configService.get<number>('cdn.healthCheck.cacheInterval', 60000),
    };
  }

  /**
   * 检查 CDN 健康状态（带缓存）
   *
   * @param cdnType CDN 类型
   * @returns 健康状态
   */
  async checkHealth(cdnType: CDNType): Promise<HealthStatus> {
    // 检查缓存
    const cached = this.healthCache.get(cdnType);
    const now = Date.now();

    if (cached && cached.expiresAt > now) {
      this.logger.debug(`Using cached health status for ${cdnType}`);
      return cached.status;
    }

    // 缓存未命中或已过期，执行实际检查
    this.logger.debug(`Performing health check for ${cdnType}`);
    const status = await this.performHealthCheck(cdnType);

    // 缓存结果
    this.healthCache.set(cdnType, {
      status,
      expiresAt: now + this.config.cacheInterval,
    });

    return status;
  }

  /**
   * 执行实际的健康检查（无缓存）
   *
   * @param cdnType CDN 类型
   * @returns 健康状态
   */
  private async performHealthCheck(cdnType: CDNType): Promise<HealthStatus> {
    const startTime = Date.now();
    let url: string;

    try {
      // 生成测试 URL
      switch (cdnType) {
        case 'statically':
          url = this.cdnService.generateStaticallyURL(this.config.testImageFilename);
          break;
        case 'github':
          url = this.cdnService.generateGitHubRawURL(this.config.testImageFilename);
          break;
        case 'proxy':
          url = this.cdnService.generateProxyURL(this.config.testImageFilename);
          // 对于代理服务，我们需要使用完整的 URL
          // 假设代理服务运行在同一个服务器上
          const baseUrl = this.configService.get<string>('app.baseUrl', 'http://localhost:3000');
          url = `${baseUrl}${url}`;
          break;
        default:
          throw new Error(`Unknown CDN type: ${cdnType}`);
      }

      // 执行 HTTP 请求
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      try {
        const response = await fetch(url, {
          method: 'HEAD', // 使用 HEAD 请求，不下载完整内容
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const responseTime = Date.now() - startTime;

        if (response.ok) {
          this.logger.log(`Health check passed for ${cdnType}: ${responseTime}ms`);
          return {
            healthy: true,
            cdnType,
            lastCheck: Date.now(),
            responseTime,
          };
        } else {
          this.logger.warn(`Health check failed for ${cdnType}: HTTP ${response.status}`);
          return {
            healthy: false,
            cdnType,
            lastCheck: Date.now(),
            responseTime,
            error: `HTTP ${response.status}: ${response.statusText}`,
          };
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Health check failed for ${cdnType}: ${errorMessage}`);

      return {
        healthy: false,
        cdnType,
        lastCheck: Date.now(),
        responseTime,
        error: errorMessage,
      };
    }
  }

  /**
   * 获取所有 CDN 的健康状态
   *
   * @returns 所有 CDN 的健康状态映射
   */
  async getAllHealthStatus(): Promise<Record<string, HealthStatus>> {
    const cdnTypes: CDNType[] = ['statically', 'github', 'proxy'];
    const results: Record<string, HealthStatus> = {};

    // 并行检查所有 CDN
    await Promise.all(
      cdnTypes.map(async (cdnType) => {
        try {
          results[cdnType] = await this.checkHealth(cdnType);
        } catch (error) {
          this.logger.error(`Failed to check health for ${cdnType}:`, error);
          results[cdnType] = {
            healthy: false,
            cdnType,
            lastCheck: Date.now(),
            error: error instanceof Error ? error.message : String(error),
          };
        }
      }),
    );

    return results;
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.logger.log('Clearing health check cache');
    this.healthCache.clear();
  }

  /**
   * 清理过期的缓存条目
   */
  cleanupExpiredCache(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [cdnType, cached] of this.healthCache.entries()) {
      if (cached.expiresAt <= now) {
        this.healthCache.delete(cdnType);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.debug(`Cleaned up ${cleanedCount} expired cache entries`);
    }
  }
}
