import { Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserType } from '@/common/decorators/user-type.decorator';
import { UserRole } from '@/modules/user/enums/user-role.enum';
import { ReviewTaskSchedulerService } from './review-task-scheduler.service';

@ApiTags('admin-review-tasks')
@ApiBearerAuth('JWT-auth')
@Controller('admin/review-tasks')
@UserType('admin')
@Roles(UserRole.ADMIN)
export class ReviewTaskAdminController {
  constructor(private readonly reviewTaskSchedulerService: ReviewTaskSchedulerService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate review daily tasks for target date' })
  @ApiResponse({ status: 201, description: 'Generated successfully' })
  generate(@Query('runDate') runDate?: string) {
    return this.reviewTaskSchedulerService.manualGenerate(runDate);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get review daily tasks summary by date' })
  @ApiResponse({ status: 200, description: 'Summary fetched successfully' })
  getSummary(@Query('runDate') runDate?: string) {
    return this.reviewTaskSchedulerService.getSummary(runDate);
  }
}
