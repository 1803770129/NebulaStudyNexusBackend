/**
 * UploadService 单元测试
 */
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { UploadService } from './upload.service';
import { CDNService } from './cdn/cdn.service';
import * as fs from 'fs';
import * as path from 'path';

describe('UploadService', () => {
  let service: UploadService;
  let configService: ConfigService;
  let cdnService: CDNService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('api'),
          },
        },
        {
          provide: CDNService,
          useValue: {
            generateFallbackURLs: jest.fn().mockReturnValue({
              filename: 'test.jpg',
              urls: [
                'https://cdn.statically.io/gh/test/repo@main/images/test.jpg',
                'https://raw.githubusercontent.com/test/repo/main/images/test.jpg',
                '/api/upload/proxy/test.jpg',
              ],
              primary: 'https://cdn.statically.io/gh/test/repo@main/images/test.jpg',
            }),
            generateStaticallyURL: jest.fn().mockReturnValue(
              'https://cdn.statically.io/gh/test/repo@main/images/test.jpg',
            ),
            generateGitHubRawURL: jest.fn().mockReturnValue(
              'https://raw.githubusercontent.com/test/repo/main/images/test.jpg',
            ),
            generateProxyURL: jest.fn().mockReturnValue('/api/upload/proxy/test.jpg'),
          },
        },
      ],
    }).compile();

    service = module.get<UploadService>(UploadService);
    configService = module.get<ConfigService>(ConfigService);
    cdnService = module.get<CDNService>(CDNService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateImage', () => {
    it('should accept valid JPEG image', () => {
      const result = service.validateImage({
        mimetype: 'image/jpeg',
        size: 1024 * 1024, // 1MB
      });
      expect(result).toBe(true);
    });

    it('should accept valid PNG image', () => {
      const result = service.validateImage({
        mimetype: 'image/png',
        size: 2 * 1024 * 1024, // 2MB
      });
      expect(result).toBe(true);
    });

    it('should accept valid GIF image', () => {
      const result = service.validateImage({
        mimetype: 'image/gif',
        size: 1024 * 1024,
      });
      expect(result).toBe(true);
    });

    it('should accept valid WebP image', () => {
      const result = service.validateImage({
        mimetype: 'image/webp',
        size: 1024 * 1024,
      });
      expect(result).toBe(true);
    });

    it('should reject unsupported file type', () => {
      const result = service.validateImage({
        mimetype: 'application/pdf',
        size: 1024 * 1024,
      });
      expect(result).toBe(false);
    });

    it('should reject file exceeding 5MB', () => {
      const result = service.validateImage({
        mimetype: 'image/jpeg',
        size: 6 * 1024 * 1024, // 6MB
      });
      expect(result).toBe(false);
    });

    it('should accept file exactly at 5MB limit', () => {
      const result = service.validateImage({
        mimetype: 'image/jpeg',
        size: 5 * 1024 * 1024, // 5MB
      });
      expect(result).toBe(true);
    });
  });

  describe('getValidationError', () => {
    it('should return null for valid file', () => {
      const error = service.getValidationError({
        mimetype: 'image/jpeg',
        size: 1024 * 1024,
      });
      expect(error).toBeNull();
    });

    it('should return error message for unsupported type', () => {
      const error = service.getValidationError({
        mimetype: 'application/pdf',
        size: 1024 * 1024,
      });
      expect(error).toContain('不支持的文件类型');
      expect(error).toContain('application/pdf');
    });

    it('should return error message for oversized file', () => {
      const error = service.getValidationError({
        mimetype: 'image/jpeg',
        size: 6 * 1024 * 1024,
      });
      expect(error).toContain('文件大小超过限制');
      expect(error).toContain('5MB');
    });
  });

  describe('uploadImage', () => {
    it('should throw BadRequestException for invalid file type', async () => {
      const buffer = Buffer.from('test');
      await expect(
        service.uploadImage(buffer, 'test.pdf', 'application/pdf', 1024),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for oversized file', async () => {
      const buffer = Buffer.from('test');
      await expect(
        service.uploadImage(buffer, 'test.jpg', 'image/jpeg', 6 * 1024 * 1024),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
