import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserType } from '@/common/decorators/user-type.decorator';
import { CurrentUser, StudentJwtPayload } from '@/common/decorators/current-user.decorator';
import { PracticeSessionService } from './practice-session.service';
import {
  CreatePracticeSessionDto,
  QueryPracticeSessionDto,
  SubmitPracticeSessionItemDto,
} from './dto';

@ApiTags('practice-sessions')
@ApiBearerAuth('JWT-auth')
@Controller('student/practice-sessions')
@UserType('student')
export class PracticeSessionController {
  constructor(private readonly practiceSessionService: PracticeSessionService) {}

  @Post()
  @ApiOperation({ summary: '创建练习会话' })
  @ApiResponse({ status: 201, description: '创建成功' })
  create(@Body() dto: CreatePracticeSessionDto, @CurrentUser() user: StudentJwtPayload) {
    return this.practiceSessionService.createSession(user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: '获取练习会话列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findAll(@Query() queryDto: QueryPracticeSessionDto, @CurrentUser() user: StudentJwtPayload) {
    return this.practiceSessionService.findAll(user.sub, queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取练习会话详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '会话不存在' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: StudentJwtPayload) {
    return this.practiceSessionService.findById(user.sub, id);
  }

  @Get(':id/current')
  @ApiOperation({ summary: '获取当前待答题目' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getCurrentItem(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: StudentJwtPayload) {
    return this.practiceSessionService.getCurrentItem(user.sub, id);
  }

  @Post(':id/items/:itemId/submit')
  @ApiOperation({ summary: '提交会话中的单题答案' })
  @ApiResponse({ status: 201, description: '提交成功' })
  submitItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: SubmitPracticeSessionItemDto,
    @CurrentUser() user: StudentJwtPayload,
  ) {
    return this.practiceSessionService.submitItem(user.sub, id, itemId, dto);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: '主动完成会话' })
  @ApiResponse({ status: 201, description: '操作成功' })
  complete(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: StudentJwtPayload) {
    return this.practiceSessionService.completeSession(user.sub, id);
  }
}
