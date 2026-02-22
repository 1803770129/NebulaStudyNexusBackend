import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { KnowledgePointService } from './knowledge-point.service';
import { CreateKnowledgePointDto } from './dto/create-knowledge-point.dto';
import { UpdateKnowledgePointDto } from './dto/update-knowledge-point.dto';
import { QueryKnowledgePointDto } from './dto/query-knowledge-point.dto';

@ApiTags('knowledge-points')
@ApiBearerAuth('JWT-auth')
@Controller('knowledge-points')
export class KnowledgePointController {
  constructor(private readonly kpService: KnowledgePointService) {}

  @Post()
  @ApiOperation({
    summary: '创建知识点',
    description: '创建一个新的知识点，支持富文本内容和树形结构',
  })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权，需要登录' })
  @ApiResponse({ status: 409, description: '知识点名称冲突' })
  create(@Body() dto: CreateKnowledgePointDto) {
    return this.kpService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '获取知识点列表', description: '支持分页、搜索、按分类和标签筛选' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findAll(@Query() query: QueryKnowledgePointDto) {
    return this.kpService.findAll(query);
  }

  @Get('tree')
  @ApiOperation({ summary: '获取知识点树', description: '获取树形结构的知识点列表，可按分类筛选' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findTree(@Query('categoryId') categoryId?: string) {
    return this.kpService.findTree(categoryId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取知识点详情', description: '根据 ID 获取知识点的详细信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '知识点不存在' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.kpService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新知识点', description: '更新知识点的信息，支持部分更新' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 404, description: '知识点不存在' })
  @ApiResponse({ status: 409, description: '知识点名称冲突' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateKnowledgePointDto) {
    return this.kpService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除知识点', description: '删除知识点，需要先删除子知识点和关联题目' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 400, description: '有子知识点或关联题目时不能删除' })
  @ApiResponse({ status: 404, description: '知识点不存在' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.kpService.remove(id);
  }
}
