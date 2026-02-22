/**
 * 学生端题目控制器
 *
 * 提供学生端的题目浏览、做题提交、收藏、错题本、做题记录和统计接口
 * 所有接口需要 student 类型 JWT
 */
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
import { UserType } from '@/common/decorators/user-type.decorator';
import { CurrentUser, StudentJwtPayload } from '@/common/decorators/current-user.decorator';
import { StudentQuestionService } from './student-question.service';
import { StudentStatisticsService } from './student-statistics.service';
import { PracticeSessionService } from './practice-session.service';
import {
  CreateReviewSessionDto,
  StudentQueryQuestionDto,
  SubmitAnswerDto,
  QueryPracticeRecordDto,
  QueryFavoriteDto,
  QueryWrongBookDto,
  QueryTodayReviewDto,
  QueryReviewHistoryDto,
  SubmitPracticeSessionItemDto,
} from './dto';
import { PracticeSessionMode } from './enums';

@ApiTags('student-questions')
@ApiBearerAuth('JWT-auth')
@Controller('student')
@UserType('student')
export class StudentQuestionController {
  constructor(
    private readonly studentQuestionService: StudentQuestionService,
    private readonly studentStatisticsService: StudentStatisticsService,
    private readonly practiceSessionService: PracticeSessionService,
  ) {}

  // ─── 题目浏览 ──────────────────────────────────────────────

  @Get('questions')
  @ApiOperation({ summary: '获取题目列表（不含答案/解析）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findAll(@Query() queryDto: StudentQueryQuestionDto) {
    return this.studentQuestionService.findAll(queryDto);
  }

  @Get('questions/:id')
  @ApiOperation({ summary: '获取题目详情（不含答案/解析）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '题目不存在' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.studentQuestionService.findById(id);
  }

  // ─── 做题提交 ──────────────────────────────────────────────

  @Post('questions/:id/submit')
  @ApiOperation({ summary: '提交答案' })
  @ApiResponse({ status: 201, description: '提交成功，返回判题结果与正确答案' })
  @ApiResponse({ status: 404, description: '题目不存在' })
  submitAnswer(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SubmitAnswerDto,
    @CurrentUser() user: StudentJwtPayload,
  ) {
    return this.studentQuestionService.submitAnswer(user.sub, id, dto);
  }

  // ─── 收藏 ─────────────────────────────────────────────────

  @Post('questions/:id/favorite')
  @ApiOperation({ summary: '收藏/取消收藏（toggle）' })
  @ApiResponse({ status: 201, description: '操作成功' })
  @ApiResponse({ status: 404, description: '题目不存在' })
  toggleFavorite(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: StudentJwtPayload) {
    return this.studentQuestionService.toggleFavorite(user.sub, id);
  }

  @Get('favorites')
  @ApiOperation({ summary: '获取收藏列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getFavorites(@Query() queryDto: QueryFavoriteDto, @CurrentUser() user: StudentJwtPayload) {
    return this.studentQuestionService.getFavorites(user.sub, queryDto);
  }

  // ─── 错题本 ────────────────────────────────────────────────

  @Get('wrong-book')
  @ApiOperation({ summary: '获取错题列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getWrongBook(@Query() queryDto: QueryWrongBookDto, @CurrentUser() user: StudentJwtPayload) {
    return this.studentQuestionService.getWrongBook(user.sub, queryDto);
  }

  @Get('review/today')
  @ApiOperation({ summary: '获取今日到期待复习列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getTodayReviewQueue(
    @Query() queryDto: QueryTodayReviewDto,
    @CurrentUser() user: StudentJwtPayload,
  ) {
    return this.studentQuestionService.getTodayReviewQueue(user.sub, queryDto);
  }

  @Post('review/start')
  @ApiOperation({ summary: 'Create today review session' })
  @ApiResponse({ status: 201, description: 'Review session created' })
  startReviewSession(@Body() dto: CreateReviewSessionDto, @CurrentUser() user: StudentJwtPayload) {
    return this.practiceSessionService.createSession(user.sub, {
      mode: PracticeSessionMode.REVIEW,
      questionCount: dto.questionCount,
    });
  }

  @Get('review/history')
  @ApiOperation({ summary: 'Get review submit history' })
  @ApiResponse({ status: 200, description: 'Success' })
  getReviewHistory(
    @Query() queryDto: QueryReviewHistoryDto,
    @CurrentUser() user: StudentJwtPayload,
  ) {
    return this.studentQuestionService.getReviewHistory(user.sub, queryDto);
  }

  @Post('review/items/:itemId/submit')
  @ApiOperation({ summary: 'Submit answer for current review item' })
  @ApiResponse({ status: 201, description: 'Review item submitted' })
  submitReviewItem(
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: SubmitPracticeSessionItemDto,
    @CurrentUser() user: StudentJwtPayload,
  ) {
    return this.practiceSessionService.submitReviewItem(user.sub, itemId, dto);
  }

  @Patch('wrong-book/:id/master')
  @ApiOperation({ summary: '标记已掌握/取消掌握' })
  @ApiResponse({ status: 200, description: '操作成功' })
  @ApiResponse({ status: 404, description: '错题记录不存在' })
  toggleMastered(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: StudentJwtPayload) {
    return this.studentQuestionService.toggleMastered(user.sub, id);
  }

  @Delete('wrong-book/:id')
  @ApiOperation({ summary: '从错题本移除' })
  @ApiResponse({ status: 200, description: '移除成功' })
  @ApiResponse({ status: 404, description: '错题记录不存在' })
  removeFromWrongBook(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: StudentJwtPayload,
  ) {
    return this.studentQuestionService.removeFromWrongBook(user.sub, id);
  }

  // ─── 做题记录 & 统计 ──────────────────────────────────────

  @Get('practice-records')
  @ApiOperation({ summary: '获取做题记录' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getPracticeRecords(
    @Query() queryDto: QueryPracticeRecordDto,
    @CurrentUser() user: StudentJwtPayload,
  ) {
    return this.studentQuestionService.getPracticeRecords(user.sub, queryDto);
  }

  @Get('practice-records/:id')
  @ApiOperation({ summary: 'Get practice record detail' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Practice record not found' })
  getPracticeRecordById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: StudentJwtPayload,
  ) {
    return this.studentQuestionService.getPracticeRecordById(user.sub, id);
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取做题统计概览' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getStatistics(@CurrentUser() user: StudentJwtPayload) {
    return this.studentStatisticsService.getStatistics(user.sub);
  }
}
