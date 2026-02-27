import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Multer } from 'multer';
import { UserType } from '@/common/decorators/user-type.decorator';
import { UploadService } from './upload.service';

@ApiTags('student-upload')
@ApiBearerAuth('JWT-auth')
@Controller('student/upload')
@UserType('student')
export class StudentUploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @ApiOperation({ summary: 'Upload image for student app' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (jpg, png, gif, webp, max 5MB)',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Uploaded successfully' })
  @ApiResponse({ status: 400, description: 'File validation failed' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Multer.File) {
    if (!file) {
      throw new BadRequestException('Please select an image file');
    }

    return this.uploadService.uploadImage(file.buffer, file.originalname, file.mimetype, file.size);
  }
}
