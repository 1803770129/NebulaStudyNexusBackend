import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserType } from '@/common/decorators/user-type.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { AdminJwtPayload } from '@/modules/auth/strategies/jwt.strategy';
import { UserRole } from '@/modules/user/enums/user-role.enum';
import { ManualGradingService } from './manual-grading.service';
import { QueryManualGradingTaskDto, ReopenManualGradingDto, SubmitManualGradingDto } from './dto';

@ApiTags('grading')
@ApiBearerAuth('JWT-auth')
@Controller('grading/tasks')
@UserType('admin')
@Roles(UserRole.ADMIN)
export class ManualGradingAdminController {
  constructor(private readonly manualGradingService: ManualGradingService) {}

  @Get()
  @ApiOperation({ summary: '分页查询批改任务' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findAll(@Query() queryDto: QueryManualGradingTaskDto) {
    return this.manualGradingService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '查看批改任务详情' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '任务不存在' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.manualGradingService.findById(id);
  }

  @Post(':id/claim')
  @ApiOperation({ summary: '领取批改任务' })
  @ApiResponse({ status: 201, description: '领取成功' })
  @ApiResponse({ status: 404, description: '任务不存在' })
  @ApiResponse({ status: 409, description: '任务状态冲突' })
  claim(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AdminJwtPayload) {
    return this.manualGradingService.claimTask(id, user.sub);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: '提交批改结果' })
  @ApiResponse({ status: 201, description: '提交成功' })
  @ApiResponse({ status: 404, description: '任务不存在' })
  @ApiResponse({ status: 409, description: '任务状态冲突' })
  submit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SubmitManualGradingDto,
    @CurrentUser() user: AdminJwtPayload,
  ) {
    return this.manualGradingService.submitTask(id, user.sub, dto);
  }

  @Post(':id/reopen')
  @ApiOperation({ summary: '重开已完成批改任务' })
  @ApiResponse({ status: 201, description: '重开成功' })
  @ApiResponse({ status: 404, description: '任务不存在' })
  @ApiResponse({ status: 409, description: '任务状态冲突' })
  reopen(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ReopenManualGradingDto) {
    return this.manualGradingService.reopenTask(id, dto);
  }
}
