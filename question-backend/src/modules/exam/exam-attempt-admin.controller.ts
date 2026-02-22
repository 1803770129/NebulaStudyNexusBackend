import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserType } from '@/common/decorators/user-type.decorator';
import { UserRole } from '@/modules/user/enums/user-role.enum';
import { GradeExamAttemptItemDto, QueryExamAttemptDto } from './dto';
import { ExamTimeoutSchedulerService } from './exam-timeout-scheduler.service';
import { ExamService } from './exam.service';

@ApiTags('exam-attempts-admin')
@ApiBearerAuth('JWT-auth')
@Controller('exam/attempts')
@UserType('admin')
@Roles(UserRole.ADMIN)
export class ExamAttemptAdminController {
  constructor(
    private readonly examTimeoutSchedulerService: ExamTimeoutSchedulerService,
    private readonly examService: ExamService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Query exam attempt list (admin)' })
  @ApiResponse({ status: 200, description: 'Fetched successfully' })
  findAll(@Query() queryDto: QueryExamAttemptDto) {
    return this.examService.listAdminAttempts(queryDto);
  }

  @Post('timeout-scan')
  @ApiOperation({ summary: 'Manually scan and auto-finish timeout attempts' })
  @ApiResponse({ status: 201, description: 'Scan completed' })
  manualTimeoutScan() {
    return this.examTimeoutSchedulerService.manualScan();
  }

  @Get('timeout-summary')
  @ApiOperation({ summary: 'Get timeout attempt summary' })
  @ApiResponse({ status: 200, description: 'Summary fetched' })
  getTimeoutSummary() {
    return this.examTimeoutSchedulerService.getTimeoutSummary();
  }

  @Post(':id/items/:itemId/grade')
  @ApiOperation({ summary: 'Grade manual exam attempt item' })
  @ApiResponse({ status: 201, description: 'Graded successfully' })
  gradeItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: GradeExamAttemptItemDto,
  ) {
    return this.examService.gradeAttemptItem(id, itemId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get exam attempt detail (admin)' })
  @ApiResponse({ status: 200, description: 'Fetched successfully' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.examService.getAttemptByIdForAdmin(id);
  }
}
