import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { Multer } from 'multer';

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '上传图片到 GitHub' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '图片文件 (支持 jpg, png, gif, webp，最大 5MB)',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: '上传成功' })
  @ApiResponse({ status: 400, description: '文件验证失败' })
  @UseInterceptors(FileInterceptor('file'))
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
}