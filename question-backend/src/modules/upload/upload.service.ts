/**
 * 图片上传服务
 * 
 * 职责：
 * 1. 验证文件类型和大小
 * 2. 保存文件到本地存储
 * 3. 返回文件访问 URL
 */
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  /** 文件访问 URL */
  url: string;
  /** 文件名 */
  filename: string;
  /** 文件大小 */
  size: number;
}

@Injectable()
export class UploadService {
  /** 允许的图片类型 */
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  /** 最大文件大小 (5MB) */
  private readonly maxFileSize = 5 * 1024 * 1024;

  /** 上传目录 */
  private readonly uploadDir: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadDir = path.join(process.cwd(), 'uploads', 'images');
    this.ensureUploadDir();
  }

  /**
   * 确保上传目录存在
   */
  private ensureUploadDir(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * 验证图片文件
   * @param file 文件信息
   * @returns 是否有效
   */
  validateImage(file: { mimetype: string; size: number }): boolean {
    return (
      this.allowedMimeTypes.includes(file.mimetype) &&
      file.size <= this.maxFileSize
    );
  }

  /**
   * 获取文件验证错误信息
   * @param file 文件信息
   * @returns 错误信息，如果验证通过则返回 null
   */
  getValidationError(file: { mimetype: string; size: number }): string | null {
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      return `不支持的文件类型: ${file.mimetype}。支持的类型: jpg, png, gif, webp`;
    }
    if (file.size > this.maxFileSize) {
      return `文件大小超过限制: ${(file.size / 1024 / 1024).toFixed(2)}MB。最大允许: 5MB`;
    }
    return null;
  }

  /**
   * 上传图片
   * @param file 文件 Buffer
   * @param originalname 原始文件名
   * @param mimetype 文件类型
   * @param size 文件大小
   * @returns 上传结果
   */
  async uploadImage(
    file: Buffer,
    originalname: string,
    mimetype: string,
    size: number,
  ): Promise<UploadResult> {
    // 验证文件
    const validationError = this.getValidationError({ mimetype, size });
    if (validationError) {
      throw new BadRequestException(validationError);
    }

    // 生成唯一文件名
    const ext = path.extname(originalname);
    const filename = `${uuidv4()}${ext}`;
    const filepath = path.join(this.uploadDir, filename);

    // 保存文件
    await fs.promises.writeFile(filepath, file);

    // 生成访问 URL
    const apiPrefix = this.configService.get<string>('apiPrefix') || 'api';
    const url = `/${apiPrefix}/upload/images/${filename}`;

    return {
      url,
      filename,
      size,
    };
  }

  /**
   * 获取图片文件路径
   * @param filename 文件名
   * @returns 文件路径
   */
  getImagePath(filename: string): string {
    return path.join(this.uploadDir, filename);
  }

  /**
   * 检查图片是否存在
   * @param filename 文件名
   * @returns 是否存在
   */
  imageExists(filename: string): boolean {
    const filepath = this.getImagePath(filename);
    return fs.existsSync(filepath);
  }
}
