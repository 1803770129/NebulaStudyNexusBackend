/**
 * 更新知识点 DTO
 */
import { PartialType } from '@nestjs/swagger';
import { CreateKnowledgePointDto } from './create-knowledge-point.dto';

/**
 * 更新知识点 DTO
 * 继承 CreateKnowledgePointDto 的所有字段，但都是可选的
 */
export class UpdateKnowledgePointDto extends PartialType(CreateKnowledgePointDto) {}
