/**
 * 学生管理控制器（Admin 管理端）
 *
 * 提供管理员对学生的管理操作
 */
import { Controller, Get, Param, Patch, Delete, Query, Body, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StudentService } from './student.service';
import { QueryStudentDto, UpdateStudentStatusDto } from './dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserType } from '@/common/decorators/user-type.decorator';
import { UserRole } from '@/modules/user/enums/user-role.enum';

@ApiTags('students')
@ApiBearerAuth('JWT-auth')
@Controller('students')
@UserType('admin')
@Roles(UserRole.ADMIN)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  @ApiOperation({ summary: '学生列表（分页+搜索+筛选）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(@Query() query: QueryStudentDto) {
    return this.studentService.findAllPaginated(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '学生详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '学生不存在' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.studentService.findById(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: '启用/禁用学生' })
  @ApiResponse({ status: 200, description: '操作成功' })
  @ApiResponse({ status: 404, description: '学生不存在' })
  async updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateStudentStatusDto) {
    return this.studentService.updateStatus(id, dto.isActive);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除学生' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '学生不存在' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.studentService.remove(id);
    return { message: '删除成功' };
  }
}
