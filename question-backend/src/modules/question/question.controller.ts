/**
 * 题目控制器
 */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { QuestionService } from './question.service';
import { CreateQuestionDto, UpdateQuestionDto, QueryQuestionDto, ChangeQuestionStatusDto } from './dto';
import { CurrentUser, JwtPayload } from '@/common/decorators/current-user.decorator';
import { UserType } from '@/common/decorators/user-type.decorator';

@ApiTags('questions')
@ApiBearerAuth('JWT-auth')
@Controller('questions')
@UserType('admin')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post()
  @ApiOperation({ summary: '创建题目' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '参数验证失败' })
  create(@Body() createQuestionDto: CreateQuestionDto, @CurrentUser() user: JwtPayload) {
    return this.questionService.create(createQuestionDto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: '获取题目列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findAll(@Query() queryDto: QueryQuestionDto) {
    return this.questionService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取题目详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '题目不存在' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.questionService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新题目' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '题目不存在' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateQuestionDto: UpdateQuestionDto) {
    return this.questionService.update(id, updateQuestionDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: '变更题目状态（审核/发布/归档）' })
  @ApiResponse({ status: 200, description: '状态变更成功' })
  @ApiResponse({ status: 404, description: '题目不存在' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChangeQuestionStatusDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.questionService.changeStatus(id, dto.status, user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除题目' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '题目不存在' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.questionService.remove(id);
  }
}
