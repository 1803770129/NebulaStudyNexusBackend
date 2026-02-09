/**
 * 图片上传服务 - GitHub 图床
 * 
 * 职责：
 * 1. 验证文件类型和大小
 * 2. 上传文件到 GitHub 仓库
 * 3. 返回 jsDelivr CDN 访问 URL
 */
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
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

  /** GitHub 配置 */
  private readonly githubToken: string;
  private readonly githubRepo: string;
  private readonly githubBranch: string;

  constructor(private readonly configService: ConfigService) {
    this.githubToken = this.configService.get<string>('github.token');
    this.githubRepo = this.configService.get<string>('github.repo');
    this.githubBranch = this.configService.get<string>('github.branch');
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
   * 上传图片到 GitHub
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
    const filePath = `images/${filename}`;

    try {
      // 上传到 GitHub
      const response = await axios.put(
        `https://api.github.com/repos/${this.githubRepo}/contents/${filePath}`,
        {
          message: `Upload ${filename}`,
          content: file.toString('base64'),
          branch: this.githubBranch,
        },
        {
          headers: {
            Authorization: `token ${this.githubToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      // 使用 jsDelivr CDN 加速
      const cdnUrl = `https://cdn.jsdelivr.net/gh/${this.githubRepo}@${this.githubBranch}/${filePath}`;

      return {
        url: cdnUrl,
        filename,
        size,
      };
    } catch (error) {
      if (error.response) {
        throw new BadRequestException(
          `GitHub API 错误: ${error.response.data.message}`,
        );
      }
      throw new BadRequestException('图片上传失败');
    }
  }

  /**
   * 删除 GitHub 仓库中的图片
   * @param filename 文件名
   */
  async deleteImage(filename: string): Promise<void> {
    const filePath = `images/${filename}`;

    try {
      // 获取文件 SHA（删除需要）
      const getResponse = await axios.get(
        `https://api.github.com/repos/${this.githubRepo}/contents/${filePath}`,
        {
          headers: {
            Authorization: `token ${this.githubToken}`,
          },
        },
      );

      const sha = getResponse.data.sha;

      // 删除文件
      await axios.delete(
        `https://api.github.com/repos/${this.githubRepo}/contents/${filePath}`,
        {
          data: {
            message: `Delete ${filename}`,
            sha,
            branch: this.githubBranch,
          },
          headers: {
            Authorization: `token ${this.githubToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (error) {
      throw new BadRequestException('图片删除失败');
    }
  }

  /**
   * 检查图片是否存在（GitHub 仓库中）
   * @param filename 文件名
   * @returns 是否存在
   */
  async imageExists(filename: string): Promise<boolean> {
    const filePath = `images/${filename}`;

    try {
      await axios.get(
        `https://api.github.com/repos/${this.githubRepo}/contents/${filePath}`,
        {
          headers: {
            Authorization: `token ${this.githubToken}`,
          },
        },
      );
      return true;
    } catch {
      return false;
    }
  }
}
