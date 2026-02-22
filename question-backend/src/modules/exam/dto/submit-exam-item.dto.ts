import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class SubmitExamItemDto {
  @ApiProperty({
    description:
      'Submitted answer, format depends on question type: single "A", multi ["A","C"], bool true/false, fill_blank ["a","b"], short_answer "text"',
  })
  @IsNotEmpty()
  answer: any;

  @ApiPropertyOptional({ description: 'Answering duration in seconds', minimum: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  duration?: number;
}
