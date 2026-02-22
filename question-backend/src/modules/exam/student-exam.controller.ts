import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser, StudentJwtPayload } from '@/common/decorators/current-user.decorator';
import { UserType } from '@/common/decorators/user-type.decorator';
import { QueryExamAttemptDto, QueryExamPaperDto, SubmitExamItemDto } from './dto';
import { ExamService } from './exam.service';

@ApiTags('student-exams')
@ApiBearerAuth('JWT-auth')
@Controller('student/exams')
@UserType('student')
export class StudentExamController {
  constructor(private readonly examService: ExamService) {}

  @Get('papers')
  @ApiOperation({ summary: 'Query published exam papers for student' })
  @ApiResponse({ status: 200, description: 'Fetched successfully' })
  listPublishedPapers(@Query() queryDto: QueryExamPaperDto) {
    return this.examService.listStudentPapers(queryDto);
  }

  @Get('attempts')
  @ApiOperation({ summary: 'Query student exam attempts' })
  @ApiResponse({ status: 200, description: 'Fetched successfully' })
  listAttempts(@Query() queryDto: QueryExamAttemptDto, @CurrentUser() user: StudentJwtPayload) {
    return this.examService.listStudentAttempts(user.sub, queryDto);
  }

  @Post(':paperId/start')
  @ApiOperation({ summary: 'Start exam attempt' })
  @ApiResponse({ status: 201, description: 'Attempt started' })
  startExam(
    @Param('paperId', ParseUUIDPipe) paperId: string,
    @CurrentUser() user: StudentJwtPayload,
  ) {
    return this.examService.startExam(user.sub, paperId);
  }

  @Post(':attemptId/items/:itemId/submit')
  @ApiOperation({ summary: 'Submit exam attempt item' })
  @ApiResponse({ status: 201, description: 'Item submitted' })
  submitItem(
    @Param('attemptId', ParseUUIDPipe) attemptId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: SubmitExamItemDto,
    @CurrentUser() user: StudentJwtPayload,
  ) {
    return this.examService.submitAttemptItem(user.sub, attemptId, itemId, dto);
  }

  @Post(':attemptId/finish')
  @ApiOperation({ summary: 'Finish exam attempt and get report' })
  @ApiResponse({ status: 201, description: 'Exam finished' })
  finishExam(
    @Param('attemptId', ParseUUIDPipe) attemptId: string,
    @CurrentUser() user: StudentJwtPayload,
  ) {
    return this.examService.finishExam(user.sub, attemptId);
  }

  @Get(':attemptId/current')
  @ApiOperation({ summary: 'Get current exam item for resume' })
  @ApiResponse({ status: 200, description: 'Fetched successfully' })
  getCurrent(
    @Param('attemptId', ParseUUIDPipe) attemptId: string,
    @CurrentUser() user: StudentJwtPayload,
  ) {
    return this.examService.getAttemptCurrent(user.sub, attemptId);
  }

  @Get(':attemptId/report')
  @ApiOperation({ summary: 'Get exam report' })
  @ApiResponse({ status: 200, description: 'Fetched successfully' })
  getReport(
    @Param('attemptId', ParseUUIDPipe) attemptId: string,
    @CurrentUser() user: StudentJwtPayload,
  ) {
    return this.examService.getExamReport(user.sub, attemptId);
  }
}
