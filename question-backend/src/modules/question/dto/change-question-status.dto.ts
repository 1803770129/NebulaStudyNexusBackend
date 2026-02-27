import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { QuestionStatus } from '../enums/question-status.enum';

export class ChangeQuestionStatusDto {
  @ApiProperty({ description: '目标状态', enum: QuestionStatus })
  @IsEnum(QuestionStatus, { message: '无效的题目状态' })
  status: QuestionStatus;
}
