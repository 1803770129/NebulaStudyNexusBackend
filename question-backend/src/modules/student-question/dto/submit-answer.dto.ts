/**
 * 提交答案 DTO
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class SubmitAnswerDto {
  @ApiProperty({
    description:
      '提交的答案（格式因题型而异：单选 "A"，多选 ["A","C"]，判断 true/false，填空 ["答案1"]，简答 "文本"）',
    examples: ['"A"', '["A","C"]', 'true', '["答案1","答案2"]', '"简答文本"'],
  })
  @IsNotEmpty({ message: '答案不能为空' })
  answer: any;

  @ApiPropertyOptional({ description: '做题用时（秒）', minimum: 0 })
  @IsInt({ message: '用时必须为整数' })
  @Min(0)
  @IsOptional()
  duration?: number;
}
