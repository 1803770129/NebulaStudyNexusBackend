/**
 * 图片上传模块
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { CDNService } from './cdn/cdn.service';
import { MigrationService } from './cdn/migration.service';
import { Question } from '@/modules/question/entities/question.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Question]),
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService, CDNService, MigrationService],
  exports: [UploadService, CDNService, MigrationService],
})
export class UploadModule {}
