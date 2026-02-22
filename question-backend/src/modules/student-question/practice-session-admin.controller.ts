import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserType } from '@/common/decorators/user-type.decorator';
import { UserRole } from '@/modules/user/enums/user-role.enum';
import { PracticeSessionService } from './practice-session.service';
import { QueryAdminPracticeSessionDto } from './dto';

@ApiTags('admin-practice-sessions')
@ApiBearerAuth('JWT-auth')
@Controller('admin/practice-sessions')
@UserType('admin')
@Roles(UserRole.ADMIN)
export class PracticeSessionAdminController {
  constructor(private readonly practiceSessionService: PracticeSessionService) {}

  @Get()
  @ApiOperation({ summary: '管理员分页查询练习会话' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findAll(@Query() queryDto: QueryAdminPracticeSessionDto) {
    return this.practiceSessionService.findAllForAdmin(queryDto);
  }

  @Get('stats')
  @ApiOperation({ summary: '管理员查看练习会话统计' })
  @ApiResponse({ status: 200, description: '查询成功' })
  getStats() {
    return this.practiceSessionService.getAdminStats();
  }

  @Get(':id')
  @ApiOperation({ summary: '管理员查看练习会话详情' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '会话不存在' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.practiceSessionService.findByIdForAdmin(id);
  }
}
