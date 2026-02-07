/**
 * 图片上传控制器
 */
import {
  Controller,
  Post,
  Get,
  Param,
  Res,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { UploadService } from './upload.service';
import { Public } from '@/common/decorators/public.decorator';
import { Multer } from 'multer';

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '上传图片' })
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

  @Public()
  @Get('images/:filename')
  @ApiOperation({ summary: '获取图片' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '图片不存在' })
  async getImage(@Param('filename') filename: string, @Res() res: Response) {
    if (!this.uploadService.imageExists(filename)) {
      throw new NotFoundException('图片不存在');
    }

    const filepath = this.uploadService.getImagePath(filename);
    res.sendFile(filepath);
  }
}
