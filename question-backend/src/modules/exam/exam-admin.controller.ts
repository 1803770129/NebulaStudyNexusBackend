import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser, AdminJwtPayload } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserType } from '@/common/decorators/user-type.decorator';
import { UserRole } from '@/modules/user/enums/user-role.enum';
import { CreateExamPaperDto, QueryExamPaperDto, UpdateExamPaperDto } from './dto';
import { ExamService } from './exam.service';

@ApiTags('exam-papers')
@ApiBearerAuth('JWT-auth')
@Controller('exam/papers')
@UserType('admin')
@Roles(UserRole.ADMIN)
export class ExamAdminController {
  constructor(private readonly examService: ExamService) {}

  @Post()
  @ApiOperation({ summary: 'Create exam paper' })
  @ApiResponse({ status: 201, description: 'Created successfully' })
  create(@Body() dto: CreateExamPaperDto, @CurrentUser() user: AdminJwtPayload) {
    return this.examService.createPaper(user.sub, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update draft exam paper' })
  @ApiResponse({ status: 200, description: 'Updated successfully' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateExamPaperDto) {
    return this.examService.updatePaper(id, dto);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish exam paper' })
  @ApiResponse({ status: 201, description: 'Published successfully' })
  publish(@Param('id', ParseUUIDPipe) id: string) {
    return this.examService.publishPaper(id);
  }

  @Get()
  @ApiOperation({ summary: 'Query exam paper list (admin)' })
  @ApiResponse({ status: 200, description: 'Fetched successfully' })
  findAll(@Query() queryDto: QueryExamPaperDto) {
    return this.examService.listAdminPapers(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get exam paper detail (admin)' })
  @ApiResponse({ status: 200, description: 'Fetched successfully' })
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.examService.getPaperByIdForAdmin(id);
  }
}
