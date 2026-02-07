# 上传模块 (Upload Module)

## 模块概述

上传模块负责处理图片上传、存储和访问，支持文件验证、唯一命名等功能。

## 文件结构

```
modules/upload/
├── upload.module.ts
├── upload.controller.ts
└── upload.service.ts
```

## 核心实现

### 服务

```typescript
// upload.service.ts
@Injectable()
export class UploadService {
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  private readonly uploadDir: string;

  constructor(private configService: ConfigService) {
    this.uploadDir = path.join(process.cwd(), 'uploads', 'images');
    this.ensureUploadDir();
  }

  // 确保上传目录存在
  private ensureUploadDir(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  // 验证文件
  getValidationError(file: { mimetype: string; size: number }): string | null {
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      return `不支持的文件类型: ${file.mimetype}`;
    }
    if (file.size > this.maxFileSize) {
      return `文件大小超过限制: ${(file.size / 1024 / 1024).toFixed(2)}MB`;
    }
    return null;
  }

  // 上传图片
  async uploadImage(
    file: Buffer,
    originalname: string,
    mimetype: string,
    size: number,
  ): Promise<UploadResult> {
    // 验证
    const error = this.getValidationError({ mimetype, size });
    if (error) throw new BadRequestException(error);

    // 生成唯一文件名
    const ext = path.extname(originalname);
    const filename = `${uuidv4()}${ext}`;
    const filepath = path.join(this.uploadDir, filename);

    // 保存文件
    await fs.promises.writeFile(filepath, file);

    // 返回访问 URL
    return {
      url: `/api/upload/images/${filename}`,
      filename,
      size,
    };
  }

  // 检查文件是否存在
  imageExists(filename: string): boolean {
    return fs.existsSync(path.join(this.uploadDir, filename));
  }

  // 获取文件路径
  getImagePath(filename: string): string {
    return path.join(this.uploadDir, filename);
  }
}
```

### 控制器

```typescript
// upload.controller.ts
@ApiTags('upload')
@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  async uploadImage(@UploadedFile() file: Multer.File) {
    if (!file) {
      throw new BadRequestException('请选择要上传的文件');
    }
    return this.uploadService.uploadImage(
      file.buffer,
      file.originalname,
      file.mimetype,
      file.size,
    );
  }

  @Public()  // 图片访问不需要认证
  @Get('images/:filename')
  async getImage(@Param('filename') filename: string, @Res() res: Response) {
    if (!this.uploadService.imageExists(filename)) {
      throw new NotFoundException('图片不存在');
    }
    res.sendFile(this.uploadService.getImagePath(filename));
  }
}
```

### 模块配置

```typescript
// upload.module.ts
@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(), // 使用内存存储
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
```

## Docker 持久化

在 `docker-compose.yml` 中挂载上传目录：

```yaml
services:
  api:
    volumes:
      - ./uploads:/app/uploads  # 持久化上传文件
```

## 注意事项

1. **@Public() 装饰器**：图片访问接口需要添加 `@Public()` 跳过 JWT 认证
2. **文件验证**：限制文件类型和大小，防止恶意上传
3. **唯一命名**：使用 UUID 生成文件名，避免冲突
4. **持久化存储**：Docker 部署时需要挂载 volume
