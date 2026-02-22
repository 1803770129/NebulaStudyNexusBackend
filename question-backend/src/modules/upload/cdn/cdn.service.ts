import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CDNConfig, FallbackURLs, CDNType } from './interfaces';

/**
 * CDN 服务
 *
 * 核心服务，生成降级 URL、管理配置、协调健康检查
 */
@Injectable()
export class CDNService {
  private readonly logger = new Logger(CDNService.name);
  private readonly config: CDNConfig;

  constructor(private readonly configService: ConfigService) {
    this.config = CDNService.loadConfig(configService);
    this.logger.log('CDN Service initialized with config:', {
      timeout: this.config.timeout,
      priority: this.config.priority,
      enabledCDNs: this.config.enabledCDNs,
    });
  }

  /**
   * 从环境变量加载配置
   */
  static loadConfig(configService: ConfigService): CDNConfig {
    const githubRepo = configService.get<string>('github.repo');
    const githubBranch = configService.get<string>('github.branch', 'main');

    if (!githubRepo) {
      throw new Error('GITHUB_REPO environment variable is required');
    }

    return {
      githubRepo,
      githubBranch,
      imagePath: 'images',
      timeout: configService.get<number>('cdn.timeout', 5000),
      priority: configService.get<string[]>('cdn.priority', [
        'statically',
        'github',
        'proxy',
      ]) as CDNType[],
      enabledCDNs: {
        statically: configService.get<boolean>('cdn.enabledCDNs.statically', true),
        github: configService.get<boolean>('cdn.enabledCDNs.github', true),
        proxy: configService.get<boolean>('cdn.enabledCDNs.proxy', true),
      },
      cacheTTL: configService.get<number>('cdn.cacheTTL', 86400000),
    };
  }

  /**
   * 生成 Statically CDN URL
   *
   * @param filename 图片文件名
   * @returns Statically CDN URL
   */
  generateStaticallyURL(filename: string): string {
    const { githubRepo, githubBranch, imagePath } = this.config;
    return `https://cdn.statically.io/gh/${githubRepo}@${githubBranch}/${imagePath}/${filename}`;
  }

  /**
   * 生成 GitHub Raw URL
   *
   * @param filename 图片文件名
   * @returns GitHub Raw URL
   */
  generateGitHubRawURL(filename: string): string {
    const { githubRepo, githubBranch, imagePath } = this.config;
    return `https://raw.githubusercontent.com/${githubRepo}/${githubBranch}/${imagePath}/${filename}`;
  }

  /**
   * 生成代理服务 URL
   *
   * @param filename 图片文件名
   * @returns 代理服务 URL
   */
  generateProxyURL(filename: string): string {
    return `/api/upload/proxy/${filename}`;
  }

  /**
   * 生成所有降级 URL
   *
   * 根据配置生成降级链，按优先级排序，只包含启用的 CDN
   *
   * @param filename 图片文件名
   * @returns 降级 URL 集合
   */
  generateFallbackURLs(filename: string): FallbackURLs {
    const urlGenerators: Record<CDNType, () => string> = {
      statically: () => this.generateStaticallyURL(filename),
      github: () => this.generateGitHubRawURL(filename),
      proxy: () => this.generateProxyURL(filename),
    };

    // 根据优先级和启用状态生成 URL 列表
    const urls: string[] = [];
    for (const cdnType of this.config.priority) {
      if (this.config.enabledCDNs[cdnType]) {
        urls.push(urlGenerators[cdnType]());
      }
    }

    // 如果没有启用任何 CDN，至少返回代理 URL
    if (urls.length === 0) {
      this.logger.warn('No CDNs enabled, falling back to proxy only');
      urls.push(this.generateProxyURL(filename));
    }

    // 主 URL 是第一个启用的 CDN URL
    const primary = urls[0];

    return {
      filename,
      urls,
      primary,
    };
  }

  /**
   * 获取配置
   */
  getConfig(): CDNConfig {
    return { ...this.config };
  }
}
