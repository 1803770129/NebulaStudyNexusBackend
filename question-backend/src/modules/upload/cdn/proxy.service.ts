import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import * as crypto from 'crypto';
import sharp from 'sharp';
import { CDNService } from './cdn.service';
import { ProxyConfig, ProxyRequest, ProxyResponse } from './interfaces';

/**
 * 代理服务
 * 
 * 代理服务，从 GitHub 获取图片并返回，带缓存和压缩
 */
@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);
  private readonly config: ProxyConfig;

  constructor(
    private readonly cdnService: CDNService,
    private readonly configService: ConfigService,
  ) {
    this.config = ProxyService.loadConfig(configService);
    this.logger.log('Proxy Service initialized with config:', {
      cacheTTL: this.config.cacheTTL,
      enableCompression: this.config.enableCompression,
      maxCacheSize: this.config.maxCacheSize,
    });
  }

  /**
   * 从环境变量加载配置
   */
  static loadConfig(configService: ConfigService): ProxyConfig {
    return {
      cacheTTL: configService.get<number>('proxy.cacheTTL', 3600),
      enableCompression: configService.get<boolean>('proxy.enableCompression', true),
      maxCacheSize: configService.get<number>('proxy.maxCacheSize', 10485760), // 10MB
    };
  }

  /**
   * 代理图片请求
   * 
   * 从 GitHub 获取图片，可选压缩，返回带缓存头的响应
   * 
   * @param req 代理请求参数
   * @returns 代理响应
   */
  async proxyImage(req: ProxyRequest): Promise<ProxyResponse> {
    const { filename, width, height, quality } = req;

    this.logger.log(`Proxying image: ${filename}`, {
      width,
      height,
      quality,
    });

    try {
      // 从 GitHub 获取图片
      const imageBuffer = await this.fetchFromGitHub(filename);

      // 压缩图片（如果启用且提供了参数）
      let processedBuffer = imageBuffer;
      if (this.config.enableCompression && (width || height || quality)) {
        processedBuffer = await this.compressImage(imageBuffer, width, height, quality);
        this.logger.log(`Image compressed: ${filename}`, {
          originalSize: imageBuffer.length,
          compressedSize: processedBuffer.length,
          reduction: `${((1 - processedBuffer.length / imageBuffer.length) * 100).toFixed(2)}%`,
        });
      }

      // 检测内容类型
      const metadata = await sharp(processedBuffer).metadata();
      const contentType = this.getContentType(metadata.format);

      // 生成 ETag
      const etag = this.generateETag(processedBuffer);

      // 生成缓存控制头
      const cacheControl = `public, max-age=${this.config.cacheTTL}`;

      return {
        data: processedBuffer,
        contentType,
        cacheControl,
        etag,
      };
    } catch (error) {
      this.handleError(error, filename);
    }
  }

  /**
   * 从 GitHub 获取图片
   * 
   * @param filename 文件名
   * @returns 图片 Buffer
   */
  private async fetchFromGitHub(filename: string): Promise<Buffer> {
    const githubUrl = this.cdnService.generateGitHubRawURL(filename);

    this.logger.log(`Fetching from GitHub: ${githubUrl}`);

    try {
      const response = await axios.get(githubUrl, {
        responseType: 'arraybuffer',
        timeout: this.cdnService.getConfig().timeout,
        headers: {
          'User-Agent': 'NebulaStudyNexus-ProxyService/1.0',
        },
      });

      return Buffer.from(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        // 处理 GitHub API 限流
        if (axiosError.response?.status === 403) {
          const rateLimitRemaining = axiosError.response.headers['x-ratelimit-remaining'];
          const rateLimitReset = axiosError.response.headers['x-ratelimit-reset'];
          
          this.logger.error('GitHub API rate limit exceeded', {
            remaining: rateLimitRemaining,
            reset: rateLimitReset,
            filename,
          });

          throw new HttpException(
            {
              statusCode: HttpStatus.TOO_MANY_REQUESTS,
              message: 'GitHub API rate limit exceeded',
              retryAfter: rateLimitReset ? new Date(parseInt(rateLimitReset) * 1000).toISOString() : undefined,
            },
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }

        // 处理文件不存在
        if (axiosError.response?.status === 404) {
          this.logger.error(`Image not found on GitHub: ${filename}`);
          throw new HttpException(
            {
              statusCode: HttpStatus.NOT_FOUND,
              message: `Image not found: ${filename}`,
            },
            HttpStatus.NOT_FOUND,
          );
        }
      }

      throw error;
    }
  }

  /**
   * 压缩图片
   * 
   * 使用 sharp 库根据参数压缩图片
   * 
   * @param buffer 原始图片 Buffer
   * @param width 目标宽度
   * @param height 目标高度
   * @param quality 图片质量（1-100）
   * @returns 压缩后的 Buffer
   */
  private async compressImage(
    buffer: Buffer,
    width?: number,
    height?: number,
    quality?: number,
  ): Promise<Buffer> {
    let sharpInstance = sharp(buffer);

    // 调整尺寸
    if (width || height) {
      sharpInstance = sharpInstance.resize(width, height, {
        fit: 'inside', // 保持宽高比，图片完全包含在指定尺寸内
        withoutEnlargement: true, // 不放大图片
      });
    }

    // 获取图片格式
    const metadata = await sharp(buffer).metadata();
    const format = metadata.format;

    // 根据格式应用质量设置
    if (quality !== undefined) {
      const normalizedQuality = Math.max(1, Math.min(100, quality));
      
      switch (format) {
        case 'jpeg':
        case 'jpg':
          sharpInstance = sharpInstance.jpeg({ quality: normalizedQuality });
          break;
        case 'png':
          // PNG 使用压缩级别（0-9），转换质量值
          const compressionLevel = Math.round((100 - normalizedQuality) / 11);
          sharpInstance = sharpInstance.png({ compressionLevel: Math.max(0, Math.min(9, compressionLevel)) });
          break;
        case 'webp':
          sharpInstance = sharpInstance.webp({ quality: normalizedQuality });
          break;
        default:
          // 其他格式不应用质量设置
          break;
      }
    }

    return sharpInstance.toBuffer();
  }

  /**
   * 生成 ETag
   * 
   * 使用 MD5 哈希生成 ETag
   * 
   * @param buffer 图片 Buffer
   * @returns ETag 字符串
   */
  private generateETag(buffer: Buffer): string {
    const hash = crypto.createHash('md5').update(buffer).digest('hex');
    return `"${hash}"`;
  }

  /**
   * 根据图片格式获取 Content-Type
   * 
   * @param format 图片格式
   * @returns Content-Type 字符串
   */
  private getContentType(format?: string): string {
    const contentTypeMap: Record<string, string> = {
      jpeg: 'image/jpeg',
      jpg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
      svg: 'image/svg+xml',
      bmp: 'image/bmp',
      tiff: 'image/tiff',
    };

    return contentTypeMap[format || ''] || 'application/octet-stream';
  }

  /**
   * 处理错误
   * 
   * 统一的错误处理逻辑
   * 
   * @param error 错误对象
   * @param filename 文件名
   */
  private handleError(error: any, filename: string): never {
    // 如果已经是 HttpException，直接抛出
    if (error instanceof HttpException) {
      throw error;
    }

    // 记录未预期的错误
    this.logger.error('Proxy service error', {
      filename,
      error: error.message,
      stack: error.stack,
    });

    // 抛出内部服务器错误
    throw new HttpException(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to proxy image',
        error: error.message,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
